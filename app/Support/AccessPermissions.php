<?php

namespace App\Support;

final class AccessPermissions
{
    public const CATALOG = [
        'master.manage' => ['Master Data', 'Kelola master supplier, satuan, lokasi, dan item'],
        'stock.request' => ['Request Stok', 'Membuat permintaan stok ke gudang utama'],
        'stock.ship' => ['Persiapan & Pengiriman', 'Menyiapkan dan mengirim permintaan stok'],
        'stock.receive' => ['Penerimaan Stok', 'Menerima stok hasil pengiriman'],
        'stock.adjust' => ['Opname & Adjustment', 'Membuat stock opname dan adjustment'],
        'approval.act' => ['Approval', 'Melihat dan memproses antrean approval'],
        'stock.in' => ['Stock In', 'Membuat dan melihat transaksi stock in'],
        'stock.out' => ['Stock Out / Mutasi', 'Membuat dan melihat stock out atau mutasi'],
        'stock.view' => ['Stok Gudang', 'Melihat saldo stok gudang sesuai cakupan akun'],
        'activity.view' => ['Riwayat Aktivitas', 'Melihat ledger dan aktivitas transaksi'],
        'report.view' => ['Laporan Persediaan', 'Melihat kartu stok, slow moving, opname, dan nilai persediaan'],
    ];

    public const DEFAULTS = [
        'superadmin' => ['*'],
        'warehouse_admin_dry' => ['approval.act', 'stock.ship', 'stock.adjust', 'stock.in', 'stock.out', 'stock.view', 'report.view'],
        'warehouse_admin_wet' => ['approval.act', 'stock.ship', 'stock.adjust', 'stock.in', 'stock.out', 'stock.view', 'report.view'],
        'unit_user' => ['stock.request', 'stock.receive', 'stock.out', 'stock.view'],
        'unit_manager' => ['approval.act', 'stock.view', 'activity.view', 'report.view'],
    ];
}
