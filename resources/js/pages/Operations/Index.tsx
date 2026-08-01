import { Head, Link, router, useForm } from "@inertiajs/react";
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AppLayout from "../../layouts/AppLayout";

const titles: Record<string, string> = {
  "master-data": "Master Data",
  purchasing: "Purchasing & Goods Receipt",
  fulfillment: "Request Stok ke Gudang Kering/Basah",
  "inventory-control": "Inventory Control",
};
const masterTitles: Record<string, string> = {
  supplier: "Master Supplier",
  item: "Master Item",
  location: "Master Lokasi",
  uom: "Master Satuan",
};
const badge = (status = "") =>
  status.includes("approved") ||
  status.includes("posted") ||
  status.includes("received")
    ? "bg-emerald-50 text-emerald-700"
    : status.includes("reject")
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
const statusText = (status = "") =>
  ({
    draft: "Draf",
    waiting_approval: "Menunggu persetujuan",
    approved: "Disetujui",
    posted: "Diposting",
    delivering: "Sedang dikirim",
    received: "Sudah diterima",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
  })[status] || status.replaceAll("_", " ");

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function Field({ label, children }: any) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
function Select({
  value,
  onChange,
  children,
  placeholder = "Pilih data",
}: any) {
  return (
    <select className={input} value={value} onChange={onChange}>
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
}
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Cari dan pilih data",
}: any) {
  const selected = options.find(
    (option: any) => String(option.value) === String(value),
  );
  const [query, setQuery] = useState(selected?.label || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected?.label || "");
  }, [value, selected?.label]);

  const filtered = options
    .filter((option: any) =>
      option.label.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 50);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery(selected?.label || "");
        }
      }}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-3.5 z-10 text-slate-400"
      />
      <input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        className={`${input} pl-10 pr-9`}
        onFocus={(event) => {
          setOpen(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (!event.target.value) {
            onChange("");
          }
        }}
      />
      <ChevronDown
        size={16}
        className={`pointer-events-none absolute right-3.5 top-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`}
      />
      {open && (
        <div className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {filtered.length ? (
            filtered.map((option: any) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(String(option.value));
                  setQuery(option.label);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${
                  String(option.value) === String(value)
                    ? "bg-emerald-50 font-semibold text-emerald-700"
                    : "text-slate-700"
                }`}
              >
                <span>{option.label}</span>
                {String(option.value) === String(value) && <Check size={15} />}
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-xs text-slate-500">
              Barang tidak ditemukan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
function Card({ title, description, children }: any) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function Operations({
  module,
  items,
  warehouses,
  suppliers,
  uoms,
  locations,
  managers,
  records,
  pendingApprovals,
  approvalHistory,
  fulfillmentAccess,
  requestStockItems,
  initialMaster,
}: any) {
  const [kind, setKind] = useState(
    module === "purchasing"
      ? "purchase-order"
      : module === "fulfillment"
        ? "request"
        : module === "master-data"
          ? initialMaster || "supplier"
          : "adjustment",
  );
  const [editing, setEditing] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const importFileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const form = useForm<any>({
    code: "",
    name: "",
    phone: "",
    address: "",
    type:
      module === "fulfillment"
        ? "transfer"
        : module === "inventory-control"
          ? "correction"
          : "base",
    supplier_id: "",
    warehouse_id:
      module === "inventory-control" && !fulfillmentAccess?.isSuperadmin
        ? fulfillmentAccess?.warehouseId || ""
        : "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    purchase_order_id: "",
    stock_request_id: "",
    delivery_id: "",
    item_id: "",
    uom_id: "",
    qty: 1,
    unit_price: 0,
    approver_id: "",
    expected_date: "",
    batch_no: "",
    expired_at: "",
    location_id: "",
    reason: "",
    notes: "",
    details: [
      {
        item_id: "",
        uom_id: "",
        qty: 1,
        batch_no: "",
        location_id: "",
      },
    ],
    base_uom: "PCS",
    warehouse_type: "dry",
    min_stock: 0,
    issue_method: "fifo",
    has_batch: true,
    has_expired: false,
    is_active: true,
  });
  const endpoint: Record<string, string> = {
    supplier: "/operations/master-data/suppliers",
    uom: "/operations/master-data/uoms",
    location: "/operations/master-data/locations",
    item: "/operations/master-data/items",
    "purchase-order": "/operations/purchasing/purchase-orders",
    grn: "/operations/purchasing/goods-receipts",
    request: "/operations/fulfillment/requests",
    delivery: "/operations/fulfillment/deliveries",
    receipt: "/operations/fulfillment/receipts",
    adjustment: "/operations/inventory-control/adjustments",
    opname: "/operations/inventory-control/opnames",
  };
  const opnameItems = items.filter((item: any) =>
    records?.stocks?.some(
      (stock: any) =>
        Number(stock.warehouse_id) === Number(form.data.warehouse_id) &&
        Number(stock.item_id) === Number(item.id) &&
        Number(stock.qty_on_hand) > 0,
    ),
  );
  const availableRequestItems = (requestStockItems || []).filter(
    (stock: any) =>
      Number(stock.warehouse_id) === Number(form.data.from_warehouse_id),
  );
  const selectedManager = managers.find(
    (manager: any) =>
      Number(manager.warehouse_id) === Number(form.data.warehouse_id),
  );
  const cancelEdit = () => {
    setEditing(null);
    form.reset();
  };
  const startEdit = (type: string, row: any) => {
    setKind(type);
    setEditing({ type, id: row.id });
    form.clearErrors();
    form.setData({
      ...form.data,
      ...row,
      warehouse_id: row.warehouse_id || "",
      is_active: row.is_active !== false,
      has_batch: !!row.has_batch,
      has_expired: !!row.has_expired,
    });
    window.scrollTo({ top: 250, behavior: "smooth" });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(
          editing
            ? "Master data berhasil diperbarui."
            : "Dokumen berhasil diproses.",
        );
        cancelEdit();
      },
      onError: (errors: any) => toast.error(Object.values(errors)[0] as string),
    };

    if (editing) {
      form.put(`${endpoint[editing.type]}/${editing.id}`, options);
    } else {
      form.post(endpoint[kind], options);
    }
  };
  const importItems = () => {
    if (!importFile) {
      toast.error("Pilih file Excel atau CSV terlebih dahulu.");

      return;
    }

    setImporting(true);
    router.post(
      "/operations/master-data/items/import",
      { file: importFile },
      {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Data item berhasil diimpor.");
          setImportFile(null);

          if (importFileInput.current) {
            importFileInput.current.value = "";
          }
        },
        onError: (errors) =>
          toast.error((Object.values(errors)[0] as string) || "Impor gagal."),
        onFinish: () => setImporting(false),
      },
    );
  };
  const tabs =
    module === "master-data"
      ? [
          ["supplier", "Supplier"],
          ["uom", "Satuan"],
          ["location", "Lokasi"],
          ["item", "Item"],
        ]
      : module === "purchasing"
        ? [
            ["purchase-order", "Purchase Order"],
            ["grn", "Goods Receipt"],
          ]
        : module === "fulfillment"
          ? [["request", "Request stok"]]
          : [
              ["adjustment", "Adjustment"],
              ["opname", "Stock Opname"],
            ];
  const orders = records?.orders || [];
  const requests = records?.requests || [];
  const deliveries = records?.deliveries || [];
  const pageTitle =
    module === "master-data"
      ? masterTitles[kind] || titles[module]
      : titles[module];

  return (
    <AppLayout title={pageTitle}>
      <Head title={pageTitle} />
      <section className="mb-6 flex flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-300">
            <Boxes size={14} />{" "}
            {module === "fulfillment"
              ? "Permintaan persediaan unit"
              : "Alur WMS terintegrasi"}
          </span>
          <h2 className="mt-4 text-2xl font-semibold">{pageTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {module === "fulfillment"
              ? "Pilih gudang tujuan, tambahkan barang yang dibutuhkan, lalu kirim permintaan untuk disetujui."
              : "Setiap dokumen tersambung ke approval, saldo stok, reservasi, HPP dan ledger audit."}
          </p>
        </div>
        <div className="min-w-56 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3.5">
          <p className="text-xs text-slate-400">Perlu tindakan Anda</p>
          <p className="mt-1 text-sm font-medium text-white">
            {pendingApprovals.length > 0
              ? `${pendingApprovals.length} permintaan menunggu persetujuan`
              : "Tidak ada permintaan tertunda"}
          </p>
        </div>
      </section>

      {module === "fulfillment" && fulfillmentAccess.canRequest && (
        <section className="mb-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3">
          {[
            ["1", "Pilih gudang", "Tentukan gudang kering atau basah."],
            ["2", "Isi kebutuhan", "Pilih barang, satuan, dan jumlah."],
            ["3", "Kirim permintaan", "Pantau persetujuan pada riwayat."],
          ].map(([number, label, description], index) => (
            <div
              key={number}
              className={`flex gap-3 px-5 py-4 ${index > 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""}`}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                {number}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {pendingApprovals.length > 0 && (
        <Card
          title="Approval aktif"
          description="Tahap approval yang saat ini menjadi tanggung jawab Anda."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {pendingApprovals.map((approval: any) => (
              <div
                key={approval.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    {approval.module.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 font-semibold">
                    {approval.transaction_no}
                  </p>
                  <p className="text-xs text-slate-500">
                    {approval.steps?.find(
                      (step: any) =>
                        Number(step.level) === Number(approval.current_level),
                    )?.stage_label || "Menunggu persetujuan Anda"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const remarks = window.prompt(
                        "Tuliskan alasan penolakan (minimal 5 karakter):",
                      );

                      if (remarks === null) {
                        return;
                      }

                      router.post(
                        `/workflow-approvals/${approval.id}`,
                        { action: "rejected", remarks },
                        { preserveScroll: true },
                      );
                    }}
                    title="Tolak permintaan"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
                  >
                    <X size={15} /> Tolak
                  </button>
                  <button
                    onClick={() =>
                      router.post(
                        `/workflow-approvals/${approval.id}`,
                        { action: "approved" },
                        { preserveScroll: true },
                      )
                    }
                    title="Setujui permintaan"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Check size={15} /> Setujui
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {module === "fulfillment" && approvalHistory.length > 0 && (
        <Card
          title="Riwayat Approval Saya"
          description="Keputusan dan pengajuan yang pernah diproses oleh akun Anda."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {approvalHistory.flatMap((approval: any) =>
              approval.steps.map((step: any) => (
                <div
                  key={`${approval.id}-${step.id}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {approval.transaction_no}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {step.stage_label || `Approval tahap ${step.level}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge(step.status)}`}
                    >
                      {step.status === "approved"
                        ? "Disetujui"
                        : step.status === "rejected"
                          ? "Ditolak"
                          : step.status}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500">
                    {step.actor?.name}
                    {step.acted_at &&
                      ` · ${new Date(step.acted_at).toLocaleString("id-ID")}`}
                  </p>
                  {step.remarks && (
                    <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-slate-600">
                      “{step.remarks}”
                    </p>
                  )}
                </div>
              )),
            )}
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
        {module !== "fulfillment" || fulfillmentAccess.canRequest ? (
          <Card
            title={
              editing
                ? `Edit ${tabs.find(([id]) => id === kind)?.[1]}`
                : module === "fulfillment"
                  ? "Buat permintaan stok"
                  : "Buat dokumen"
            }
            description={
              editing
                ? "Perbarui data lalu simpan perubahan."
                : module === "fulfillment"
                  ? "Lengkapi kebutuhan unit Anda. Kolom bertanda wajib harus diisi."
                  : "Pilih proses, lengkapi data, lalu ajukan."
            }
          >
            <div
              className={`mb-5 flex flex-wrap gap-2 ${["fulfillment", "master-data"].includes(module) ? "hidden" : ""}`}
            >
              {tabs.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setKind(id);
                    cancelEdit();
                  }}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold ${kind === id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {module === "inventory-control" && (
              <div className="mb-5 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-sm">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Alur persetujuan gudang
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                      <span className="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                        Admin membuat dokumen
                      </span>
                      <ArrowRight size={14} className="text-emerald-500" />
                      <span className="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                        Manajer gudang meninjau
                      </span>
                      <ArrowRight size={14} className="text-emerald-500" />
                      <span className="rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                        Stok diperbarui
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Perubahan saldo baru diposting setelah manajer gudang
                      terkait menyetujui dokumen.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {module === "master-data" && kind === "item" && !editing && (
              <div className="mb-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Impor beberapa item sekaligus
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Gunakan template Excel. Kolom satuan dapat dipilih dari
                      master satuan aktif.
                    </p>
                  </div>
                  <a
                    href="/operations/master-data/items/import-template"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 whitespace-nowrap"
                  >
                    <Download size={15} /> Unduh template
                  </a>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    id="item-import-file"
                    ref={importFileInput}
                    type="file"
                    accept=".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                    onChange={(event) =>
                      setImportFile(event.target.files?.[0] || null)
                    }
                    className="sr-only"
                  />
                  <div className="min-w-0 flex-1">
                    {importFile ? (
                      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 shadow-sm shadow-emerald-950/[0.03]">
                        <FileSpreadsheet
                          size={20}
                          className="shrink-0 text-emerald-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-xs font-semibold text-slate-700"
                            title={importFile.name}
                          >
                            {importFile.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {formatFileSize(importFile.size)}
                          </p>
                        </div>
                        <label
                          htmlFor="item-import-file"
                          className="cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Ganti
                        </label>
                        <button
                          type="button"
                          aria-label="Hapus file terpilih"
                          onClick={() => {
                            setImportFile(null);

                            if (importFileInput.current) {
                              importFileInput.current.value = "";
                            }
                          }}
                          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="item-import-file"
                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50/30"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FileSpreadsheet size={17} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-700">
                            Pilih file untuk diimpor
                          </span>
                          <span className="mt-0.5 block text-[11px] text-slate-500">
                            Format XLSX atau CSV, maksimal 2 MB
                          </span>
                        </span>
                      </label>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={!importFile || importing}
                    onClick={importItems}
                    className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
                  >
                    <Upload
                      size={15}
                      className={importing ? "animate-pulse" : ""}
                    />{" "}
                    {importing ? "Mengimpor..." : "Impor item"}
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              {kind === "supplier" && (
                <>
                  <Field label="Kode supplier">
                    <input
                      className={input}
                      value={form.data.code}
                      onChange={(e) => form.setData("code", e.target.value)}
                    />
                  </Field>
                  <Field label="Nama supplier">
                    <input
                      className={input}
                      value={form.data.name}
                      onChange={(e) => form.setData("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Telepon">
                    <input
                      className={input}
                      value={form.data.phone}
                      onChange={(e) => form.setData("phone", e.target.value)}
                    />
                  </Field>
                  <Field label="Alamat">
                    <input
                      className={input}
                      value={form.data.address}
                      onChange={(e) => form.setData("address", e.target.value)}
                    />
                  </Field>
                </>
              )}
              {kind === "uom" && (
                <>
                  <Field label="Kode satuan">
                    <input
                      className={input}
                      value={form.data.code}
                      onChange={(e) => form.setData("code", e.target.value)}
                    />
                  </Field>
                  <Field label="Nama satuan">
                    <input
                      className={input}
                      value={form.data.name}
                      onChange={(e) => form.setData("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Tipe">
                    <Select
                      value={form.data.type}
                      onChange={(e: any) =>
                        form.setData("type", e.target.value)
                      }
                    >
                      <option value="base">Base</option>
                      <option value="small">Small</option>
                    </Select>
                  </Field>
                </>
              )}
              {kind === "location" && (
                <>
                  <Field label="Gudang">
                    <Select
                      value={form.data.warehouse_id}
                      onChange={(e: any) =>
                        form.setData("warehouse_id", e.target.value)
                      }
                    >
                      {warehouses.map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Kode lokasi">
                    <input
                      className={input}
                      value={form.data.code}
                      onChange={(e) => form.setData("code", e.target.value)}
                    />
                  </Field>
                  <Field label="Nama lokasi">
                    <input
                      className={input}
                      value={form.data.name}
                      onChange={(e) => form.setData("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Tipe">
                    <Select
                      value={form.data.type}
                      onChange={(e: any) =>
                        form.setData("type", e.target.value)
                      }
                    >
                      {["zone", "rack", "bin"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </Select>
                  </Field>
                </>
              )}
              {kind === "item" && (
                <>
                  <Field label="Kode item">
                    <input
                      className={input}
                      value={form.data.code}
                      onChange={(e) => form.setData("code", e.target.value)}
                    />
                  </Field>
                  <Field label="Nama item">
                    <input
                      className={input}
                      value={form.data.name}
                      onChange={(e) => form.setData("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Satuan dasar">
                    <Select
                      value={form.data.base_uom}
                      onChange={(e: any) =>
                        form.setData("base_uom", e.target.value)
                      }
                    >
                      {uoms
                        .filter((uom: any) => uom.is_active !== false)
                        .map((uom: any) => (
                          <option key={uom.id} value={uom.code}>
                            {uom.code} — {uom.name}
                          </option>
                        ))}
                    </Select>
                  </Field>
                  <Field label="Jenis gudang">
                    <Select
                      value={form.data.warehouse_type}
                      onChange={(e: any) =>
                        form.setData("warehouse_type", e.target.value)
                      }
                    >
                      {["dry", "wet", "both"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Minimum stok">
                    <input
                      type="number"
                      step=".001"
                      className={input}
                      value={form.data.min_stock}
                      onChange={(e) =>
                        form.setData("min_stock", e.target.value)
                      }
                    />
                  </Field>
                  <Field label="Metode pengeluaran">
                    <Select
                      value={form.data.issue_method}
                      onChange={(e: any) =>
                        form.setData("issue_method", e.target.value)
                      }
                    >
                      {["manual", "fifo", "fefo"].map((x) => (
                        <option key={x}>{x.toUpperCase()}</option>
                      ))}
                    </Select>
                  </Field>
                  <div className="flex flex-wrap items-end gap-4 pb-2 text-sm text-slate-600">
                    {[
                      ["has_batch", "Kelola batch"],
                      ["has_expired", "Kelola kedaluwarsa"],
                      ["is_active", "Aktif"],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.data[key]}
                          onChange={(e) => form.setData(key, e.target.checked)}
                          className="size-4 rounded border-slate-300 text-emerald-500"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </>
              )}
              {![
                "supplier",
                "uom",
                "location",
                "item",
                "delivery",
                "receipt",
                "request",
                "adjustment",
                "opname",
              ].includes(kind) && (
                <>
                  <Field label="Item">
                    <Select
                      value={form.data.item_id}
                      onChange={(e: any) =>
                        form.setData("item_id", e.target.value)
                      }
                    >
                      {items.map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.code} — {x.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Satuan">
                    <Select
                      value={form.data.uom_id}
                      onChange={(e: any) =>
                        form.setData("uom_id", e.target.value)
                      }
                    >
                      {uoms.map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label={
                      kind === "opname"
                        ? "Hasil hitung fisik"
                        : "Kuantitas (+ masuk / - keluar)"
                    }
                  >
                    <input
                      type="number"
                      step=".001"
                      className={input}
                      value={form.data.qty}
                      onChange={(e) => form.setData("qty", e.target.value)}
                    />
                  </Field>
                  {kind !== "opname" && (
                    <Field label="HPP / unit">
                      <input
                        type="number"
                        className={input}
                        value={form.data.unit_price}
                        onChange={(e) =>
                          form.setData("unit_price", e.target.value)
                        }
                      />
                    </Field>
                  )}
                </>
              )}
              {["purchase-order", "grn"].includes(kind) && (
                <Field label="Supplier">
                  <Select
                    value={form.data.supplier_id}
                    onChange={(e: any) =>
                      form.setData("supplier_id", e.target.value)
                    }
                  >
                    {suppliers.map((x: any) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              {kind === "grn" && (
                <Field label="Purchase Order (opsional)">
                  <Select
                    value={form.data.purchase_order_id}
                    onChange={(e: any) =>
                      form.setData("purchase_order_id", e.target.value)
                    }
                  >
                    {orders
                      .filter((x: any) => x.status === "approved")
                      .map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.number}
                        </option>
                      ))}
                  </Select>
                </Field>
              )}
              {["purchase-order", "grn", "adjustment", "opname"].includes(
                kind,
              ) && (
                <Field label="Gudang">
                  <Select
                    value={form.data.warehouse_id}
                    onChange={(e: any) => {
                      form.setData({
                        ...form.data,
                        warehouse_id: e.target.value,
                        ...(kind === "opname"
                          ? {
                              details: form.data.details.map((row: any) => ({
                                ...row,
                                item_id: "",
                              })),
                            }
                          : {}),
                      });
                    }}
                  >
                    {warehouses.map((x: any) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              {kind === "request" && (
                <div className="sm:col-span-2">
                  <Field label="Gudang yang dituju *">
                    <Select
                      value={form.data.from_warehouse_id}
                      placeholder="Pilih gudang kering atau basah"
                      onChange={(e: any) =>
                        form.setData({
                          ...form.data,
                          from_warehouse_id: e.target.value,
                          details: form.data.details.map((detail: any) => ({
                            ...detail,
                            item_id: "",
                            uom_id: "",
                          })),
                        })
                      }
                    >
                      {warehouses
                        .filter((x: any) => x.type === "main")
                        .map((x: any) => (
                          <option key={x.id} value={x.id}>
                            {x.name}
                          </option>
                        ))}
                    </Select>
                  </Field>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Pilih sesuai jenis barang yang akan diminta.
                  </p>
                </div>
              )}
              {["adjustment", "opname"].includes(kind) && (
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {kind === "opname"
                          ? "Hasil hitung fisik"
                          : "Detail adjustment"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tambahkan beberapa item dalam satu dokumen dan satu
                        proses approval.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        form.setData("details", [
                          ...form.data.details,
                          {
                            item_id: "",
                            uom_id: "",
                            qty: kind === "opname" ? 0 : 1,
                            batch_no: "",
                            location_id: "",
                          },
                        ])
                      }
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                    >
                      <Plus size={14} /> Tambah item
                    </button>
                  </div>
                  {form.data.details.map((detail: any, index: number) => {
                    const selectedItem = items.find(
                      (item: any) => Number(item.id) === Number(detail.item_id),
                    );
                    const availableUoms = selectedItem?.item_uoms || [];
                    const baseUom = availableUoms.find(
                      (itemUom: any) => itemUom.is_base,
                    );
                    const updateDetail = (key: string, value: any) =>
                      form.setData(
                        "details",
                        form.data.details.map((row: any, i: number) =>
                          i === index ? { ...row, [key]: value } : row,
                        ),
                      );

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                            Item {index + 1}
                          </p>
                          <button
                            type="button"
                            disabled={form.data.details.length === 1}
                            onClick={() =>
                              form.setData(
                                "details",
                                form.data.details.filter(
                                  (_: any, i: number) => i !== index,
                                ),
                              )
                            }
                            className="grid size-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          <Field label="Item">
                            <Select
                              value={detail.item_id}
                              onChange={(e: any) => {
                                const item = items.find(
                                  (candidate: any) =>
                                    Number(candidate.id) ===
                                    Number(e.target.value),
                                );
                                const itemBaseUom = item?.item_uoms?.find(
                                  (itemUom: any) => itemUom.is_base,
                                );
                                form.setData(
                                  "details",
                                  form.data.details.map(
                                    (row: any, i: number) =>
                                      i === index
                                        ? {
                                            ...row,
                                            item_id: e.target.value,
                                            uom_id: itemBaseUom?.uom_id || "",
                                          }
                                        : row,
                                  ),
                                );
                              }}
                            >
                              {(kind === "opname" ? opnameItems : items).map(
                                (item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.code} — {item.name}
                                  </option>
                                ),
                              )}
                            </Select>
                          </Field>
                          <Field label="Satuan">
                            <Select
                              value={detail.uom_id}
                              placeholder={
                                detail.item_id
                                  ? "Pilih satuan item"
                                  : "Pilih item dahulu"
                              }
                              onChange={(e: any) =>
                                updateDetail("uom_id", e.target.value)
                              }
                            >
                              {availableUoms.map((itemUom: any) => (
                                <option
                                  key={itemUom.uom_id}
                                  value={itemUom.uom_id}
                                >
                                  {itemUom.uom?.name}
                                  {itemUom.is_base
                                    ? " (dasar)"
                                    : ` (1 = ${Number(itemUom.conversion_factor).toLocaleString("id-ID")} ${baseUom?.uom?.code || "satuan dasar"})`}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field
                            label={
                              kind === "opname"
                                ? "Jumlah hasil hitung"
                                : "Qty adjustment (+ / -)"
                            }
                          >
                            <input
                              type="number"
                              min={kind === "opname" ? 0 : undefined}
                              step="0.001"
                              className={input}
                              value={detail.qty}
                              onChange={(e) =>
                                updateDetail("qty", e.target.value)
                              }
                            />
                          </Field>
                          {kind === "adjustment" && (
                            <>
                              <Field label="Nomor batch">
                                <input
                                  className={input}
                                  value={detail.batch_no ?? ""}
                                  onChange={(e) =>
                                    updateDetail("batch_no", e.target.value)
                                  }
                                  placeholder="Opsional"
                                />
                              </Field>
                              <Field label="Lokasi">
                                <Select
                                  value={detail.location_id ?? ""}
                                  onChange={(e: any) =>
                                    updateDetail("location_id", e.target.value)
                                  }
                                >
                                  {locations
                                    .filter(
                                      (location: any) =>
                                        !form.data.warehouse_id ||
                                        Number(location.warehouse_id) ===
                                          Number(form.data.warehouse_id),
                                    )
                                    .map((location: any) => (
                                      <option
                                        key={location.id}
                                        value={location.id}
                                      >
                                        {location.code} — {location.name}
                                      </option>
                                    ))}
                                </Select>
                              </Field>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {kind === "request" && fulfillmentAccess.isSuperadmin && (
                <Field label="Gudang unit tujuan">
                  <Select
                    value={form.data.to_warehouse_id}
                    onChange={(e: any) =>
                      form.setData("to_warehouse_id", e.target.value)
                    }
                  >
                    {warehouses
                      .filter((x: any) => x.type === "unit")
                      .map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </Select>
                </Field>
              )}
              {kind === "request" && (
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Barang yang dibutuhkan
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {!form.data.from_warehouse_id
                          ? "Pilih gudang sumber terlebih dahulu untuk melihat barang tersedia."
                          : `${availableRequestItems.length} barang tersedia pada gudang yang dipilih.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        form.setData("details", [
                          ...form.data.details,
                          { item_id: "", uom_id: "", qty: 1 },
                        ])
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"
                    >
                      <Plus size={14} /> Tambah barang
                    </button>
                  </div>
                  {form.data.details.map((detail: any, index: number) => (
                    <div
                      key={index}
                      className="relative grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2"
                    >
                      <div className="pr-10 sm:col-span-2">
                        <Field label={`Nama barang ${index + 1} *`}>
                          <SearchableSelect
                            value={detail.item_id}
                            placeholder={
                              form.data.from_warehouse_id
                                ? "Cari barang tersedia"
                                : "Pilih gudang sumber terlebih dahulu"
                            }
                            options={availableRequestItems.map(
                              (stock: any) => ({
                                value: stock.item.id,
                                label: `${stock.item.code} — ${stock.item.name} · tersedia ${Number(stock.qty_available).toLocaleString("id-ID")} ${stock.uom_code}`,
                              }),
                            )}
                            onChange={(itemId: string) => {
                              const selectedStock = availableRequestItems.find(
                                (stock: any) =>
                                  Number(stock.item_id) === Number(itemId),
                              );
                              form.setData(
                                "details",
                                form.data.details.map((row: any, i: number) =>
                                  i === index
                                    ? {
                                        ...row,
                                        item_id: itemId,
                                        uom_id: selectedStock?.uom_id || "",
                                      }
                                    : row,
                                ),
                              );
                            }}
                          />
                        </Field>
                      </div>
                      <Field label="Satuan tersedia">
                        {(() => {
                          const selectedStock = availableRequestItems.find(
                            (stock: any) =>
                              Number(stock.item_id) === Number(detail.item_id),
                          );

                          return (
                            <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-sm">
                              <span
                                className={
                                  selectedStock
                                    ? "font-semibold text-slate-700"
                                    : "text-slate-400"
                                }
                              >
                                {selectedStock?.uom_name ||
                                  "Pilih barang dahulu"}
                              </span>
                              {selectedStock && (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  {selectedStock.uom_code}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </Field>
                      <Field label="Jumlah *">
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          className={input}
                          value={detail.qty}
                          onChange={(e) =>
                            form.setData(
                              "details",
                              form.data.details.map((row: any, i: number) =>
                                i === index
                                  ? { ...row, qty: e.target.value }
                                  : row,
                              ),
                            )
                          }
                        />
                      </Field>
                      <button
                        type="button"
                        disabled={form.data.details.length === 1}
                        title="Hapus barang"
                        aria-label={`Hapus barang ${index + 1}`}
                        onClick={() =>
                          form.setData(
                            "details",
                            form.data.details.filter(
                              (_: any, i: number) => i !== index,
                            ),
                          )
                        }
                        className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <Field label="Catatan tambahan (opsional)">
                    <textarea
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                      value={form.data.notes}
                      onChange={(e) => form.setData("notes", e.target.value)}
                      placeholder="Contoh: Dibutuhkan untuk operasional akhir pekan."
                    />
                  </Field>
                </div>
              )}
              {kind === "delivery" && (
                <Field label="Request disetujui">
                  <Select
                    value={form.data.stock_request_id}
                    onChange={(e: any) =>
                      form.setData("stock_request_id", e.target.value)
                    }
                  >
                    {requests
                      .filter((x: any) => x.status === "approved")
                      .map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.number}
                        </option>
                      ))}
                  </Select>
                </Field>
              )}
              {kind === "receipt" && (
                <Field label="Delivery dikirim">
                  <Select
                    value={form.data.delivery_id}
                    onChange={(e: any) =>
                      form.setData("delivery_id", e.target.value)
                    }
                  >
                    {deliveries
                      .filter((x: any) => x.status === "shipped")
                      .map((x: any) => (
                        <option key={x.id} value={x.id}>
                          {x.number}
                        </option>
                      ))}
                  </Select>
                </Field>
              )}
              {kind === "adjustment" && (
                <>
                  <Field label="Jenis adjustment">
                    <Select
                      value={form.data.type}
                      onChange={(e: any) =>
                        form.setData("type", e.target.value)
                      }
                    >
                      {[
                        "damaged",
                        "expired",
                        "correction",
                        "opening",
                        "waste",
                        "return",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Alasan">
                    <input
                      className={input}
                      value={form.data.reason}
                      onChange={(e) => form.setData("reason", e.target.value)}
                    />
                  </Field>
                </>
              )}
              {["purchase-order", "grn"].includes(kind) && (
                <Field label="Approver">
                  <Select
                    value={form.data.approver_id}
                    onChange={(e: any) =>
                      form.setData("approver_id", e.target.value)
                    }
                  >
                    {managers.map((x: any) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
              {["adjustment", "opname"].includes(kind) && (
                <div className="sm:col-span-2">
                  <p className="mb-1.5 text-sm font-medium text-slate-700">
                    Manajer penyetuju
                  </p>
                  <div
                    className={`flex min-h-11 items-center gap-3 rounded-xl border px-3.5 ${
                      selectedManager
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <ShieldCheck
                      size={18}
                      className={
                        selectedManager ? "text-emerald-600" : "text-amber-600"
                      }
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {selectedManager?.name ||
                          "Manajer gudang belum dikonfigurasi"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Dipilih otomatis berdasarkan gudang dokumen
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2 sm:col-span-2">
                <button
                  disabled={form.processing}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {editing ? <Check size={17} /> : <PackageCheck size={17} />}{" "}
                  {form.processing
                    ? "Mengirim..."
                    : editing
                      ? "Simpan perubahan"
                      : module === "fulfillment"
                        ? "Kirim permintaan stok"
                        : module === "inventory-control"
                          ? "Ajukan persetujuan"
                          : "Simpan & proses"}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
                  >
                    <RotateCcw size={16} /> Batal
                  </button>
                )}
              </div>
            </form>
          </Card>
        ) : (
          <Card
            title="Antrean request stok"
            description="Pantau approval dan persiapan barang sesuai tanggung jawab Anda."
          >
            <div className="py-8 text-center text-sm text-slate-500">
              <PackageCheck className="mx-auto mb-3 text-emerald-500" />
              Pilih request yang sudah disetujui manajer unit untuk menyiapkan
              barang.
            </div>
          </Card>
        )}
        <Card
          title={
            module === "fulfillment"
              ? "Request stok per unit"
              : "Ringkasan operasional"
          }
          description={
            module === "fulfillment"
              ? "Lihat unit peminta, gudang sumber, detail item, dan status persetujuan."
              : "Status request dan perpindahan stok terbaru."
          }
        >
          <RecordList
            module={module}
            records={records}
            onEdit={startEdit}
            masterKind={kind}
          />
        </Card>
      </div>
    </AppLayout>
  );
}

function RecordList({ module, records, onEdit, masterKind }: any) {
  if (module === "master-data") {
    return (
      <MasterDataList records={records} onEdit={onEdit} kind={masterKind} />
    );
  }

  if (module === "fulfillment") {
    return <RequestStockList records={records} />;
  }

  if (module === "inventory-control") {
    return <InventoryControlList records={records} />;
  }

  const list =
    module === "purchasing"
      ? [...(records.orders || []), ...(records.receipts || [])]
      : module === "fulfillment"
        ? [...(records.requests || []), ...(records.deliveries || [])]
        : module === "inventory-control"
          ? records.stocks || []
          : [];

  if (!list.length) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        <ClipboardList className="mx-auto mb-3 text-slate-300" />
        Belum ada data pada modul ini.
      </div>
    );
  }

  return (
    <div className="max-h-[620px] space-y-2 overflow-auto pr-1">
      {list.map((row: any) => (
        <div
          key={`${row.number || "stock"}-${row.id}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {row.number || row.item?.name}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {row.warehouse?.name ||
                row.type ||
                `${row.qty_on_hand} tersedia, ${row.qty_reserved} reservasi`}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status || "available")}`}
          >
            {row.status || "stock"}
          </span>
        </div>
      ))}
    </div>
  );
}

function InventoryControlList({ records }: any) {
  const documents = [
    ...(records.opnames || []).map((row: any) => ({
      ...row,
      documentType: "Stock Opname",
      summary: `${row.details?.length || 0} item dihitung`,
    })),
    ...(records.adjustments || [])
      .filter((row: any) => !row.stock_opname_id)
      .map((row: any) => ({
        ...row,
        documentType: "Adjustment",
        summary: `${row.details?.length || 0} item disesuaikan`,
      })),
  ].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (!documents.length) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        <ClipboardList className="mx-auto mb-3 text-slate-300" />
        Belum ada dokumen opname atau adjustment.
      </div>
    );
  }

  return (
    <div className="max-h-[620px] space-y-3 overflow-auto pr-1">
      {documents.map((row: any) => (
        <article
          key={`${row.documentType}-${row.id}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[.14em] text-emerald-600">
                  {row.documentType}
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  {row.warehouse?.name}
                </span>
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                {row.number}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {row.summary} · Dibuat oleh {row.creator?.name || "—"}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status)}`}
            >
              {statusText(row.status)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            Penyetuju:
            <span className="font-semibold text-slate-700">
              {row.assigned_approver?.name || "Belum dikonfigurasi"}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function RequestStockList({ records }: any) {
  const requests = records.requests || [];
  const [unitFilter, setUnitFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const units = Array.from(
    new Map(
      requests
        .filter((row: any) => row.to_warehouse)
        .map((row: any) => [row.to_warehouse.id, row.to_warehouse]),
    ).values(),
  ) as any[];
  const sourceWarehouses = Array.from(
    new Map(
      requests
        .filter((row: any) => row.from_warehouse)
        .map((row: any) => [row.from_warehouse.id, row.from_warehouse]),
    ).values(),
  ) as any[];
  const filteredRequests = requests.filter(
    (row: any) =>
      (!unitFilter || String(row.to_warehouse_id) === unitFilter) &&
      (!warehouseFilter || String(row.from_warehouse_id) === warehouseFilter) &&
      (!statusFilter || row.status === statusFilter),
  );
  const stageName = (step: any) =>
    (
      ({
        requester: "Unit Peminta",
        unit_manager: "Manajer Unit",
        warehouse_admin: "Admin Gudang",
        warehouse_manager: "Manajer Gudang",
      }) as Record<string, string>
    )[step?.stage_key] ||
    step?.stage_label?.replace(/^Approval\s+/i, "") ||
    "Approval";
  const requestStatus = (row: any) => {
    const activeStep = row.approval?.steps?.find(
      (step: any) => Number(step.level) === Number(row.approval?.current_level),
    );

    if (row.status === "rejected") {
      const rejectedStep = row.approval?.steps?.find(
        (step: any) => step.status === "rejected",
      );

      return `Ditolak: ${stageName(rejectedStep)}`;
    }

    if (row.status === "received") {
      const finalStep = [...(row.approval?.steps || [])]
        .reverse()
        .find((step: any) => step.status === "approved");

      return `Diterima: ${stageName(finalStep)}`;
    }

    if (row.status === "waiting_approval" && activeStep) {
      return `Menunggu: ${stageName(activeStep)}`;
    }

    return statusText(row.status);
  };

  if (!requests.length) {
    return (
      <div className="px-5 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400">
          <ClipboardList size={22} />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Belum ada permintaan stok
        </p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
          Permintaan yang sudah dikirim akan tampil di sini beserta status
          persetujuannya.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Link
          href="/stock-requests"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Lihat seluruh request <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
        <select
          value={unitFilter}
          onChange={(event) => setUnitFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-400"
        >
          <option value="">Semua unit</option>
          {units.map((unit: any) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        <select
          value={warehouseFilter}
          onChange={(event) => setWarehouseFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-400"
        >
          <option value="">Semua gudang sumber</option>
          {sourceWarehouses.map((warehouse: any) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-400"
        >
          <option value="">Semua status</option>
          <option value="waiting_approval">Menunggu persetujuan</option>
          <option value="received">Sudah diterima</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {!filteredRequests.length && (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-500">
          Tidak ada request yang sesuai dengan filter.
        </div>
      )}

      {filteredRequests.map((row: any) => (
        <div key={row.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{row.number}</p>
                {row.to_warehouse?.name && (
                  <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/10">
                    Unit: {row.to_warehouse.name}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {row.to_warehouse?.name} meminta dari {row.from_warehouse?.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Diajukan oleh {row.requester?.name} · {row.details.length} item
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status)}`}
            >
              {requestStatus(row)}
            </span>
          </div>
          <details className="group mt-4 border-t border-slate-100 pt-3">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-1 py-2 text-xs font-semibold text-emerald-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <span>Detail item request ({row.details.length})</span>
              <ChevronDown
                size={16}
                className="transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5">Item</th>
                    <th className="px-3 py-2.5 text-right">Request</th>
                    <th className="px-3 py-2.5 text-right">Disetujui</th>
                    <th className="px-3 py-2.5 text-right">Dikirim</th>
                    <th className="px-3 py-2.5 text-right">Diterima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {row.details.map((detail: any) => (
                    <tr key={detail.id}>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800">
                          {detail.item?.code} · {detail.item?.name}
                        </p>
                        <p className="mt-0.5 text-slate-400">
                          {detail.uom?.code || detail.item?.base_uom || "-"}
                        </p>
                      </td>
                      {[
                        detail.qty_requested,
                        detail.qty_approved,
                        detail.qty_delivered,
                        detail.qty_received,
                      ].map((quantity, index) => (
                        <td
                          key={index}
                          className="whitespace-nowrap px-3 py-3 text-right font-medium text-slate-700"
                        >
                          {Number(quantity || 0).toLocaleString("id-ID")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          {row.approval?.steps?.length > 0 && (
            <details className="group mt-4 border-t border-slate-100 pt-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-400 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-600">
                    Timeline approval
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {
                      row.approval.steps.filter(
                        (step: any) => step.status !== "pending",
                      ).length
                    }{" "}
                    dari {row.approval.steps.length} tahap selesai
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="group-open:hidden">Lihat detail</span>
                  <span className="hidden group-open:inline">Tutup</span>
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200 group-open:rotate-180"
                  />
                </span>
              </summary>
              <div className="mt-3 border-t border-slate-100 pt-4">
                {row.approval.steps.map((step: any, index: number) => {
                  const completed = step.status === "approved";
                  const rejected = step.status === "rejected";
                  const active =
                    row.approval.status === "pending" &&
                    Number(row.approval.current_level) === Number(step.level);
                  const actor = step.actor || step.approver;

                  return (
                    <div
                      key={step.id}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >
                      {index < row.approval.steps.length - 1 && (
                        <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-slate-200" />
                      )}
                      <span
                        className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${
                          completed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : rejected
                              ? "border-rose-500 bg-rose-500 text-white"
                              : active
                                ? "border-amber-400 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {completed ? "✓" : rejected ? "×" : step.level}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">
                            {step.stage_label || `Approval tahap ${step.level}`}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(step.status)}`}
                          >
                            {completed
                              ? "Disetujui"
                              : rejected
                                ? "Ditolak"
                                : active
                                  ? "Menunggu tindakan"
                                  : "Menunggu giliran"}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {actor?.name || "Approver belum tersedia"}
                          {step.acted_at &&
                            ` · ${new Date(step.acted_at).toLocaleString("id-ID")}`}
                        </p>
                        {step.remarks && (
                          <p className="mt-1 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] italic text-slate-600">
                            “{step.remarks}”
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

function MasterDataList({ records, onEdit, kind }: any) {
  const groupMap: Record<string, any> = {
    supplier: [
      "Supplier",
      records.suppliers || [],
      (row: any) => row.name,
      (row: any) => `${row.code} · ${row.phone || "Tanpa telepon"}`,
    ],
    uom: [
      "Satuan",
      records.uoms || [],
      (row: any) => row.name,
      (row: any) => `${row.code} · ${row.type}`,
    ],
    location: [
      "Lokasi gudang",
      records.locations || [],
      (row: any) => row.name,
      (row: any) => `${row.code} · ${row.warehouse?.name || "-"} · ${row.type}`,
    ],
    item: [
      "Item",
      records.items || [],
      (row: any) => row.name,
      (row: any) =>
        `${row.code} · ${row.base_uom} · ${row.category?.name || "Tanpa kategori"}`,
    ],
  };
  const groups = [groupMap[kind] || groupMap.supplier];

  return (
    <div className="space-y-5">
      {groups.map(([title, rows, getTitle, getMeta]: any) => (
        <section key={title}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">
              {title}
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {rows.length}
            </span>
          </div>
          <div className="space-y-2">
            {rows.length ? (
              rows.map((row: any) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {getTitle(row)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {getMeta(row)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${row.is_active === false ? "bg-slate-300" : "bg-emerald-500"}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(
                          title === "Supplier"
                            ? "supplier"
                            : title === "Satuan"
                              ? "uom"
                              : title === "Lokasi gudang"
                                ? "location"
                                : "item",
                          row,
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
                Belum ada data.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
