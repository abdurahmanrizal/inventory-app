<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Pengajuan {{ $transaction->number }}</title>
    <style>
        @page { margin: 32px 38px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #172033; font-family: "DejaVu Sans", sans-serif; font-size: 10px; line-height: 1.45; }
        .header { border-bottom: 3px solid #10b981; padding-bottom: 12px; }
        .header-table { border-collapse: collapse; width: 100%; }
        .header-table td { padding: 0; vertical-align: middle; }
        .brand-logo { display: block; height: 48px; width: 48px; }
        .brand-copy { padding-left: 10px !important; }
        .brand { color: #0f172a; font-size: 18px; font-weight: bold; }
        .brand-sub { color: #64748b; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; }
        .doc-title { color: #0f172a; font-size: 17px; font-weight: bold; margin: 24px 0 3px; text-align: center; text-transform: uppercase; }
        .doc-number { color: #64748b; margin-bottom: 20px; text-align: center; }
        .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 13px 15px; width: 100%; }
        .meta td { padding: 4px 5px; vertical-align: top; width: 25%; }
        .label { color: #64748b; display: block; font-size: 8px; margin-bottom: 3px; text-transform: uppercase; }
        .value { color: #172033; font-weight: bold; }
        .section-title { color: #0f172a; font-size: 11px; font-weight: bold; margin: 20px 0 8px; }
        .items { border-collapse: collapse; width: 100%; }
        .items th { background: #0f243e; color: white; font-size: 8px; padding: 9px 7px; text-align: left; text-transform: uppercase; }
        .items td { border-bottom: 1px solid #e2e8f0; padding: 9px 7px; vertical-align: top; }
        .items .center { text-align: center; }
        .items .right { text-align: right; }
        .notes { background: #f8fafc; border-left: 3px solid #94a3b8; color: #475569; min-height: 42px; padding: 10px 12px; }
        .signatures { margin-top: 38px; table-layout: fixed; text-align: center; width: 100%; }
        .signatures td { padding: 0 12px; width: 33.33%; }
        .sign-space { height: 62px; }
        .sign-line { border-top: 1px solid #64748b; padding-top: 5px; }
        .sign-role { color: #64748b; font-size: 8px; margin-top: 2px; }
        .footer { bottom: 0; color: #94a3b8; font-size: 8px; left: 0; position: fixed; right: 0; text-align: center; }
    </style>
</head>
<body>
    @php
        $typeLabels = ['stock_in' => 'Stock In', 'stock_out' => 'Stock Out', 'transfer' => $transaction->request_kind === 'unit_request' ? 'Permintaan Stok Unit' : ($transaction->request_kind === 'unit_return' ? 'Pengembalian ke Gudang Utama' : 'Mutasi Antar Gudang')];
        $statusLabels = ['waiting_approval' => 'Menunggu Persetujuan', 'completed' => 'Selesai', 'rejected' => 'Ditolak', 'draft' => 'Draft'];
        $stockOutReasonLabels = ['operational' => 'Pemakaian Operasional', 'shrinkage' => 'Penyusutan', 'expired' => 'Kedaluwarsa', 'damaged' => 'Barang Rusak', 'waste' => 'Waste / Terbuang', 'return' => 'Retur', 'restitution' => 'Pengembalian', 'other' => 'Lainnya'];
        $type = $transaction->type->value;
        $status = $transaction->status->value;
        $isUnitReturn = $type === 'transfer' && $transaction->request_kind === 'unit_return';
        $unitManagerApproval = $isUnitReturn ? $transaction->approvals->firstWhere('level', 1) : null;
        $mainManagerApproval = $isUnitReturn ? $transaction->approvals->firstWhere('level', 2) : null;
        $documentDateTime = $transaction->document_date
            ->copy()
            ->setTimeFrom($transaction->created_at ?? now());
        $totalHpp = 0;
        $logoPath = public_path('brand/bas-stockflow-mark.png');
        $logoDataUri = file_exists($logoPath)
            ? 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath))
            : null;
    @endphp
    <div class="header">
        <table class="header-table">
            <tr>
                @if($logoDataUri)
                    <td style="width:48px">
                        <img class="brand-logo" src="{{ $logoDataUri }}" alt="Logo BAS StockFlow">
                    </td>
                @endif
                <td class="brand-copy">
                    <div class="brand">BAS StockFlow</div>
                    <div class="brand-sub">Inventory Workflow</div>
                </td>
            </tr>
        </table>
    </div>
    <div class="doc-title">Form Pengajuan {{ $typeLabels[$type] ?? strtoupper($type) }}</div>
    <div class="doc-number">Nomor dokumen: {{ $transaction->number }}</div>

    <table class="meta">
        <tr>
            <td><span class="label">Tanggal Dokumen</span><span class="value">{{ $documentDateTime->format('d/m/Y H:i') }}</span></td>
            <td><span class="label">Status</span><span class="value">{{ $statusLabels[$status] ?? $status }}</span></td>
            <td><span class="label">Gudang Asal</span><span class="value">{{ $transaction->sourceWarehouse?->name ?? '-' }}</span></td>
            <td><span class="label">Gudang Tujuan</span><span class="value">{{ $transaction->destinationWarehouse?->name ?? '-' }}</span></td>
        </tr>
        <tr>
            <td><span class="label">Dibuat Oleh</span><span class="value">{{ $transaction->creator?->name ?? '-' }}</span></td>
            @if($isUnitReturn)
                <td><span class="label">Disetujui Manajer Gudang Unit</span><span class="value">{{ $unitManagerApproval?->acted_at?->format('d/m/Y H:i') ?? '-' }}</span></td>
                <td colspan="2"><span class="label">Disetujui Manajer Gudang Utama</span><span class="value">{{ $mainManagerApproval?->acted_at?->format('d/m/Y H:i') ?? '-' }}</span></td>
            @else
                <td><span class="label">Tanggal Disetujui</span><span class="value">{{ $transaction->approved_at?->format('d/m/Y H:i') ?? '-' }}</span></td>
            @if($type === 'stock_out')
                <td><span class="label">Jenis Pengeluaran</span><span class="value">{{ $stockOutReasonLabels[$transaction->stock_out_reason] ?? 'Tidak dicantumkan' }}</span></td>
                <td><span class="label">Penerima / Tujuan</span><span class="value">{{ $transaction->supplier_name ?: 'Eksternal' }}</span></td>
            @else
                <td colspan="2"><span class="label">Nama Supplier</span><span class="value">{{ $transaction->supplier_name ?: 'Eksternal' }}</span></td>
            @endif
            @endif
        </tr>
    </table>

    <div class="section-title">Rincian Barang</div>
    <table class="items">
        <thead><tr><th style="width:5%">No.</th><th style="width:15%">Kode</th><th>Nama Barang</th><th style="width:11%">Batch</th><th style="width:10%">Qty</th><th style="width:9%">Satuan</th><th style="width:15%">HPP / Unit</th><th style="width:16%">Subtotal HPP</th></tr></thead>
        <tbody>
        @foreach($transaction->details as $detail)
            @php
                $hpp = (float) (($type === 'stock_out' || $isUnitReturn) ? $detail->document_hpp : $detail->unit_cost);
                $subtotalHpp = (float) $detail->qty * $hpp;
                $totalHpp += $subtotalHpp;
            @endphp
            <tr>
                <td class="center">{{ $loop->iteration }}</td>
                <td><strong>{{ $detail->item->code }}</strong></td>
                <td>{{ $detail->item->name }}</td>
                <td>{{ $detail->batch_no ?: '-' }}</td>
                <td class="right">{{ number_format((float) $detail->qty, 3, ',', '.') }}</td>
                <td class="center">{{ $detail->item->base_uom }}</td>
                <td class="right">Rp {{ number_format($hpp, 0, ',', '.') }}</td>
                <td class="right"><strong>Rp {{ number_format($subtotalHpp, 0, ',', '.') }}</strong></td>
            </tr>
        @endforeach
            <tr>
                <td colspan="7" class="right"><strong>Total Nominal HPP</strong></td>
                <td class="right"><strong>Rp {{ number_format($totalHpp, 0, ',', '.') }}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">Catatan</div>
    <div class="notes">{{ $transaction->notes ?: 'Tidak ada catatan tambahan.' }}</div>

    @if($isUnitReturn)
    <table class="signatures">
        <tr>
            <td style="width:50%">Disetujui Manajer Gudang Unit,</td>
            <td style="width:50%">Disetujui Manajer Gudang Utama,</td>
        </tr>
        <tr>
            <td class="sign-space"></td>
            <td class="sign-space"></td>
        </tr>
        <tr>
            <td style="width:50%">
                <div class="sign-line">{{ $unitManagerApproval?->approver?->name ?? '(........................)' }}</div>
                <div class="sign-role">Manajer Gudang Unit</div>
            </td>
            <td style="width:50%">
                <div class="sign-line">{{ $mainManagerApproval?->approver?->name ?? '(........................)' }}</div>
                <div class="sign-role">Manajer Gudang Utama</div>
            </td>
        </tr>
    </table>
    @else
    <table class="signatures">
        <tr>
            <td></td>
            <td></td>
            <td>Disetujui Manajer,</td>
        </tr>
        <tr>
            <td class="sign-space">
            </td>
            <td class="sign-space">
            </td>
            <td class="sign-space">
            </td>
        </tr>
        <tr>
            <td>
                <div></div>
                <div></div>
            </td>
            <td>
                <div></div>
                <div></div>
            </td>
            <td>
                <div class="sign-line">{{ $transaction->approver?->name ?? '(........................)' }}
                </div>
                <div class="sign-role">Manajer</div>
            </td>
        </tr>
    </table>
    @endif
    <div class="footer">Dokumen dibuat oleh BAS StockFlow pada {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
