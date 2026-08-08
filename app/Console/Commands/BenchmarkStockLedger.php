<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Item;
use App\Models\StockLedger;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\InventoryReportService;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BenchmarkStockLedger extends Command
{
    protected $signature = 'benchmark:stock-ledger
        {--items=500 : Jumlah item yang di-seed}
        {--warehouses=5 : Jumlah gudang}
        {--per-item=20 : Jumlah ledger per item (rata-rata)}
        {--keep : Jangan hapus data benchmark setelah selesai}';

    protected $description = 'Benchmark performa laporan kartu stok pada MySQL (dataset sintetis).';

    private const ROWS_PER_PAGE = 10;

    public function handle(InventoryReportService $reports): int
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->error('Benchmark ini khusus MySQL. Gunakan DB_DATABASE=wms_bas_benchmark saat menjalankan.');

            return self::FAILURE;
        }

        $itemCount = (int) $this->option('items');
        $warehouseCount = (int) $this->option('warehouses');
        $perItem = (int) $this->option('per-item');
        $keep = (bool) $this->option('keep');

        $this->line('');
        $this->line(sprintf('Benchmark Kartu Stok — %d item / %d gudang / ~%d ledger per item', $itemCount, $warehouseCount, $perItem));
        $this->line('Koneksi: '.DB::connection()->getDriverName().' @ '.config('database.connections.mysql.database'));
        $this->line('');

        $start = microtime(true);
        $this->seed($itemCount, $warehouseCount, $perItem);
        $seedDuration = microtime(true) - $start;

        $totalLedgers = StockLedger::count();
        $this->info(sprintf('Seed selesai: %d ledger dalam %.3f s', $totalLedgers, $seedDuration));

        $warehouseIds = Warehouse::query()->pluck('id');
        $from = now()->subDays(30)->format('Y-m-d');
        $to = now()->format('Y-m-d');

        $this->line('');
        $this->line('─ Skenario 1: Full scan (all=true) ─');

        $full = $this->measure(fn () => $reports->stockLedger($warehouseIds, null, [
            'date_from' => $from, 'date_to' => $to, 'all' => true,
        ]));

        $this->table(
            ['Metrik', 'Nilai'],
            [
                ['Waktu eksekusi', number_format($full['duration'], 3).' s'],
                ['Query', (string) $full['queries']],
                ['Grup (kartu stok)', number_format($full['data']['pagination']['total']).' kartu'],
                ['Baris mutasi dimuat', number_format(collect($full['data']['groups'])->sum(fn ($g) => count($g['rows'])))],
                ['Memori peak', number_format($full['memory'] / 1024 / 1024, 1).' MB'],
            ],
        );

        $this->line('');
        $this->line('─ Skenario 2: Pagination (page=1, 10 kartu/halaman) ─');

        $paged = $this->measure(fn () => $reports->stockLedger($warehouseIds, null, [
            'date_from' => $from, 'date_to' => $to, 'page' => 1,
        ]));

        $this->table(
            ['Metrik', 'Nilai'],
            [
                ['Waktu eksekusi', number_format($paged['duration'], 3).' s'],
                ['Query', (string) $paged['queries']],
                ['Kartu di halaman', (string) count($paged['data']['groups'])],
                ['Total kartu', number_format($paged['data']['pagination']['total'])],
                ['Memori peak', number_format($paged['memory'] / 1024 / 1024, 1).' MB'],
            ],
        );

        $this->line('');
        $this->line('─ Skenario 3: Search server-side ─');

        $search = $this->measure(fn () => $reports->stockLedger($warehouseIds, null, [
            'date_from' => $from, 'date_to' => $to, 'search' => 'Item Benchmark 123',
        ]));

        $this->table(
            ['Metrik', 'Nilai'],
            [
                ['Waktu eksekusi', number_format($search['duration'], 3).' s'],
                ['Query', (string) $search['queries']],
                ['Kartu ditemukan', (string) count($search['data']['groups'])],
            ],
        );

        $this->line('');
        $this->line('─ Ringkasan ─');
        $this->table(
            ['Skenario', 'Durasi', 'Query', 'Keterangan'],
            [
                ['Full scan', number_format($full['duration'], 3).' s', (string) $full['queries'], 'Semua kartu dimuat'],
                ['Pagination', number_format($paged['duration'], 3).' s', (string) $paged['queries'], 'Hanya 10 kartu'],
                ['Search', number_format($search['duration'], 3).' s', (string) $search['queries'], 'Filter teks'],
            ],
        );

        if (! $keep) {
            $this->line('');
            $this->info('Membersihkan data benchmark…');
            StockLedger::query()->delete();
            Item::query()->delete();
            Warehouse::query()->delete();
            User::query()->delete();
        }

        $this->newLine();

        return self::SUCCESS;
    }

    private function seed(int $itemCount, int $warehouseCount, int $perItem): void
    {
        User::query()->delete();
        Warehouse::query()->delete();
        Item::query()->delete();
        StockLedger::query()->delete();

        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        $warehouses = collect(range(1, $warehouseCount))->map(fn (int $i) => Warehouse::create([
            'code' => 'BM-WH-'.$i,
            'name' => 'Gudang Benchmark '.$i,
            'type' => 'main',
        ]));

        $items = collect(range(1, $itemCount))->map(fn (int $i) => Item::create([
            'code' => 'BM-ITEM-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
            'name' => 'Item Benchmark '.$i,
            'base_uom' => 'PCS',
        ]));

        $now = now();
        $chunk = 100;
        $items->chunk($chunk)->each(function (Collection $chunked) use ($warehouses, $perItem, $now, $admin) {
            $records = [];
            $sequence = 0;

            foreach ($chunked as $idx => $item) {
                $warehouse = $warehouses->get($idx % $warehouses->count());
                $opening = 0;

                for ($i = 0; $i < $perItem; $i++) {
                    $direction = $i % 2 === 0 ? 'in' : 'out';
                    $qty = 10;
                    $date = $now->copy()->subDays($i * 3)->setTime(9, 0, 0);
                    $opening = $direction === 'in' ? $opening + $qty : $opening - $qty;

                    $records[] = [
                        'warehouse_id' => $warehouse->id,
                        'item_id' => $item->id,
                        'direction' => $direction,
                        'qty' => $qty,
                        'unit_cost' => 1000,
                        'balance_qty' => max($opening, 0),
                        'balance_cost' => 1000,
                        'created_by' => $admin->id,
                        'created_at' => $date->format('Y-m-d H:i:s'),
                    ];
                }
            }

            foreach (array_chunk($records, 500) as $batch) {
                DB::table('stock_ledgers')->insert($batch);
            }
        });
    }

    private function measure(callable $callback): array
    {
        DB::flushQueryLog();
        DB::enableQueryLog();

        $start = microtime(true);
        $memoryBefore = memory_get_peak_usage();
        $data = $callback();
        $duration = microtime(true) - $start;
        $queries = count(DB::getQueryLog());
        $memory = memory_get_peak_usage() - $memoryBefore;

        return [
            'duration' => $duration,
            'queries' => $queries,
            'memory' => $memory,
            'data' => $data,
        ];
    }
}
