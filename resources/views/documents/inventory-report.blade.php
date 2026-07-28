<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 28px 30px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #172033; font-family: "DejaVu Sans", sans-serif; font-size: 8px; line-height: 1.35; }
        .header { border-bottom: 3px solid #10b981; padding-bottom: 10px; }
        .header-table, .items, .meta { border-collapse: collapse; width: 100%; }
        .header-table td { padding: 0; vertical-align: middle; }
        .brand-logo { display: block; height: 44px; width: 44px; }
        .brand-copy { padding-left: 10px !important; }
        .brand { color: #0f172a; font-size: 17px; font-weight: bold; }
        .brand-sub { color: #64748b; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; }
        .doc-title { font-size: 16px; font-weight: bold; margin: 18px 0 3px; text-align: center; text-transform: uppercase; }
        .doc-number { color: #64748b; margin-bottom: 14px; text-align: center; }
        .meta { background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 14px; }
        .meta td { padding: 8px; width: 33.33%; }
        .label { color: #64748b; display: block; font-size: 7px; margin-bottom: 2px; text-transform: uppercase; }
        .value { font-weight: bold; }
        .items th { background: #0f243e; color: white; font-size: 7px; padding: 7px 5px; text-align: left; text-transform: uppercase; }
        .items td { border-bottom: 1px solid #e2e8f0; padding: 6px 5px; vertical-align: top; }
        .items tr:nth-child(even) td { background: #f8fafc; }
        .items .group-row td { background: #d1fae5; border-top: 2px solid #10b981; color: #065f46; font-size: 8px; font-weight: bold; padding: 8px 6px; }
        .items .subtotal-row td { background: #f1f5f9; font-weight: bold; }
        .footer { bottom: 0; color: #94a3b8; font-size: 7px; left: 0; position: fixed; right: 0; text-align: center; }
    </style>
</head>
<body>
@php
    $logoPath = public_path('brand/bas-stockflow-mark.png');
    $logoDataUri = file_exists($logoPath) ? 'data:image/png;base64,'.base64_encode(file_get_contents($logoPath)) : null;
@endphp
<div class="header"><table class="header-table"><tr>
    @if($logoDataUri)<td style="width:44px"><img class="brand-logo" src="{{ $logoDataUri }}" alt="Logo BAS StockFlow"></td>@endif
    <td class="brand-copy"><div class="brand">BAS StockFlow</div><div class="brand-sub">Inventory Workflow</div></td>
</tr></table></div>
<div class="doc-title">{{ $title }}</div>
<div class="doc-number">Laporan Persediaan</div>
<table class="meta"><tr>
    <td><span class="label">Gudang</span><span class="value">{{ $warehouseName ?: 'Semua gudang' }}</span></td>
    <td><span class="label">Periode</span><span class="value">{{ $filters['date_from'] ?? '-' }} s/d {{ $filters['date_to'] ?? '-' }}</span></td>
    <td><span class="label">Dicetak</span><span class="value">{{ now()->format('d/m/Y H:i') }}</span></td>
</tr></table>
<table class="items">
    <thead><tr>@foreach($headers as $header)<th>{{ $header }}</th>@endforeach</tr></thead>
    <tbody>
    @forelse($rows as $row)
        @php
            $rowType = is_array($row) ? ($row['_type'] ?? null) : null;
            $cells = $rowType ? $row['cells'] : $row;
        @endphp
        @if($rowType === 'group')
            <tr class="group-row"><td colspan="{{ count($headers) }}">{{ $cells[0] }}</td></tr>
        @else
            <tr class="{{ $rowType === 'subtotal' ? 'subtotal-row' : '' }}">@foreach($cells as $value)<td>{{ is_float($value) ? number_format($value, 3, ',', '.') : $value }}</td>@endforeach</tr>
        @endif
    @empty<tr><td colspan="{{ count($headers) }}" style="text-align:center;padding:24px">Tidak ada data untuk filter ini.</td></tr>@endforelse
    </tbody>
</table>
</body>
</html>
