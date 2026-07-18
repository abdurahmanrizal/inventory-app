/* eslint-disable @typescript-eslint/no-explicit-any */
import { Head, Link, router } from "@inertiajs/react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  History,
  Search,
  SlidersHorizontal,
  Warehouse,
} from "lucide-react";
import { FormEvent, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import { formatDateTime } from "../../lib/date";

const number = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value);
const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const input =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
const referenceLabel: Record<string, string> = {
  opening: "Saldo Awal",
  goods_receipt: "Goods Receipt",
  delivery: "Pengiriman",
  receipt: "Penerimaan Unit",
  adjustment: "Pemakaian / Adjustment",
  stock_in: "Stok Masuk",
  stock_out: "Stok Keluar",
};

export default function Index({
  activities,
  warehouses,
  canFilterWarehouse,
  activeWarehouse,
  filters,
  summary,
}: any) {
  const [form, setForm] = useState({
    warehouse_id: filters.warehouse_id || "",
    direction: filters.direction || "",
    reference_type: filters.reference_type || "",
    date_from: filters.date_from || "",
    date_to: filters.date_to || "",
    search: filters.search || "",
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    router.get(
      "/transaction-activities",
      Object.fromEntries(Object.entries(form).filter(([, value]) => value)),
      { preserveState: true, replace: true },
    );
  };
  const reset = () => {
    setForm({
      warehouse_id: "",
      direction: "",
      reference_type: "",
      date_from: "",
      date_to: "",
      search: "",
    });
    router.get("/transaction-activities");
  };

  return (
    <AppLayout title="Riwayat Aktivitas">
      <Head title="Riwayat Aktivitas" />
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300">
              <History size={14} /> Audit pergerakan persediaan
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              Riwayat aktivitas transaksi
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Setiap stok masuk dan keluar tercatat beserta gudang, item,
              pengguna, referensi, saldo akhir, dan waktu aktivitas.
            </p>
          </div>
          {!canFilterWarehouse && activeWarehouse && (
            <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
              <p className="text-xs text-slate-400">Ruang lingkup manajer</p>
              <p className="mt-1 text-sm font-semibold">
                {activeWarehouse.name}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Total aktivitas",
            number(summary.count),
            History,
            "bg-blue-50 text-blue-600",
          ],
          [
            "Stok masuk",
            number(summary.qtyIn),
            ArrowDownToLine,
            "bg-emerald-50 text-emerald-600",
          ],
          [
            "Stok keluar",
            number(summary.qtyOut),
            ArrowUpFromLine,
            "bg-rose-50 text-rose-600",
          ],
          [
            "Nilai pergerakan",
            money(summary.value),
            Banknote,
            "bg-amber-50 text-amber-600",
          ],
        ].map(([label, value, Icon, tone]: any) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <span
              className={`grid size-10 place-items-center rounded-xl ${tone}`}
            >
              <Icon size={19} />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-emerald-600" />
          <h3 className="font-semibold text-slate-900">Filter aktivitas</h3>
        </div>
        <form
          onSubmit={submit}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {canFilterWarehouse && (
            <select
              className={input}
              value={form.warehouse_id}
              onChange={(e) =>
                setForm({ ...form, warehouse_id: e.target.value })
              }
            >
              <option value="">Semua gudang / unit</option>
              {warehouses.map((x: any) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          )}
          <select
            className={input}
            value={form.direction}
            onChange={(e) => setForm({ ...form, direction: e.target.value })}
          >
            <option value="">Semua arah</option>
            <option value="in">Stok masuk</option>
            <option value="out">Stok keluar</option>
          </select>
          <select
            className={input}
            value={form.reference_type}
            onChange={(e) =>
              setForm({ ...form, reference_type: e.target.value })
            }
          >
            <option value="">Semua aktivitas</option>
            <option value="goods_receipt">Goods Receipt</option>
            <option value="delivery">Pengiriman</option>
            <option value="receipt">Penerimaan Unit</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <input
            type="date"
            className={input}
            value={form.date_from}
            onChange={(e) => setForm({ ...form, date_from: e.target.value })}
          />
          <input
            type="date"
            className={input}
            value={form.date_to}
            onChange={(e) => setForm({ ...form, date_to: e.target.value })}
          />
          <label className="relative">
            <Search
              size={15}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className={`${input} pl-9`}
              placeholder="Item, batch, nomor..."
              value={form.search}
              onChange={(e) => setForm({ ...form, search: e.target.value })}
            />
          </label>
          <div className="flex gap-2 xl:col-span-6">
            <button className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">
              Terapkan filter
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {activities.data.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-[.1em] text-slate-500">
                  <tr>
                    {[
                      "Waktu",
                      "Gudang / unit",
                      "Aktivitas",
                      "Item / batch",
                      "Stok awal",
                      "Perubahan",
                      "HPP",
                      "Saldo akhir",
                      "Pelaksana",
                    ].map((x) => (
                      <th key={x} className="whitespace-nowrap px-5 py-3.5">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.data.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDateTime(row.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {row.warehouse?.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.warehouse?.code}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${row.direction === "in" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {row.direction === "in" ? (
                            <ArrowDownToLine size={13} />
                          ) : (
                            <ArrowUpFromLine size={13} />
                          )}{" "}
                          {referenceLabel[
                            row.reference_type || row.stock_transaction?.type
                          ] ||
                            // row.stock_transaction?.type
                            //    ||
                            "Transaksi stok"}
                        </span>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.stock_transaction?.number ||
                            `Referensi #${row.reference_id || "-"}`}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {row.item?.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {row.item?.code} · {row.batch_no || "Tanpa batch"}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {number(
                          row.direction === "in"
                            ? Number(row.balance_qty) - Number(row.qty)
                            : Number(row.balance_qty) + Number(row.qty),
                        )}
                      </td>
                      <td
                        className={`px-5 py-4 font-semibold ${row.direction === "in" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {row.direction === "in" ? "+" : "-"}
                        {number(Number(row.qty))}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        {money(Number(row.unit_cost))}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {number(Number(row.balance_qty))}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {row.creator?.name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
              {activities.links.map((link: any, index: number) => (
                <Link
                  key={index}
                  href={link.url || "#"}
                  preserveScroll
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${link.active ? "bg-emerald-500 text-white" : link.url ? "border border-slate-200 text-slate-600" : "text-slate-300"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <History className="mx-auto text-slate-300" />
            <p className="mt-3 font-medium text-slate-600">
              Belum ada aktivitas
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Aktivitas stok yang sudah diposting akan muncul di sini.
            </p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
