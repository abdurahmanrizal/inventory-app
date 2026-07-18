<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Pengajuan {{ $transaction->number }}</title>
    <style>
        @page { margin: 32px 38px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #172033; font-family: "DejaVu Sans", sans-serif; font-size: 10px; line-height: 1.45; }
        .header { border-bottom: 3px solid #10b981; padding-bottom: 16px; }
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
        $typeLabels = ['stock_in' => 'Stock In', 'stock_out' => 'Stock Out', 'transfer' => $transaction->request_kind === 'unit_request' ? 'Permintaan Stok Unit' : 'Mutasi Antar Gudang'];
        $statusLabels = ['waiting_approval' => 'Menunggu Persetujuan', 'completed' => 'Selesai', 'rejected' => 'Ditolak', 'draft' => 'Draft'];
        $type = $transaction->type->value;
        $status = $transaction->status->value;
    @endphp
    <div class="header">
        <div class="brand">WMS Core</div>
        <div class="brand-sub">Inventory Control</div>
    </div>
    <div class="doc-title">Form Pengajuan {{ $typeLabels[$type] ?? strtoupper($type) }}</div>
    <div class="doc-number">Nomor dokumen: {{ $transaction->number }}</div>

    <table class="meta">
        <tr>
            <td><span class="label">Tanggal Dokumen</span><span class="value">{{ $transaction->document_date->format('d/m/Y') }}</span></td>
            <td><span class="label">Status</span><span class="value">{{ $statusLabels[$status] ?? $status }}</span></td>
            <td><span class="label">Gudang Asal</span><span class="value">{{ $transaction->sourceWarehouse?->name ?? '-' }}</span></td>
            <td><span class="label">Gudang Tujuan</span><span class="value">{{ $transaction->destinationWarehouse?->name ?? '-' }}</span></td>
        </tr>
        <tr>
            <td colspan="2"><span class="label">Dibuat Oleh</span><span class="value">{{ $transaction->creator?->name ?? '-' }}</span></td>
            <td colspan="2"><span class="label">Supplier / Pihak Eksternal</span><span class="value">{{ $transaction->supplier_name ?: '-' }}</span></td>
        </tr>
    </table>

    <div class="section-title">Rincian Barang</div>
    <table class="items">
        <thead><tr><th style="width:5%">No.</th><th style="width:18%">Kode</th><th>Nama Barang</th><th style="width:12%">Batch</th><th style="width:12%">Qty</th><th style="width:10%">Satuan</th><th style="width:16%">HPP</th></tr></thead>
        <tbody>
        @foreach($transaction->details as $detail)
            <tr>
                <td class="center">{{ $loop->iteration }}</td>
                <td><strong>{{ $detail->item->code }}</strong></td>
                <td>{{ $detail->item->name }}</td>
                <td>{{ $detail->batch_no ?: '-' }}</td>
                <td class="right">{{ number_format((float) $detail->qty, 3, ',', '.') }}</td>
                <td class="center">{{ $detail->item->base_uom }}</td>
                <td class="right">{{ $type === 'stock_in' ? 'Rp '.number_format((float) $detail->unit_cost, 0, ',', '.') : '-' }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <div class="section-title">Catatan</div>
    <div class="notes">{{ $transaction->notes ?: 'Tidak ada catatan tambahan.' }}</div>

    <table class="signatures">
        <tr><td>Dibuat oleh,</td><td>Diperiksa oleh,</td><td>Disetujui Manajer,</td></tr>
        <tr><td class="sign-space"></td><td class="sign-space"></td><td class="sign-space"></td></tr>
        <tr><td><div class="sign-line">{{ $transaction->creator?->name ?? '(........................)' }}</div><div class="sign-role">Pemohon</div></td><td><div class="sign-line">(........................)</div><div class="sign-role">Petugas Gudang</div></td><td><div class="sign-line">{{ $transaction->approver?->name ?? '(........................)' }}</div><div class="sign-role">Manajer</div></td></tr>
    </table>
    <div class="footer">Dokumen dibuat oleh WMS Core pada {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
