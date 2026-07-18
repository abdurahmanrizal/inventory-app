/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Legacy WMS page migrated from JSX; type incrementally.
import { Head, Link, router } from "@inertiajs/react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock3,
  Package,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import AppLayout from "../../layouts/AppLayout";

export default function Index({
  transactions,
  warehouses,
  canFilterWarehouse,
  selectedWarehouse,
}) {
  const [rejecting, setRejecting] = useState(null);
  const [approving, setApproving] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(null);

  const approve = () => {
    if (!approving) {
      return;
    }

    setProcessing(approving.id);
    router.post(
      `/approvals/${approving.id}/approve`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => setApproving(null),
        onFinish: () => setProcessing(null),
      },
    );
  };

  const reject = (event) => {
    event.preventDefault();

    if (remarks.trim().length < 5) {
      return;
    }

    setProcessing(rejecting.id);
    router.post(
      `/approvals/${rejecting.id}/reject`,
      { remarks },
      {
        preserveScroll: true,
        onSuccess: () => {
          setRejecting(null);
          setRemarks("");
        },
        onFinish: () => setProcessing(null),
      },
    );
  };

  return (
    <AppLayout title="Approval Manajer">
      <Head title="Approval Manajer" />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-amber-700">
            Pusat persetujuan
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Antrean approval
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tinjau detail setiap transaksi sebelum memperbarui saldo persediaan.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {canFilterWarehouse && (
            <label className="relative">
              <Warehouse
                size={16}
                className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
              />
              <select
                value={selectedWarehouse || ""}
                onChange={(event) =>
                  router.get(
                    "/approvals",
                    event.target.value
                      ? { warehouse_id: event.target.value }
                      : {},
                    { preserveState: true, replace: true },
                  )
                }
                className="h-11 min-w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
              >
                <option value="">Semua gudang / unit</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 size={18} />
            </span>
            <div>
              <p className="text-lg font-semibold leading-none text-amber-900">
                {transactions.total ?? transactions.data.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-amber-700">
                Menunggu tindakan
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.data.map((transaction) => (
          <article
            key={transaction.id}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
          >
            <div className="flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                    <Package size={19} />
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-slate-950">
                      {transaction.number}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Dibuat oleh {transaction.creator?.name || "-"}
                    </p>
                  </div>
                  <span className="ml-0 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 sm:ml-2">
                    <span className="size-1.5 rounded-full bg-amber-500" />{" "}
                    Menunggu approval
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">
                    {transaction.source_warehouse?.name || "Eksternal"}
                  </span>
                  <ArrowRight size={15} className="text-slate-300" />
                  <span className="font-medium text-slate-800">
                    {transaction.destination_warehouse?.name || "Eksternal"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {transaction.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="rounded-xl border border-slate-100 p-3.5"
                    >
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {detail.item.code} · {detail.item.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>
                          Qty{" "}
                          <b className="font-semibold text-slate-700">
                            {Number(detail.qty).toLocaleString("id-ID")}
                          </b>
                        </span>
                        <span>
                          HPP{" "}
                          <b className="font-semibold text-slate-700">
                            Rp{" "}
                            {Number(detail.unit_cost).toLocaleString("id-ID")}
                          </b>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row xl:w-48 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 xl:flex-col">
                <button
                  disabled={processing === transaction.id}
                  onClick={() => setApproving(transaction)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  <Check size={17} /> Setujui & Posting
                </button>
                <button
                  disabled={processing === transaction.id}
                  onClick={() => setRejecting(transaction)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                >
                  <XCircle size={17} /> Tolak
                </button>
              </div>
            </div>
          </article>
        ))}

        {!transactions.data.length && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck size={25} />
            </span>
            <h3 className="mt-4 font-semibold text-slate-800">
              Semua sudah ditinjau
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tidak ada transaksi yang menunggu approval.
            </p>
          </div>
        )}
      </div>

      {transactions.links?.length > 3 && (
        <nav className="mt-6 flex flex-wrap justify-center gap-1.5">
          {transactions.links.map((link, index) =>
            link.url ? (
              <Link
                key={index}
                href={link.url}
                preserveScroll
                className={`grid min-h-9 min-w-9 place-items-center rounded-lg border px-3 text-sm transition ${link.active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ) : (
              <span
                key={index}
                className="grid min-h-9 min-w-9 place-items-center rounded-lg border border-slate-100 px-3 text-sm text-slate-300"
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ),
          )}
        </nav>
      )}

      {rejecting && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setRejecting(null)
          }
        >
          <form
            onSubmit={reject}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <h3 className="font-semibold text-slate-950">
                  Tolak transaksi
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {rejecting.number}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setRejecting(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <label className="text-xs font-semibold text-slate-700">
                Alasan penolakan <b className="text-rose-500">*</b>
              </label>
              <textarea
                autoFocus
                rows={4}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Jelaskan alasan penolakan secara singkat..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
              />
              <p
                className={`mt-1.5 text-xs ${remarks.length > 0 && remarks.trim().length < 5 ? "text-rose-500" : "text-slate-400"}`}
              >
                Minimal 5 karakter.
              </p>
            </div>
            <div className="flex justify-end gap-2 bg-slate-50 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                disabled={
                  remarks.trim().length < 5 || processing === rejecting.id
                }
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/15 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmActionDialog
        open={Boolean(approving)}
        onOpenChange={(open) => !open && setApproving(null)}
        onConfirm={approve}
        processing={processing === approving?.id}
        title="Setujui dan posting transaksi?"
        description={`Transaksi ${approving?.number || ""} akan memengaruhi saldo stok dan tidak dapat disetujui ulang.`}
        confirmLabel="Ya, setujui & posting"
      />
    </AppLayout>
  );
}
