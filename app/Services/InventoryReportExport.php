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
            'purchase-history' => [
                ['Nomor Stock In', 'Tanggal Dokumen', 'Supplier', 'Gudang', 'Kode Item', 'Nama Item', 'Batch', 'Qty Diterima', 'Biaya Unit', 'Nilai Pembelian', 'Dibuat Oleh', 'Disetujui Manajer', 'Waktu Approval', 'Waktu Posting', 'Metode Valuasi', 'Layer FIFO'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['transaction_number'], $row['document_date'], $row['supplier_name'], $row['warehouse_name'],
                    $row['item_code'], $row['item_name'], $row['batch_no'] ?: '-', $row['qty'], $row['unit_cost'],
                    $row['total_value'], $row['created_by_name'], $row['approved_by_name'], $row['approved_at'], $row['posted_at'],
                    $row['valuation_method'] === 'fifo' ? 'FIFO' : 'Moving Average',
                    $row['fifo_layer_ids'] ? collect($row['fifo_layer_ids'])->map(fn ($id) => '#'.$id)->join(', ') : '-',
                ])->push([
                    '_type' => 'subtotal',
                    'cells' => ['GRAND TOTAL', '', '', '', '', '', '', $data['summary']['qty'], '', $data['summary']['totalValue'], '', '', '', '', '', ''],
                ])->all(),
            ],
            'slow-moving' => [
                ['Gudang', 'Kode Item', 'Nama Item', 'Kategori', 'Qty', 'Terakhir Bergerak', 'Hari Tidak Aktif', 'Status', 'Nilai'],
                collect($data['rows'])->map(fn ($row) => [
                    data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    data_get($row, 'item.category.name', '-'), $row['qty'], $row['last_movement_at'] ?: '-',
                    $row['inactive_days'] ?? '-', $row['status'] === 'dead' ? 'Dead stock' : 'Slow moving', $row['value'],
                ])->all(),
            ],
            'opname' => [
                ['Nomor', 'Tanggal', 'Gudang', 'Kode Item', 'Nama Item', 'Batch', 'Qty Sistem', 'Qty Fisik', 'Selisih', 'Metode Valuasi', 'Biaya Unit', 'Nilai Selisih', 'Status', 'Dibuat Oleh'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['number'], $row['opname_date'], $row['warehouse_name'], $row['item_code'], $row['item_name'],
                    $row['batch_no'] ?: '-', $row['system_qty'], $row['count_qty'], $row['diff_qty'],
                    $row['valuation_method'] === 'fifo' ? 'FIFO' : 'Moving Average', $row['valuation_cost'],
                    $row['difference_value'], $row['status'], $row['creator_name'],
                ])->all(),
            ],
            'valuation' => [
                ['Jenis Ringkasan', 'Nama', 'Qty', 'Nilai Persediaan'],
                collect($data['warehouses'])->map(fn ($row) => ['Gudang', $row['name'], $row['qty'], $row['value']])
                    ->concat(collect($data['categories'])->map(fn ($row) => ['Kategori', $row['name'], $row['qty'], $row['value']]))->all(),
            ],
            'cost-history' => ($data['method'] ?? 'moving_average') === 'fifo' ? [
                ['Tanggal Keluar', 'Gudang', 'Kode Item', 'Nama Item', 'Batch', 'Referensi Keluar', 'Layer', 'Tanggal Layer', 'Referensi Layer', 'Qty Awal Layer', 'Qty Dipakai', 'Sisa Layer', 'Biaya Unit', 'Total Biaya', 'Petugas'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['batch_no'] ?: '-', $row['issue_reference'], $row['layer_id'] ? '#'.$row['layer_id'] : '-',
                    $row['layer_received_at'] ?: '-', $row['layer_reference'], $row['layer_original_qty'], $row['consumed_qty'],
                    $row['layer_balance_qty'] ?? '-', $row['unit_cost'], $row['total_cost'], $row['creator'] ?: '-',
                ])->all(),
            ] : [
                ['Tanggal', 'Gudang', 'Kode Item', 'Nama Item', 'Referensi', 'Supplier', 'Batch', 'Qty Masuk', 'HPP Sebelum', 'HPP Masuk', 'HPP Sesudah', 'Selisih', 'Perubahan %'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['reference'], $row['supplier'] ?: '-', $row['batch_no'] ?: '-', $row['incoming_qty'],
                    $row['cost_before'], $row['incoming_cost'], $row['cost_after'], $row['difference'], $row['percentage'],
                ])->all(),
            ],
            'financial-movement' => [
                ['Gudang', 'Kode Item', 'Nama Item', 'Qty Masuk', 'Nilai Masuk', 'Qty Keluar', 'Nilai Keluar', 'Perubahan Bersih'],
                collect($data['rows'])->map(fn ($row) => [
                    data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['qty_in'], $row['value_in'], $row['qty_out'], $row['value_out'], $row['net_value'],
                ])->all(),
            ],
            'issue-cost' => [
                ['Tanggal', 'Gudang', 'Referensi', 'Kode Item', 'Nama Item', 'Batch', 'Qty', 'Biaya Unit', 'Total Biaya', 'Klasifikasi', 'Debit', 'Kredit'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), $row['reference'], data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['batch_no'] ?: '-', $row['qty'], $row['unit_cost'], $row['total_cost'], $row['classification'], $row['journal_debit'], $row['journal_credit'],
                ])->all(),
            ],
            'valuation-audit' => $data['method'] === 'fifo' ? [
                ['Tanggal Masuk', 'Gudang', 'Kode Item', 'Nama Item', 'Referensi', 'Batch', 'Qty Awal', 'Qty Tersisa', 'Biaya Unit', 'Nilai Tersisa', 'Umur (hari)'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['reference'], $row['batch_no'] ?: '-', $row['original_qty'], $row['remaining_qty'], $row['unit_cost'], $row['remaining_value'], $row['age_days'],
                ])->all(),
            ] : [
                ['Tanggal', 'Gudang', 'Kode Item', 'Nama Item', 'Referensi', 'Batch', 'Qty Masuk', 'Biaya Sebelum', 'Biaya Masuk', 'Biaya Sesudah', 'Selisih'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['date'], data_get($row, 'warehouse.name'), data_get($row, 'item.code'), data_get($row, 'item.name'),
                    $row['reference'], $row['batch_no'] ?: '-', $row['incoming_qty'], $row['cost_before'], $row['incoming_cost'], $row['cost_after'], $row['difference'],
                ])->all(),
            ],
            'anomalies' => [
                ['Jenis', 'Severity', 'Gudang', 'Kode Item', 'Nama Item', 'Batch', 'Qty', 'Nilai', 'Keterangan'],
                collect($data['rows'])->map(fn ($row) => [
                    $row['type'], $row['severity'], data_get($row, 'warehouse.name', '-'), data_get($row, 'item.code', '-'), data_get($row, 'item.name', '-'),
                    $row['batch_no'] ?: '-', $row['qty'], $row['value'], $row['message'],
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
                    $row['date'], data_get($row, 'warehouse.name'), $row['reference'], $row['movement_note'] ?? '-', $row['batch_no'] ?: '-',
                    $row['qty_in'], $row['qty_out'], $row['balance_qty'], $row['unit_cost'], $row['creator'] ?: '-',
                ]);
                $subtotal = [
                    'Subtotal '.$itemLabel, '', '', '', '',
                    $group->sum('qty_in'), $group->sum('qty_out'), $group->last()['balance_qty'], '', '',
                ];

                return collect([
                    ['_type' => 'group', 'cells' => [$itemLabel]],
                    ...$detailRows->all(),
                    ['_type' => 'subtotal', 'cells' => $subtotal],
                ]);
            })->values()->all();

        return [
            ['Tanggal', 'Gudang', 'Referensi', 'Keterangan Pengeluaran', 'Batch', 'Qty Masuk', 'Qty Keluar', 'Saldo Akhir', 'HPP', 'Dibuat Oleh'],
            $rows,
        ];
    }

    public function title(string $report): string
    {
        return [
            'ledger' => 'Kartu Stok',
            'purchase-history' => 'Laporan Pembelian Persediaan',
            'slow-moving' => 'Slow & Dead Stock',
            'opname' => 'Hasil Opname',
            'valuation' => 'Nilai Persediaan',
            'cost-history' => 'Riwayat HPP',
            'financial-movement' => 'Mutasi Nilai & Rekonsiliasi Persediaan',
            'issue-cost' => 'Biaya Pengeluaran & Draft Jurnal',
            'valuation-audit' => 'Audit Metode Valuasi',
            'anomalies' => 'Anomali Persediaan',
        ][$report] ?? 'Laporan Persediaan';
    }
}
