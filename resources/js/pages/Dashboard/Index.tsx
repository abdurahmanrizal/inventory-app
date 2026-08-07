/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Legacy WMS page migrated from JSX; type incrementally.
import { Head, Link } from "@inertiajs/react";
import {
  ArrowRight,
  Banknote,
  Boxes,
  ChevronDown,
  ClipboardCheck,
  PackageMinus,
  PackagePlus,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import AppLayout from "../../layouts/AppLayout";
import { formatDateTime } from "../../lib/date";

const money = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const statusStyle = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized.includes("approved") || normalized.includes("posted")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
  }

  if (normalized.includes("reject")) {
    return "bg-rose-50 text-rose-700 ring-rose-600/10";
  }

  if (normalized.includes("waiting_approval")) {
    return "bg-amber-50 text-amber-700 ring-amber-600/10";
  }

  return "bg-green-50 text-green-700 ring-green-600/10";
};

const referenceStatusLabel: Record<string, string> = {
  waiting_approval: "Menunggu Approval",
  rejected: "Ditolak",
  completed: "Selesai",
  approved: "Disetujui",
  received: "Diterima Unit",
  delivering: "Dalam Pengiriman",
  cancelled: "Dibatalkan",
};

const referenceLabel: Record<string, string> = {
  stock_in: "Stok Masuk",
  stock_out: "Stok Keluar",
  transfer: "Mutasi",
  stock_request: "Request Stok Unit",
};

export default function Index({ stats, recent, scopeLabel, quickActions, financeSummary }) {
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <AppLayout title="Dashboard">
      <Head title="Dashboard" />

      <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white shadow-[0_20px_55px_rgba(15,35,63,0.18)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-28 size-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 size-40 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-slate-300">
              <Sparkles size={14} className="text-emerald-400" />
              {scopeLabel}
            </div>
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              {financeSummary
                ? "Pantau nilai dan rekonsiliasi persediaan."
                : "Pantau pergerakan stok dengan lebih cepat."}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {financeSummary
                ? "Ringkasan keuangan persediaan seluruh gudang berdasarkan metode valuasi aktif."
                : "Ringkasan hanya menampilkan persediaan dan transaksi yang berkaitan dengan cakupan akun Anda."}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <p className="text-xs capitalize text-slate-400 sm:mr-2">{today}</p>
            {(quickActions.stockIn ||
              quickActions.stockOut ||
              quickActions.stockRequest) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/25 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    Buat Transaksi
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl"
                >
                  {quickActions.stockIn && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/stock-transactions?type=stock_in"
                        className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-700"
                      >
                        <PackagePlus size={16} />
                        Buat Stock In
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {quickActions.stockOut && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/stock-transactions?type=stock_out"
                        className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-rose-50 focus:text-rose-700"
                      >
                        <PackageMinus size={16} />
                        Buat Stock Out
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {quickActions.stockRequest && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/operations/fulfillment"
                        className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-blue-50 focus:text-blue-700"
                      >
                        <Boxes size={16} />
                        Request Stok Unit
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </section>

      {financeSummary ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total Nilai Persediaan" value={money(financeSummary.inventoryValue)} helper={`Metode ${financeSummary.valuationMethod === "fifo" ? "FIFO" : "Moving Average"}`} icon={Banknote} tone="emerald" />
            <StatCard label="Biaya Pengeluaran" value={money(financeSummary.outgoingCost)} helper={`Periode ${financeSummary.periodLabel}`} icon={PackageMinus} tone="blue" />
            <StatCard label="Selisih Rekonsiliasi" value={money(financeSummary.reconciliationDifference)} helper="Nilai operasional dibanding ledger" icon={ClipboardCheck} tone="amber" />
            <StatCard label="Anomali Persediaan" value={financeSummary.anomalyCount} helper="Perlu ditinjau oleh tim terkait" icon={TriangleAlert} tone="rose" />
            <StatCard label="Metode Valuasi Aktif" value={financeSummary.valuationMethod === "fifo" ? "FIFO" : "Moving Average"} helper="Berlaku untuk satu company" icon={Boxes} tone="emerald" />
          </section>
          <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-950">Nilai persediaan per gudang</h2>
              <p className="mt-1 text-sm text-slate-500">Ringkasan seluruh gudang dan unit.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {financeSummary.warehouseValues.map((warehouse) => (
                <div key={warehouse.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-sm font-semibold text-slate-800">{warehouse.name}</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-700">{money(warehouse.value)}</p>
                  <p className="mt-1 text-xs text-slate-500">{Number(warehouse.qty).toLocaleString("id-ID")} unit stok</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nilai Persediaan"
          value={money(stats.stockValue)}
          helper="Berdasarkan metode valuasi aktif"
          icon={Banknote}
          tone="emerald"
        />
        <StatCard
          label="Total Stok"
          value={Number(stats.stockQty).toLocaleString("id-ID")}
          helper={`Sesuai cakupan: ${scopeLabel}`}
          icon={Boxes}
          tone="blue"
        />
        <StatCard
          label="Menunggu Approval"
          value={stats.pendingApproval}
          helper="Pengajuan terkait yang masih menunggu"
          icon={ClipboardCheck}
          tone="amber"
        />
        <StatCard
          label="Stok Tidak Tersedia"
          value={stats.lowStock}
          helper="Saldo telah terpakai oleh reservasi"
          icon={TriangleAlert}
          tone="rose"
        />
      </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold tracking-tight text-slate-950">
              Transaksi terbaru
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Aktivitas persediaan yang terakhir diperbarui.
            </p>
          </div>
          <Link
            href={
              financeSummary
                ? "/transaction-activities"
                : quickActions.stockRequest
                ? "/operations/fulfillment"
                : "/stock-transactions"
            }
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-600"
          >
            Lihat semua <ArrowRight size={16} />
          </Link>
        </div>

        {recent.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {[
                    "Nomor transaksi",
                    "Tipe",
                    "Pergerakan gudang",
                    "Status",
                    "Tanggal",
                  ].map((heading) => (
                    <th
                      className="whitespace-nowrap px-5 py-3.5 first:pl-6 last:pr-6"
                      key={heading}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-5 py-4 pl-6 font-semibold text-slate-900">
                      {transaction.number}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {referenceLabel[transaction.type] || "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      <span>{transaction.source_warehouse?.name || "-"}</span>
                      <ArrowRight
                        size={14}
                        className="mx-2 inline text-slate-300"
                      />
                      <span>
                        {transaction.destination_warehouse?.name || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle(transaction.status)}`}
                      >
                        {referenceStatusLabel[transaction.status] || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 pr-6 text-slate-500">
                      {formatDateTime(transaction.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Boxes size={22} />
            </span>
            <p className="mt-4 font-medium text-slate-700">
              Belum ada transaksi
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Transaksi terbaru akan muncul di sini.
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
