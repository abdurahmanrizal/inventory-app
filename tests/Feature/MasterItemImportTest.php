<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Item;
use App\Models\Uom;
use App\Models\User;
use App\Services\ItemImportWorkbook;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class MasterItemImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_master_menu_selection_and_item_import(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        Uom::create(['code' => 'KG', 'name' => 'Kilogram', 'type' => 'base', 'is_active' => true]);

        $this->actingAs($admin)
            ->get('/operations/master-data?master=item')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Operations/Index')
                ->where('initialMaster', 'item'));

        $csv = implode("\n", [
            'name,base_uom,warehouse_type,min_stock,issue_method,has_batch,has_expired,is_active',
            'Beras Organik,KG,dry,12,fifo,1,0,1',
            'Daging Beku,KG,wet,5,fefo,1,1,1',
        ]);
        $this->actingAs($admin)->post('/operations/master-data/items/import', [
            'file' => UploadedFile::fake()->createWithContent('items.csv', $csv),
        ])->assertRedirect();

        $this->assertSame(2, Item::count());
        $this->assertDatabaseHas('items', [
            'code' => 'BRG-WET-001',
            'name' => 'Daging Beku',
            'reorder_point' => 0,
            'valuation_method' => 'moving_average',
        ]);
    }

    public function test_item_import_template_is_xlsx_with_uom_dropdown(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        Uom::create(['code' => 'PCS', 'name' => 'Pieces', 'type' => 'base', 'is_active' => true]);
        Uom::create(['code' => 'OLD', 'name' => 'Tidak Aktif', 'type' => 'base', 'is_active' => false]);

        $response = $this->actingAs($admin)->get('/operations/master-data/items/import-template');
        $response->assertOk()
            ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $path = tempnam(sys_get_temp_dir(), 'template-test-');
        file_put_contents($path, $response->getContent());
        $zip = new \ZipArchive;
        $this->assertTrue($zip->open($path) === true);
        $itemSheet = $zip->getFromName('xl/worksheets/sheet1.xml');
        $this->assertStringContainsString('UOM_OPTIONS', $itemSheet);
        $this->assertStringNotContainsString('<t>code</t>', $itemSheet);
        $this->assertStringContainsString('PCS', $zip->getFromName('xl/worksheets/sheet2.xml'));
        $this->assertStringNotContainsString('OLD', $zip->getFromName('xl/worksheets/sheet2.xml'));
        $zip->close();
        unlink($path);
    }

    public function test_xlsx_item_template_can_be_imported(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        Uom::create(['code' => 'KG', 'name' => 'Kilogram', 'type' => 'base', 'is_active' => true]);
        $contents = app(ItemImportWorkbook::class)->create([['code' => 'KG', 'name' => 'Kilogram']]);

        $this->actingAs($admin)->post('/operations/master-data/items/import', [
            'file' => UploadedFile::fake()->createWithContent('items.xlsx', $contents),
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('items', [
            'code' => 'BRG-DRY-001',
            'name' => 'Gula Pasir',
            'base_uom' => 'KG',
        ]);
    }

    public function test_xlsx_saved_by_excel_with_shared_strings_can_be_imported(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        Uom::create(['code' => 'KG', 'name' => 'Kilogram', 'type' => 'base', 'is_active' => true]);
        $contents = app(ItemImportWorkbook::class)->create([['code' => 'KG', 'name' => 'Kilogram']]);
        $path = tempnam(sys_get_temp_dir(), 'shared-strings-');
        file_put_contents($path, $contents);

        $zip = new \ZipArchive;
        $this->assertTrue($zip->open($path) === true);
        $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
        $strings = [];
        $sheet = preg_replace_callback(
            '/<c([^>]*) t="inlineStr"><is><t>(.*?)<\/t><\/is><\/c>/',
            function (array $matches) use (&$strings): string {
                $strings[] = html_entity_decode($matches[2], ENT_XML1 | ENT_QUOTES, 'UTF-8');

                return '<c'.$matches[1].' t="s"><v>'.(count($strings) - 1).'</v></c>';
            },
            $sheet,
        );
        $sharedStrings = collect($strings)->map(
            fn (string $value) => '<si><t>'.htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8').'</t></si>'
        )->implode('');
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheet);
        $zip->addFromString(
            'xl/sharedStrings.xml',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'.$sharedStrings.'</sst>',
        );
        $zip->close();

        $this->actingAs($admin)->post('/operations/master-data/items/import', [
            'file' => UploadedFile::fake()->createWithContent('items.xlsx', file_get_contents($path)),
        ])->assertRedirect()->assertSessionHasNoErrors();

        unlink($path);
        $this->assertDatabaseHas('items', ['name' => 'Gula Pasir', 'code' => 'BRG-DRY-001']);
    }

    public function test_item_form_does_not_require_reorder_point_or_hpp(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        Uom::create(['code' => 'KG', 'name' => 'Kilogram', 'type' => 'base', 'is_active' => true]);

        $this->actingAs($admin)->post('/operations/master-data/items', [
            'code' => 'FORM-001',
            'name' => 'Item Form',
            'base_uom' => 'KG',
            'warehouse_type' => 'dry',
            'min_stock' => 0,
            'issue_method' => 'fifo',
            'has_batch' => true,
            'has_expired' => false,
            'is_active' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('items', ['code' => 'FORM-001', 'reorder_point' => 0]);
    }
}
