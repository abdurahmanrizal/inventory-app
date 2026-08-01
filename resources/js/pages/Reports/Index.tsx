import { Head, router } from "@inertiajs/react";
import {
  ArchiveX,
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  BookOpenText,
  Boxes,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  Download,
  Filter,
  PackageSearch,
  Scale,
  ShieldCheck,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import SearchableItemSelect from "../../components/searchable-item-select";
import AppLayout from "../../layouts/AppLayout";

const number = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(
    value || 0,
  );
const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const reports = [
  {
    id: "ledger",
    label: "Kartu Stok",
    hint: "Riwayat masuk dan keluar",
    icon: BookOpenText,
  },
  {
    id: "slow-moving",
    label: "Slow & Dead Stock",
    hint: "Stok tidak bergerak",
    icon: ArchiveX,
  },
  {
    id: "opname",
    label: "Hasil Opname",
    hint: "Selisih sistem dan fisik",
    icon: ClipboardCheck,
  },
  {
    id: "valuation",
    label: "Nilai Persediaan",
    hint: "Nilai stok dan tren",
    icon: ChartNoAxesCombined,
  },
  {
    id: "cost-history",
    label: "Riwayat HPP",
    hint: "Perubahan biaya per item",
    icon: TrendingUp,
  },
];

function SummaryCard({ label, value, icon: Icon, tone = "emerald" }: any) {
  const tones: any = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}
      >
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[.1em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 truncate text-xl font-semibold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function Empty({ message = "Belum ada data untuk filter ini." }) {
  return (
    <div className="px-6 py-16 text-center">
      <PackageSearch className="mx-auto text-slate-300" />
      <p className="mt-3 font-medium text-slate-600">{message}</p>
      <p className="mt-1 text-sm text-slate-400">
        Coba ubah gudang atau periode laporan.
      </p>
    </div>
  );
}

export default function Index({
  report,
  data,
  filters,
  warehouses,
  items,
  canFilterWarehouse,
  accessLabel,
}: any) {
  const [form, setForm] = useState({ ...filters, report });
  const filteredItems = useMemo(() => {
    if (!form.warehouse_id) return items;

    return items.filter((item: any) =>
      item.warehouse_ids?.some(
        (warehouseId: number | string) =>
          String(warehouseId) === String(form.warehouse_id),
      ),
    );
  }, [form.warehouse_id, items]);
  const update = (key: string, value: string) =>
    setForm((current: any) => ({ ...current, [key]: value }));
  const updateWarehouse = (warehouseId: string) =>
    setForm((current: any) => ({
      ...current,
      warehouse_id: warehouseId,
      item_id: "",
    }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    router.get("/reports", form, { preserveState: true, replace: true });
  };
  const switchReport = (id: string) => {
    const next = { ...form, report: id };
    setForm(next);
    router.get("/reports", next, { preserveState: true, replace: true });
  };
  const exportUrl = (format: "pdf" | "xlsx") => {
    const query = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
    return `/reports/export/${format}?${query.toString()}`;
  };

  return (
    <AppLayout title="Laporan Persediaan" fullWidth>
      <Head title="Laporan Persediaan" />
      <div className="mx-auto w-full max-w-[1360px]">
        <section className="relative overflow-hidden rounded-3xl bg-[#10233f] px-6 py-6 text-white shadow-xl shadow-slate-200 sm:px-8">
          <div className="absolute -right-16 -top-24 size-64 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs text-emerald-300">
                <ShieldCheck size={14} />
                {accessLabel}
              </span>
              <h2 className="mt-3 text-2xl font-semibold">
                Pusat laporan persediaan
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Pilih jenis laporan, tentukan periode, lalu baca ringkasan dan
                detailnya dalam satu tempat.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
              <CalendarDays size={20} className="text-emerald-300" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Periode aktif
                </p>
                <p className="text-sm font-medium">
                  {filters.date_from} s/d {filters.date_to}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {reports.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchReport(item.id)}
              className={`flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${report === item.id ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl ${report === item.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                <item.icon size={20} />
              </span>
              <span className="min-w-0">
                <b className="block truncate text-sm text-slate-900">
                  {item.label}
                </b>
                <small className="mt-0.5 block truncate text-slate-500">
                  {item.hint}
                </small>
              </span>
            </button>
          ))}
        </section>

        <form
          onSubmit={submit}
          className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter size={17} className="text-emerald-600" />
            Filter laporan
          </div>
          <div
            className={`grid items-end gap-3 md:grid-cols-2 xl:grid-cols-3 ${report === "ledger" || report === "cost-history" ? "2xl:grid-cols-[1.05fr_1.25fr_.9fr_.9fr_.9fr_auto]" : "2xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]"}`}
          >
            {canFilterWarehouse && (
              <label className="text-xs font-semibold text-slate-600">
                Gudang
                <select
                  value={form.warehouse_id || ""}
                  onChange={(e) => updateWarehouse(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-emerald-400"
                >
                  <option value="">Semua gudang</option>
                  {warehouses.map((row: any) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {(report === "ledger" || report === "cost-history") && (
              <>
                <label className="text-xs font-semibold text-slate-600">
                  Item
                  <div className="mt-2">
                    <SearchableItemSelect
                      value={form.item_id || ""}
                      items={filteredItems}
                      onChange={(value) => update("item_id", value)}
                      placeholder={
                        form.warehouse_id
                          ? "Cari item di gudang ini"
                          : "Cari item dalam cakupan gudang"
                      }
                      emptyOptionLabel="Semua item"
                    />
                  </div>
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Batch
                  <input
                    value={form.batch_no || ""}
                    onChange={(e) => update("batch_no", e.target.value)}
                    placeholder="Semua batch"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
                  />
                </label>
              </>
            )}
            {report === "slow-moving" ? (
              <label className="text-xs font-semibold text-slate-600">
                Tidak bergerak selama
                <select
                  value={form.days}
                  onChange={(e) => update("days", e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-emerald-400"
                >
                  {[30, 60, 90, 180, 365].map((day) => (
                    <option key={day} value={day}>
                      {day} hari
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              report !== "valuation" && (
                <>
                  <label className="text-xs font-semibold text-slate-600">
                    Dari tanggal
                    <input
                      type="date"
                      value={form.date_from}
                      onChange={(e) => update("date_from", e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600">
                    Sampai tanggal
                    <input
                      type="date"
                      value={form.date_to}
                      onChange={(e) => update("date_to", e.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
                    />
                  </label>
                </>
              )
            )}
            <div className="flex flex-wrap items-end gap-2">
              <button className="h-11 whitespace-nowrap rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
                Terapkan filter
              </button>
              <a
                href={exportUrl("pdf")}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download size={16} /> PDF
              </a>
              <a
                href={exportUrl("xlsx")}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download size={16} /> Excel
              </a>
            </div>
          </div>
        </form>

        <div className="mt-6">
          {report === "ledger" && <Ledger data={data} />}
          {report === "slow-moving" && (
            <SlowMoving data={data} days={filters.days} />
          )}
          {report === "opname" && <Opname data={data} />}
          {report === "valuation" && <Valuation data={data} />}
          {report === "cost-history" && <CostHistory data={data} />}
        </div>
      </div>
    </AppLayout>
  );
}

function Ledger({ data }: any) {
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Saldo awal"
          value={number(data.summary.opening)}
          icon={Boxes}
          tone="blue"
        />
        <SummaryCard
          label="Mutasi masuk"
          value={number(data.summary.in)}
          icon={ArrowDownToLine}
        />
        <SummaryCard
          label="Mutasi keluar"
          value={number(data.summary.out)}
          icon={ArrowUpFromLine}
          tone="rose"
        />
        <SummaryCard
          label="Saldo akhir"
          value={number(data.summary.closing)}
          icon={Scale}
          tone="amber"
        />
      </section>
      <ReportTable
        title="Riwayat kartu stok"
        note={
          data.limited
            ? "Menampilkan maksimal 500 mutasi pertama."
            : `${data.rows.length} mutasi ditemukan.`
        }
        headers={[
          "Tanggal",
          "Gudang",
          "Item / batch",
          "Referensi",
          "Masuk",
          "Keluar",
          "Saldo",
          "Petugas",
        ]}
      >
        {data.rows.length ? (
          data.rows.map((row: any) => (
            <tr key={row.id} className="hover:bg-slate-50/70">
              <Cell>{row.date}</Cell>
              <Cell>
                <b>{row.warehouse.name}</b>
                <small>{row.warehouse.code}</small>
              </Cell>
              <Cell>
                <b>{row.item.name}</b>
                <small>
                  {row.item.code} · {row.batch_no || "Tanpa batch"}
                </small>
              </Cell>
              <Cell>{row.reference}</Cell>
              <Cell strong tone="emerald">
                {row.qty_in ? number(row.qty_in) : "-"}
              </Cell>
              <Cell strong tone="rose">
                {row.qty_out ? number(row.qty_out) : "-"}
              </Cell>
              <Cell strong>{number(row.balance_qty)}</Cell>
              <Cell>{row.creator || "-"}</Cell>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={8} />
        )}
      </ReportTable>
    </>
  );
}

function SlowMoving({ data, days }: any) {
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Item terpantau"
          value={number(data.summary.items)}
          icon={Boxes}
          tone="blue"
        />
        <SummaryCard
          label="Slow moving"
          value={number(data.summary.slow)}
          icon={PackageSearch}
          tone="amber"
        />
        <SummaryCard
          label={`Dead stock ≥ ${days} hari`}
          value={number(data.summary.dead)}
          icon={ArchiveX}
          tone="rose"
        />
        <SummaryCard
          label="Nilai stok tertahan"
          value={money(data.summary.value)}
          icon={Banknote}
        />
      </section>
      <ReportTable
        title="Item yang jarang bergerak"
        note="Urutan dimulai dari item yang paling lama tidak bergerak."
        headers={[
          "Gudang",
          "Item",
          "Stok",
          "Mutasi terakhir",
          "Tidak bergerak",
          "Status",
          "Nilai stok",
        ]}
      >
        {data.rows.length ? (
          data.rows.map((row: any) => (
            <tr key={row.id} className="hover:bg-slate-50/70">
              <Cell>
                <b>{row.warehouse.name}</b>
                <small>{row.warehouse.code}</small>
              </Cell>
              <Cell>
                <b>{row.item.name}</b>
                <small>
                  {row.item.code} · {row.item.base_uom}
                </small>
              </Cell>
              <Cell strong>{number(row.qty)}</Cell>
              <Cell>{row.last_movement_at || "Belum pernah bergerak"}</Cell>
              <Cell strong>
                {row.inactive_days === null
                  ? "Belum pernah"
                  : `${number(row.inactive_days)} hari`}
              </Cell>
              <Cell>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "dead" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}
                >
                  {row.status === "dead" ? "Dead stock" : "Slow moving"}
                </span>
              </Cell>
              <Cell strong>{money(row.value)}</Cell>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={7} />
        )}
      </ReportTable>
    </>
  );
}

function Opname({ data }: any) {
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Sesi opname"
          value={number(data.summary.sessions)}
          icon={ClipboardCheck}
          tone="blue"
        />
        <SummaryCard
          label="Item dihitung"
          value={number(data.summary.counted)}
          icon={Boxes}
        />
        <SummaryCard
          label="Item berselisih"
          value={number(data.summary.different)}
          icon={Scale}
          tone="rose"
        />
        <SummaryCard
          label="Nilai selisih bersih"
          value={money(data.summary.differenceValue)}
          icon={Banknote}
          tone="amber"
        />
      </section>
      <ReportTable
        title="Hasil stok opname"
        note={`${data.rows.length} detail perhitungan fisik ditemukan.`}
        headers={[
          "Tanggal / nomor",
          "Gudang",
          "Item / batch",
          "Sistem",
          "Fisik",
          "Selisih",
          "Nilai selisih",
          "Dilakukan oleh",
        ]}
      >
        {data.rows.length ? (
          data.rows.map((row: any) => (
            <tr key={row.id} className="hover:bg-slate-50/70">
              <Cell>
                <b>{row.opname_date}</b>
                <small>{row.number}</small>
              </Cell>
              <Cell>
                <b>{row.warehouse_name}</b>
                <small>{row.warehouse_code}</small>
              </Cell>
              <Cell>
                <b>{row.item_name}</b>
                <small>
                  {row.item_code} · {row.batch_no || "Tanpa batch"}
                </small>
              </Cell>
              <Cell>{number(row.system_qty)}</Cell>
              <Cell>{number(row.count_qty)}</Cell>
              <Cell
                strong
                tone={
                  row.diff_qty < 0
                    ? "rose"
                    : row.diff_qty > 0
                      ? "emerald"
                      : undefined
                }
              >
                {number(row.diff_qty)}
              </Cell>
              <Cell strong>{money(row.difference_value)}</Cell>
              <Cell>{row.creator_name}</Cell>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={8} />
        )}
      </ReportTable>
    </>
  );
}

function Valuation({ data }: any) {
  const maxTrend = Math.max(...data.trend.map((row: any) => row.value), 1);

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total nilai stok"
          value={money(data.summary.value)}
          icon={Banknote}
        />
        <SummaryCard
          label="Total kuantitas"
          value={number(data.summary.qty)}
          icon={Boxes}
          tone="blue"
        />
        <SummaryCard
          label="Gudang tercakup"
          value={number(data.summary.warehouses)}
          icon={Warehouse}
          tone="amber"
        />
        <SummaryCard
          label="Kategori aktif"
          value={number(data.summary.categories)}
          icon={PackageSearch}
          tone="rose"
        />
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">
            Tren nilai persediaan
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Posisi nilai pada akhir setiap bulan dari kartu stok.
          </p>
          <div className="mt-8 flex h-56 items-end gap-3">
            {data.trend.map((row: any) => (
              <div
                key={row.label}
                className="flex h-full flex-1 flex-col justify-end text-center"
              >
                <span className="mb-2 hidden text-[10px] font-semibold text-slate-500 sm:block">
                  {money(row.value)}
                </span>
                <div
                  className="mx-auto w-full max-w-14 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-300"
                  style={{
                    height: `${Math.max((row.value / maxTrend) * 100, 3)}%`,
                  }}
                />
                <span className="mt-2 text-[10px] text-slate-500">
                  {row.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Breakdown title="Nilai per gudang" rows={data.warehouses} />
      </section>
      <div className="mt-6">
        <Breakdown title="Nilai per kategori item" rows={data.categories} />
      </div>
    </>
  );
}

function CostHistory({ data }: any) {
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Penerimaan tercatat"
          value={number(data.summary.events)}
          icon={ArrowDownToLine}
          tone="blue"
        />
        <SummaryCard
          label="HPP berubah"
          value={number(data.summary.changes)}
          icon={TrendingUp}
        />
        <SummaryCard
          label="HPP terbaru"
          value={money(data.summary.latestCost)}
          icon={Banknote}
          tone="amber"
        />
        <SummaryCard
          label="Rata-rata perubahan"
          value={money(data.summary.averageChange)}
          icon={Scale}
          tone={data.summary.averageChange < 0 ? "rose" : "emerald"}
        />
      </section>
      <ReportTable
        title="Riwayat perubahan HPP"
        note={
          data.limited
            ? "Menampilkan maksimal 500 penerimaan pertama."
            : `${data.rows.length} penerimaan stok ditemukan.`
        }
        headers={[
          "Tanggal",
          "Gudang",
          "Item / batch",
          "Referensi",
          "Qty masuk",
          "Harga masuk",
          "Harga sebelum",
          "Harga setelah",
          "Perubahan",
          "Petugas",
        ]}
      >
        {data.rows.length ? (
          data.rows.map((row: any) => (
            <tr key={row.id} className="hover:bg-slate-50/70">
              <Cell>{row.date}</Cell>
              <Cell>
                <b>{row.warehouse.name}</b>
                <small>{row.warehouse.code}</small>
              </Cell>
              <Cell>
                <b>{row.item.name}</b>
                <small>
                  {row.item.code} · {row.batch_no || "Tanpa batch"}
                </small>
              </Cell>
              <Cell>
                <b>{row.reference}</b>
                <small>{row.supplier || "Tanpa supplier"}</small>
              </Cell>
              <Cell strong>{number(row.incoming_qty)}</Cell>
              <Cell>{money(row.incoming_cost)}</Cell>
              <Cell>{money(row.cost_before)}</Cell>
              <Cell strong>{money(row.cost_after)}</Cell>
              <Cell
                strong
                tone={
                  row.difference > 0
                    ? "rose"
                    : row.difference < 0
                      ? "emerald"
                      : undefined
                }
              >
                <span>
                  {row.difference > 0 ? "+" : ""}
                  {money(row.difference)}
                </span>
                <small>
                  {row.percentage === null
                    ? "Harga awal"
                    : `${row.percentage > 0 ? "+" : ""}${number(row.percentage)}%`}
                </small>
              </Cell>
              <Cell>{row.creator || "-"}</Cell>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={10} />
        )}
      </ReportTable>
    </>
  );
}

function Breakdown({ title, rows }: any) {
  const maximum = Math.max(...rows.map((row: any) => row.value), 1);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <div className="mt-5 space-y-5">
        {rows.length ? (
          rows.map((row: any) => (
            <div key={row.name}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-slate-700">{row.name}</span>
                <span className="whitespace-nowrap font-semibold text-slate-950">
                  {money(row.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(row.value / maximum) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {number(row.qty)} unit
              </p>
            </div>
          ))
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}

function ReportTable({ title, note, headers, children }: any) {
  return (
    <section className="mt-5 min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{note}</p>
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1080px] table-auto text-sm">
          <thead className="bg-slate-50/80 text-left text-[11px] uppercase tracking-[.1em] text-slate-500">
            <tr>
              {headers.map((header: string) => (
                <th key={header} className="whitespace-nowrap px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ children, strong, tone }: any) {
  const color =
    tone === "rose"
      ? "text-rose-600"
      : tone === "emerald"
        ? "text-emerald-600"
        : "text-slate-700";

  return (
    <td
      className={`whitespace-nowrap px-4 py-3.5 [&_b]:block [&_b]:max-w-52 [&_b]:truncate [&_small]:mt-1 [&_small]:block [&_small]:max-w-52 [&_small]:truncate [&_small]:text-xs [&_small]:font-normal [&_small]:text-slate-400 ${strong ? `font-semibold ${color}` : "text-slate-600"}`}
    >
      {children}
    </td>
  );
}

function EmptyRow({ colSpan }: any) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <Empty />
      </td>
    </tr>
  );
}
