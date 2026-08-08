/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Legacy WMS page migrated from JSX; type incrementally.
import { Head, Link, router, usePoll } from "@inertiajs/react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  CalendarDays,
  Clock3,
  Download,
  History,
  Image,
  Package,
  Search,
  Warehouse,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import AppLayout from "../../layouts/AppLayout";

const stockOutReasonLabels = {
  operational: "Operasional",
  shrinkage: "Penyusutan",
  expired: "Kedaluwarsa",
  damaged: "Barang Rusak",
  waste: "Waste / Terbuang",
  return: "Retur",
  restitution: "Pengembalian",
  other: "Lainnya",
};

const historyCategories = [
  { value: "all", label: "Semua" },
  { value: "stock_in", label: "Stock In" },
  { value: "stock_out", label: "Stock Out" },
  { value: "stock_request", label: "Request per Unit" },
  { value: "adjustment_opname", label: "Adjustment / Opname" },
];

export default function Index({
  transactions,
  workflowApprovals = [],
  approvalHistory = [],
  warehouses,
  canFilterWarehouse,
  selectedWarehouse,
  userRole,
  mainWarehouses = [],
  warehouseCounts = {},
}) {
  const [rejecting, setRejecting] = useState(null);
  const [approving, setApproving] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(null);
  const [previewEvidence, setPreviewEvidence] = useState(null);
  const [historyCategory, setHistoryCategory] = useState("all");
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [activeMainWarehouse, setActiveMainWarehouse] = useState(null);
  const isMainWarehouseManager = userRole === "warehouse_manager";

  const warehouseOfTransaction = (transaction) =>
    transaction.type === "stock_in"
      ? transaction.destination_warehouse_id
      : transaction.request_kind === "unit_return"
        ? transaction.destination_warehouse_id
      : transaction.source_warehouse_id || transaction.destination_warehouse_id;
  const warehouseOfWorkflow = (approval) =>
    approval.module === "stock_adjustment"
      ? approval.inventory_document?.warehouse_id
      : approval.stock_request?.from_warehouse_id;

  const visibleTransactions = isMainWarehouseManager && activeMainWarehouse
    ? (transactions.data || []).filter(
        (transaction) =>
          String(warehouseOfTransaction(transaction)) === activeMainWarehouse,
      )
    : transactions.data;
  const visibleWorkflowApprovals =
    isMainWarehouseManager && activeMainWarehouse
      ? workflowApprovals.filter(
          (approval) =>
            String(warehouseOfWorkflow(approval)) === activeMainWarehouse,
        )
      : workflowApprovals;

  const dateFilteredHistory = useMemo(() => {
    const search = historySearch.trim().toLocaleLowerCase("id-ID");
    const from = historyDateFrom
      ? new Date(`${historyDateFrom}T00:00:00`)
      : null;
    const to = historyDateTo ? new Date(`${historyDateTo}T23:59:59.999`) : null;

    return approvalHistory.filter((history) => {
      const actedAt = new Date(history.acted_at);
      const matchesDate = (!from || actedAt >= from) && (!to || actedAt <= to);
      const searchableText = [
        history.transaction_no,
        history.stage_label,
        history.source_name,
        history.destination_name,
        history.remarks,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return matchesDate && (!search || searchableText.includes(search));
    });
  }, [approvalHistory, historyDateFrom, historyDateTo, historySearch]);

  const historyCounts = useMemo(
    () =>
      historyCategories.reduce(
        (counts, category) => ({
          ...counts,
          [category.value]:
            category.value === "all"
              ? dateFilteredHistory.length
              : dateFilteredHistory.filter(
                  (history) => history.category === category.value,
                ).length,
        }),
        {},
      ),
    [dateFilteredHistory],
  );

  const visibleHistory = useMemo(
    () =>
      historyCategory === "all"
        ? dateFilteredHistory
        : dateFilteredHistory.filter(
            (history) => history.category === historyCategory,
          ),
    [dateFilteredHistory, historyCategory],
  );

  usePoll(5000, {
    only: [
      "transactions",
      "workflowApprovals",
      "approvalHistory",
      "mainWarehouses",
      "warehouseCounts",
      "approvalScope",
    ],
    preserveScroll: true,
    preserveState: true,
  });

  const approve = () => {
    if (!approving) {
      return;
    }

    setProcessing(`${approving.kind || "transaction"}-${approving.id}`);
    router.post(
      approving.kind === "workflow"
        ? `/workflow-approvals/${approving.id}`
        : `/approvals/${approving.id}/approve`,
      approving.kind === "workflow" ? { action: "approved" } : {},
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

    setProcessing(`${rejecting.kind || "transaction"}-${rejecting.id}`);
    router.post(
      rejecting.kind === "workflow"
        ? `/workflow-approvals/${rejecting.id}`
        : `/approvals/${rejecting.id}/reject`,
      rejecting.kind === "workflow"
        ? { action: "rejected", remarks }
        : { remarks },
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
    <AppLayout title="Pusat Approval">
      <Head title="Pusat Approval" />

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
                {(transactions.total ?? transactions.data.length) +
                  workflowApprovals.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-amber-700">
                Menunggu tindakan
              </p>
            </div>
          </div>
        </div>
      </div>

      {isMainWarehouseManager && mainWarehouses.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainWarehouse(null)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${!activeMainWarehouse ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"}`}
          >
            Semua gudang utama
            <span
              className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] ${!activeMainWarehouse ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {(transactions.total ?? transactions.data.length) +
                workflowApprovals.length}
            </span>
          </button>
          {mainWarehouses.map((warehouse) => {
            const count = warehouseCounts[warehouse.id] || 0;
            const active = activeMainWarehouse === String(warehouse.id);

            return (
              <button
                key={warehouse.id}
                type="button"
                onClick={() => setActiveMainWarehouse(String(warehouse.id))}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${active ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"}`}
              >
                {warehouse.name}
                <span
                  className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        {visibleWorkflowApprovals.map((approval) => {
          const stockRequest = approval.stock_request;
          const inventoryDocument = approval.inventory_document;
          const isInventoryControl = approval.module === "stock_adjustment";
          const isOpname = Boolean(inventoryDocument?.stock_opname_id);
          const activeStep = approval.steps.find(
            (step) => Number(step.level) === Number(approval.current_level),
          );
          const actionTarget = {
            ...approval,
            kind: "workflow",
            number: approval.transaction_no,
          };

          return (
            <article
              key={`workflow-${approval.id}`}
              className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]"
            >
              <div className="flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      {isInventoryControl ? (
                        <ClipboardCheck size={19} />
                      ) : (
                        <Package size={19} />
                      )}
                    </span>
                    <div>
                      <h3 className="font-semibold tracking-tight text-slate-950">
                        {approval.transaction_no}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Diajukan oleh{" "}
                        {isInventoryControl
                          ? inventoryDocument?.creator?.name || "-"
                          : stockRequest?.requester?.name || "-"}
                      </p>
                    </div>
                    {isInventoryControl && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                        {isOpname ? "Stock Opname" : "Adjustment Stok"}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
                      {activeStep?.stage_label || "Menunggu persetujuan"}
                    </span>
                    {!isInventoryControl &&
                      stockRequest?.to_warehouse?.name && (
                        <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/10">
                          Unit: {stockRequest.to_warehouse.name}
                        </span>
                      )}
                  </div>

                  {isInventoryControl ? (
                    <div className="mt-5 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
                          Gudang
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {inventoryDocument?.warehouse?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
                          Tanggal dokumen
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {inventoryDocument?.adjustment_date
                            ? new Date(
                                inventoryDocument.adjustment_date,
                              ).toLocaleDateString("id-ID")
                            : "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">
                        {stockRequest?.from_warehouse?.name || "-"}
                      </span>
                      <ArrowRight size={15} className="text-slate-300" />
                      <span className="font-medium text-slate-800">
                        {stockRequest?.to_warehouse?.name || "-"}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                    {(isInventoryControl
                      ? isOpname
                        ? inventoryDocument?.opname?.details || []
                        : inventoryDocument?.details || []
                      : stockRequest?.details || []
                    ).map((detail) => (
                      <div
                        key={detail.id}
                        className="rounded-xl border border-slate-100 p-3.5"
                      >
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {detail.item?.code} · {detail.item?.name}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {isOpname ? (
                            <>
                              Sistem{" "}
                              <b className="font-semibold text-slate-700">
                                {Number(detail.system_qty).toLocaleString(
                                  "id-ID",
                                )}
                              </b>{" "}
                              · Fisik{" "}
                              <b className="font-semibold text-slate-700">
                                {Number(detail.count_qty).toLocaleString(
                                  "id-ID",
                                )}
                              </b>{" "}
                              · Selisih{" "}
                              <b
                                className={
                                  Number(detail.diff_qty) === 0
                                    ? "font-semibold text-slate-700"
                                    : "font-semibold text-rose-600"
                                }
                              >
                                {Number(detail.diff_qty).toLocaleString(
                                  "id-ID",
                                )}
                              </b>
                            </>
                          ) : (
                            <>
                              {isInventoryControl ? "Perubahan " : "Request "}
                              <b className="font-semibold text-slate-700">
                                {Number(
                                  isInventoryControl
                                    ? detail.qty_adjustment
                                    : detail.qty_requested,
                                ).toLocaleString("id-ID")}{" "}
                                {detail.uom?.code || detail.item?.base_uom}
                              </b>
                              {!isInventoryControl &&
                                Number(detail.qty_approved) > 0 && (
                                  <>
                                    {" "}
                                    · Disetujui{" "}
                                    <b className="font-semibold text-emerald-700">
                                      {Number(
                                        detail.qty_approved,
                                      ).toLocaleString("id-ID")}{" "}
                                      {detail.uom?.code ||
                                        detail.item?.base_uom}
                                    </b>
                                  </>
                                )}
                            </>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {(isInventoryControl
                    ? inventoryDocument?.reason ||
                      inventoryDocument?.opname?.notes
                    : stockRequest?.notes) && (
                    <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      Catatan:{" "}
                      {isInventoryControl
                        ? inventoryDocument?.opname?.notes ||
                          inventoryDocument?.reason
                        : stockRequest.notes}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row xl:w-48 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 xl:flex-col">
                  <button
                    disabled={processing === `workflow-${approval.id}`}
                    onClick={() => setApproving(actionTarget)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    <Check size={17} /> Setujui
                  </button>
                  <button
                    disabled={processing === `workflow-${approval.id}`}
                    onClick={() => setRejecting(actionTarget)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    <XCircle size={17} /> Tolak
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {visibleTransactions.map((transaction) => (
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
                  {transaction.type === "stock_in" && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                      Kategori Stock In
                    </span>
                  )}
                </div>

                {transaction.type === "stock_in" && (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-blue-600">
                        Supplier
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {transaction.supplier_name || "Tidak dicantumkan"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-blue-600">
                        Tanggal dokumen
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {new Date(transaction.document_date).toLocaleDateString(
                          "id-ID",
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {transaction.type === "stock_out" && (
                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-orange-600">
                      Jenis Pengeluaran
                    </p>
                    <p className="mt-1 text-sm font-semibold text-orange-950">
                      {stockOutReasonLabels[transaction.stock_out_reason] ||
                        "Tidak dicantumkan"}
                    </p>
                  </div>
                )}

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
                            {" "}
                            {detail.item?.base_uom || ""}
                          </b>
                        </span>
                        <span>
                          HPP{" "}
                          <b className="font-semibold text-slate-700">
                            Rp{" "}
                            {Number(
                              transaction.type === "stock_out"
                                ? (detail.current_hpp ?? detail.unit_cost)
                                : detail.unit_cost,
                            ).toLocaleString("id-ID")}
                          </b>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {transaction.type === "stock_in" && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[.12em] text-slate-500">
                      File pendukung
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        [
                          "receipt",
                          "Foto nota",
                          transaction.receipt_image_path,
                        ],
                        [
                          "payment",
                          "Bukti pembayaran",
                          transaction.payment_proof_image_path,
                        ],
                        [
                          "delivery",
                          "Bukti pengiriman",
                          transaction.delivery_proof_image_path,
                        ],
                      ].map(([kind, label, path]) =>
                        path ? (
                          <button
                            key={kind}
                            type="button"
                            onClick={() =>
                              setPreviewEvidence({
                                url: `/stock-transactions/${transaction.id}/evidence/${kind}`,
                                label,
                              })
                            }
                            className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-md"
                          >
                            <img
                              src={`/stock-transactions/${transaction.id}/evidence/${kind}`}
                              alt={label}
                              className="h-32 w-full bg-slate-100 object-cover"
                            />
                            <span className="flex items-center justify-between px-3.5 py-3 text-xs font-semibold text-slate-700">
                              {label}
                              <span className="text-blue-600">Lihat penuh</span>
                            </span>
                          </button>
                        ) : (
                          <div
                            key={kind}
                            className="grid min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center"
                          >
                            <span>
                              <Image
                                className="mx-auto text-slate-300"
                                size={22}
                              />
                              <span className="mt-2 block text-xs text-slate-400">
                                {label} tidak dilampirkan
                              </span>
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row xl:w-48 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 xl:flex-col">
                <button
                  disabled={processing === `transaction-${transaction.id}`}
                  onClick={() => setApproving(transaction)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  <Check size={17} />{" "}
                  {transaction.type === "stock_in"
                    ? "Setujui & Masukkan Stok"
                    : "Setujui & Posting"}
                </button>
                <button
                  disabled={processing === `transaction-${transaction.id}`}
                  onClick={() => setRejecting(transaction)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                >
                  <XCircle size={17} /> Tolak
                </button>
              </div>
            </div>
          </article>
        ))}

        {!visibleTransactions.length && !visibleWorkflowApprovals.length && (
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

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <History size={19} />
            </span>
            <div>
              <h3 className="font-semibold text-slate-950">
                Riwayat Approval Saya
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Seluruh keputusan yang pernah Anda lakukan.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px]">
            <label className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="search"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Cari nomor, gudang, tahap, catatan..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </label>
            <label className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="date"
                aria-label="Tanggal mulai"
                value={historyDateFrom}
                max={historyDateTo || undefined}
                onChange={(event) => setHistoryDateFrom(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </label>
            <label className="relative">
              <CalendarDays
                size={15}
                className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="date"
                aria-label="Tanggal akhir"
                value={historyDateTo}
                min={historyDateFrom || undefined}
                onChange={(event) => setHistoryDateTo(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {historyCategories.map((category) => {
              const active = historyCategory === category.value;

              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setHistoryCategory(category.value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  {category.label}
                  <span
                    className={`grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {historyCounts[category.value] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {visibleHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visibleHistory.map((history) => (
              <div
                key={history.key}
                className="grid gap-4 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">
                      {history.transaction_no}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        history.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {history.status === "approved" ? "Disetujui" : "Ditolak"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {history.stage_label}
                    {history.source_name &&
                      ` · ${history.source_name} → ${history.destination_name || "Eksternal"}`}
                  </p>
                  {history.remarks && (
                    <p className="mt-2 text-sm italic text-slate-600">
                      “{history.remarks}”
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <time className="text-xs text-slate-500">
                    {new Date(history.acted_at).toLocaleString("id-ID")}
                  </time>
                  {history.can_download_delivery_note &&
                    history.category === "stock_request" && (
                      <a
                        href={`/stock-requests/${history.stock_request_id}/delivery-note`}
                        target="_blank"
                        rel="noreferrer"
                        title={`Sudah diunduh ${history.delivery_note_download_count ?? 0} kali`}
                        className="relative inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:border-emerald-500 hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                      >
                        <Download size={15} />
                        Unduh Surat Jalan
                        <span
                          aria-label={`Sudah diunduh ${history.delivery_note_download_count ?? 0} kali`}
                          className="absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-blue-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm"
                        >
                          {history.delivery_note_download_count ?? 0}
                        </span>
                      </a>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Tidak ada riwayat yang sesuai dengan filter.
          </div>
        )}
      </section>

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
                  remarks.trim().length < 5 ||
                  processing ===
                    `${rejecting.kind || "transaction"}-${rejecting.id}`
                }
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/15 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </form>
        </div>
      )}
      {previewEvidence && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setPreviewEvidence(null)
          }
        >
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="font-semibold text-slate-900">
                  {previewEvidence.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Dokumen pendukung pengajuan Stock In
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup preview"
                onClick={() => setPreviewEvidence(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto bg-slate-100 p-4">
              <img
                src={previewEvidence.url}
                alt={previewEvidence.label}
                className="mx-auto max-h-[70vh] rounded-lg bg-white object-contain shadow"
              />
            </div>
          </div>
        </div>
      )}
      <ConfirmActionDialog
        open={Boolean(approving)}
        onOpenChange={(open) => !open && setApproving(null)}
        onConfirm={approve}
        processing={
          processing === `${approving?.kind || "transaction"}-${approving?.id}`
        }
        title={
          approving?.type === "stock_in"
            ? "Setujui Stock In?"
            : "Setujui dan posting transaksi?"
        }
        description={
          approving?.type === "stock_in"
            ? `Setelah ${approving?.number || ""} disetujui, stok akan masuk ke saldo gudang.`
            : `Transaksi ${approving?.number || ""} akan memengaruhi saldo stok dan tidak dapat disetujui ulang.`
        }
        confirmLabel={
          approving?.type === "stock_in"
            ? "Ya, setujui & masukkan stok"
            : "Ya, setujui & posting"
        }
      />
    </AppLayout>
  );
}
