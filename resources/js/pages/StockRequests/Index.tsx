/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { Head, Link, router } from "@inertiajs/react";
import { ChevronDown, ClipboardList, Search } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../layouts/AppLayout";

const badge = (status = "") =>
  status === "received"
    ? "bg-emerald-50 text-emerald-700"
    : status === "rejected"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

const stageName = (step: any) =>
  ({
    requester: "Unit Peminta",
    unit_manager: "Manajer Unit",
    warehouse_admin: "Admin Gudang",
    warehouse_manager: "Manajer Gudang",
  })[step?.stage_key] || "Approval";

const requestStatus = (row: any) => {
  const steps = row.approval?.steps || [];
  if (row.status === "rejected") {
    return `Ditolak: ${stageName(steps.find((step: any) => step.status === "rejected"))}`;
  }
  if (row.status === "received") {
    return `Diterima: ${stageName([...steps].reverse().find((step: any) => step.status === "approved"))}`;
  }
  const active = steps.find(
    (step: any) => Number(step.level) === Number(row.approval?.current_level),
  );
  return active ? `Menunggu: ${stageName(active)}` : "Menunggu persetujuan";
};

export default function Index({
  requests,
  filters,
  units,
  sourceWarehouses,
}: any) {
  const [form, setForm] = useState({
    search: filters.search || "",
    unit_id: filters.unit_id || "",
    warehouse_id: filters.warehouse_id || "",
    status: filters.status || "",
    date_from: filters.date_from || "",
    date_to: filters.date_to || "",
  });

  const submit = (event: any) => {
    event.preventDefault();
    router.get("/stock-requests", form, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <AppLayout title="Daftar Request Stok Unit">
      <Head title="Daftar Request Stok Unit" />

      <section className="mb-6 rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-300">
          Fulfillment
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          Daftar Request Stok Unit
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Telusuri seluruh request berdasarkan unit, gudang sumber, tanggal, dan
          status.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6"
      >
        <label className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            value={form.search}
            onChange={(event) =>
              setForm({ ...form, search: event.target.value })
            }
            placeholder="Nomor atau nama item"
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-emerald-400"
          />
        </label>
        <FilterSelect
          value={form.unit_id}
          onChange={(value: string) => setForm({ ...form, unit_id: value })}
        >
          <option value="">Semua unit</option>
          {units.map((unit: any) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={form.warehouse_id}
          onChange={(value: string) =>
            setForm({ ...form, warehouse_id: value })
          }
        >
          <option value="">Semua gudang</option>
          {sourceWarehouses.map((warehouse: any) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          value={form.status}
          onChange={(value: string) => setForm({ ...form, status: value })}
        >
          <option value="">Semua status</option>
          <option value="waiting_approval">Menunggu</option>
          <option value="received">Diterima</option>
          <option value="rejected">Ditolak</option>
        </FilterSelect>
        <button className="h-10 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-500">
          Terapkan filter
        </button>
        <input
          type="date"
          value={form.date_from}
          onChange={(event) =>
            setForm({ ...form, date_from: event.target.value })
          }
          className="h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-400"
        />
        <input
          type="date"
          value={form.date_to}
          onChange={(event) =>
            setForm({ ...form, date_to: event.target.value })
          }
          className="h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-400"
        />
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[620px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_rgb(226,232,240)]">
              <tr>
                {[
                  "Request / tanggal",
                  "Unit peminta",
                  "Gudang sumber",
                  "Item",
                  "Total qty",
                  "Status",
                  "Detail",
                ].map((label) => (
                  <th key={label} className="whitespace-nowrap px-4 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.data.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-semibold text-slate-900">{row.number}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(row.request_date).toLocaleDateString("id-ID")}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                      {row.to_warehouse?.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {row.from_warehouse?.name}
                  </td>
                  <td className="px-4 py-4 font-medium">{row.details_count}</td>
                  <td className="px-4 py-4 font-medium">
                    {Number(row.total_qty_requested || 0).toLocaleString(
                      "id-ID",
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status)}`}
                    >
                      {requestStatus(row)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <details className="group">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-emerald-700 [&::-webkit-details-marker]:hidden">
                        Lihat{" "}
                        <ChevronDown
                          size={14}
                          className="transition group-open:rotate-180"
                        />
                      </summary>
                      <div className="fixed inset-x-4 z-20 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl sm:absolute sm:inset-x-auto sm:right-6 sm:w-[520px]">
                        {row.details.map((detail: any) => (
                          <div
                            key={detail.id}
                            className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 px-2 py-2.5 last:border-0"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {detail.item?.code} · {detail.item?.name}
                              </p>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {detail.uom?.code || detail.item?.base_uom}
                              </p>
                            </div>
                            <p className="text-xs font-semibold text-slate-700">
                              {Number(detail.qty_requested).toLocaleString(
                                "id-ID",
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!requests.data.length && (
          <div className="py-14 text-center text-sm text-slate-500">
            <ClipboardList className="mx-auto mb-3 text-slate-300" />
            Data request tidak ditemukan.
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Menampilkan {requests.from || 0}–{requests.to || 0} dari{" "}
            {requests.total} request
          </span>
          <div className="flex flex-wrap gap-1">
            {requests.links.map((link: any, index: number) =>
              link.url ? (
                <Link
                  key={index}
                  href={link.url}
                  preserveScroll
                  className={`rounded-lg px-3 py-2 font-semibold ${link.active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={index}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-slate-300"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ),
            )}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

function FilterSelect({ value, onChange, children }: any) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-400"
    >
      {children}
    </select>
  );
}
