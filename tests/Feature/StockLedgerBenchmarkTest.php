<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Item;
use App\Models\StockLedger;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\InventoryReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class StockLedgerBenchmarkTest extends TestCase
{
    use RefreshDatabase;

    private const ITEM_COUNT = 500;

    private const WAREHOUSE_COUNT = 5;

    private const LEDGERS_PER_ITEM = 4;

    public function test_benchmark_stock_ledger_with_500_items_across_warehouses(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        $warehouses = collect(range(1, self::WAREHOUSE_COUNT))->map(
            fn (int $i) => Warehouse::create([
                'code' => 'BENCH-WH-'.$i,
                'name' => 'Gudang Benchmark '.$i,
                'type' => 'main',
            ]),
        );

        $items = collect(range(1, self::ITEM_COUNT))->map(
            fn (int $i) => Item::create([
                'code' => 'BENCH-ITEM-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'name' => 'Item Benchmark '.$i,
                'base_uom' => 'PCS',
            ]),
        );

        $seedStart = microtime(true);
        DB::beginTransaction();
        try {
            $items->each(function (Item $item, int $idx) use ($warehouses, $admin) {
                $warehouse = $warehouses->get($idx % self::WAREHOUSE_COUNT);
                $this->seedLedger($warehouse, $item, $admin, 'in', 10, now()->subDays(30));
                $this->seedLedger($warehouse, $item, $admin, 'in', 5, now()->subDays(10));
                $this->seedLedger($warehouse, $item, $admin, 'out', 3, now()->subDays(2));
                $this->seedLedger($warehouse, $item, $admin, 'in', 2, now());
            });
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
        $seedDuration = microtime(true) - $seedStart;

        $totalLedgers = StockLedger::count();
        $this->assertSame(self::ITEM_COUNT * self::LEDGERS_PER_ITEM, $totalLedgers);

        $filters = [
            'date_from' => now()->startOfMonth()->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
            'page' => 1,
            'all' => true,
        ];

        DB::flushQueryLog();
        DB::enableQueryLog();

        $start = microtime(true);
        $data = app(InventoryReportService::class)->stockLedger(
            $warehouses->pluck('id'),
            null,
            $filters,
        );
        $duration = microtime(true) - $start;

        $queryCount = count(DB::getQueryLog());

        $this->assertCount(self::ITEM_COUNT, $data['groups']);
        $this->assertSame(self::ITEM_COUNT, $data['pagination']['total']);
        $this->assertSame(1000.0, $data['summary']['in']);
        $this->assertSame(1500.0, $data['summary']['out']);
        $this->assertSame(7000.0, $data['summary']['closing']);

        fwrite(STDERR, PHP_EOL);
        fwrite(STDERR, '========================================================'.PHP_EOL);
        fwrite(STDERR, '  BENCHMARK: Kartu Stok ('.self::ITEM_COUNT.' item / '.self::WAREHOUSE_COUNT.' gudang)'.PHP_EOL);
        fwrite(STDERR, '========================================================'.PHP_EOL);
        fwrite(STDERR, sprintf('  Total ledger rows seeded : %d', $totalLedgers).PHP_EOL);
        fwrite(STDERR, sprintf('  Seed duration            : %.3f s', $seedDuration).PHP_EOL);
        fwrite(STDERR, sprintf('  stockLedger() duration   : %.3f s', $duration).PHP_EOL);
        fwrite(STDERR, sprintf('  Database queries         : %d', $queryCount).PHP_EOL);
        fwrite(STDERR, sprintf('  Groups returned          : %d', count($data['groups'])).PHP_EOL);
        fwrite(STDERR, '--------------------------------------------------------'.PHP_EOL);
        fwrite(STDERR, '  (SQLite in-memory; MySQL real-world timing may differ)'.PHP_EOL);
        fwrite(STDERR, '========================================================'.PHP_EOL);
        fwrite(STDERR, PHP_EOL);

        $this->assertLessThan(20, $queryCount, 'Query count should stay low (no N+1).');
    }

    private function seedLedger(Warehouse $warehouse, Item $item, User $creator, string $direction, float $qty, $date): void
    {
        StockLedger::create([
            'warehouse_id' => $warehouse->id,
            'item_id' => $item->id,
            'direction' => $direction,
            'qty' => $qty,
            'unit_cost' => 1000,
            'balance_qty' => $qty,
            'balance_cost' => 1000,
            'created_by' => $creator->id,
            'created_at' => $date,
        ]);
    }
}
