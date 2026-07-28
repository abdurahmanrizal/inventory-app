<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use RuntimeException;

class InventoryReportExport
{
    public function xlsx(string $report, array $data, array $filters, ?string $warehouseName): string
    {
        [$headers, $rows] = $this->table($report, $data);
        $title = $this->title($report);
        $meta = [
            ['Laporan', $title],
            ['Gudang', $warehouseName ?: 'Semua gudang'],
            ['Periode', ($filters['date_from'] ?? '-').' s/d '.($filters['date_to'] ?? '-')],
            ['Dicetak', now()->format('d/m/Y H:i')],
        ];
        $sheetRows = array_merge($meta, [[]], [$headers], $rows);
        $spreadsheet = new Spreadsheet;
        $worksheet = $spreadsheet->getActiveSheet();
        $worksheet->setTitle('Laporan Persediaan');
        $columnCount = count($headers);
        $lastColumn = Coordinate::stringFromColumnIndex($columnCount);

        foreach ($sheetRows as $rowIndex => $values) {
            $excelRow = $rowIndex + 1;
            $rowType = is_array($values) ? ($values['_type'] ?? null) : null;
            $values = $rowType ? $values['cells'] : $values;

            foreach (array_values($values) as $columnIndex => $value) {
                $worksheet->setCellValue(
                    Coordinate::stringFromColumnIndex($columnIndex + 1).$excelRow,
                    $value,
                );
            }

            if ($rowType === 'group') {
                $worksheet->mergeCells('A'.$excelRow.':'.$lastColumn.$excelRow);
                $worksheet->getStyle('A'.$excelRow.':'.$lastColumn.$excelRow)->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '0F172A']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D1FAE5']],
                ]);
            } elseif ($rowType === 'subtotal') {
                $worksheet->getStyle('A'.$excelRow.':'.$lastColumn.$excelRow)->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => '0F172A']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F1F5F9']],
                ]);
            }
        }

        $worksheet->getStyle('A1:B4')->getFont()->setBold(true)->getColor()->setRGB('0F172A');
        $worksheet->getStyle('A6:'.$lastColumn.'6')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F243E']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $worksheet->freezePane('A7');
        for ($columnIndex = 1; $columnIndex <= $columnCount; $columnIndex++) {
            $worksheet->getColumnDimension(Coordinate::stringFromColumnIndex($columnIndex))->setWidth(20);
        }

        $path = tempnam(sys_get_temp_dir(), 'inventory-report-');
        if ($path === false) {
            throw new RuntimeException('File Excel laporan tidak dapat dibuat.');
        }

        try {
            (new Xlsx($spreadsheet))->save($path);
            $contents = file_get_contents($path);

            if ($contents === false) {
                throw new RuntimeException('File Excel laporan tidak dapat dibaca.');
            }

            return $contents;
        } finally {
            $spreadsheet->disconnectWorksheets();
            @unlink($path);
        }
    }

    public function table(string $report, array $data): array
    {
        return match ($report) {
            'slow-moving' => [
                ['Gudang', 'Kode Item', 'Nama Item', 'Kategori', 'Qty', 'Terakhir Bergerak', 'Hari Tidak Aktif', 'Status', 'Nilai'],
                collect($data['rows'])->map(fn ($row) => [
                    data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    data_get($row, 'item.category.name', '-'), $row['qty'], $row['last_movement_at'] ?: '-',
                    $row['inactive_days'] ?? '-', $row['status'] === 'dead' ? 'Dead stock' : 'Slow moving', $row['value'],
                ])->all(),
            ],
            'opname' => [
                ['Nomor', 'Tanggal', 'Gudang', 'Kode Item', 'Nama Item', 'Batch', 'Qty Sistem', 'Qty Fisik', 'Selisih', 'Nilai Selisih', 'Status', 'Dibuat Oleh'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['number'], $row['opname_date'], $row['warehouse_name'], $row['item_code'], $row['item_name'],
                    $row['batch_no'] ?: '-', $row['system_qty'], $row['count_qty'], $row['diff_qty'],
                    $row['difference_value'], $row['status'], $row['creator_name'],
                ])->all(),
            ],
            'valuation' => [
                ['Jenis Ringkasan', 'Nama', 'Qty', 'Nilai Persediaan'],
                collect($data['warehouses'])->map(fn ($row) => ['Gudang', $row['name'], $row['qty'], $row['value']])
                    ->concat(collect($data['categories'])->map(fn ($row) => ['Kategori', $row['name'], $row['qty'], $row['value']]))->all(),
            ],
            'cost-history' => [
                ['Tanggal', 'Gudang', 'Kode Item', 'Nama Item', 'Referensi', 'Supplier', 'Batch', 'Qty Masuk', 'HPP Sebelum', 'HPP Masuk', 'HPP Sesudah', 'Selisih', 'Perubahan %'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['reference'], $row['supplier'] ?: '-', $row['batch_no'] ?: '-', $row['qty'],
                    $row['cost_before'], $row['incoming_cost'], $row['cost_after'], $row['difference'], $row['percentage'],
                ])->all(),
            ],
            default => $this->groupedLedgerTable($data),
        };
    }

    private function groupedLedgerTable(array $data): array
    {
        $rows = collect($data['rows'])
            ->groupBy(fn ($row) => data_get($row, 'item.id') ?? data_get($row, 'item.code'))
            ->sortBy(fn ($group) => data_get($group->first(), 'item.name'))
            ->flatMap(function ($group) {
                $first = $group->first();
                $itemLabel = data_get($first, 'item.code').' - '.data_get($first, 'item.name')
                    .' ('.data_get($first, 'item.base_uom', '-').')';
                $detailRows = $group->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), $row['reference'], $row['batch_no'] ?: '-',
                    $row['qty_in'], $row['qty_out'], $row['balance_qty'], $row['unit_cost'], $row['creator'] ?: '-',
                ]);
                $subtotal = [
                    'Subtotal '.$itemLabel, '', '', '',
                    $group->sum('qty_in'), $group->sum('qty_out'), $group->last()['balance_qty'], '', '',
                ];

                return collect([
                    ['_type' => 'group', 'cells' => [$itemLabel]],
                    ...$detailRows->all(),
                    ['_type' => 'subtotal', 'cells' => $subtotal],
                ]);
            })->values()->all();

        return [
            ['Tanggal', 'Gudang', 'Referensi', 'Batch', 'Qty Masuk', 'Qty Keluar', 'Saldo Akhir', 'HPP', 'Dibuat Oleh'],
            $rows,
        ];
    }

    public function title(string $report): string
    {
        return [
            'ledger' => 'Kartu Stok',
            'slow-moving' => 'Slow & Dead Stock',
            'opname' => 'Hasil Opname',
            'valuation' => 'Nilai Persediaan',
            'cost-history' => 'Riwayat HPP',
        ][$report] ?? 'Laporan Persediaan';
    }
}
