/* eslint-disable @typescript-eslint/no-explicit-any */
import { Head, router, useForm } from "@inertiajs/react";
import {
  Boxes,
  Check,
  ClipboardList,
  PackageCheck,
  Pencil,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import AppLayout from "../../layouts/AppLayout";

const titles: Record<string, string> = {
  "master-data": "Master Data",
  purchasing: "Purchasing & Goods Receipt",
  fulfillment: "Request Stok ke Gudang Kering/Basah",
  "inventory-control": "Inventory Control",
};
const badge = (status = "") =>
  status.includes("approved") ||
  status.includes("posted") ||
  status.includes("received")
    ? "bg-emerald-50 text-emerald-700"
    : status.includes("reject")
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

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
function Select({ value, onChange, children }: any) {
  return (
    <select className={input} value={value} onChange={onChange}>
      <option value="">Pilih data</option>
      {children}
    </select>
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
  fulfillmentAccess,
}: any) {
  const [kind, setKind] = useState(
    module === "purchasing"
      ? "purchase-order"
      : module === "fulfillment"
        ? "request"
        : module === "master-data"
          ? "supplier"
          : "adjustment",
  );
  const [editing, setEditing] = useState<any>(null);
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
        unit_price: 0,
        batch_no: "",
        location_id: "",
      },
    ],
    base_uom: "PCS",
    warehouse_type: "dry",
    min_stock: 0,
    reorder_point: 0,
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
    editing
      ? form.put(`${endpoint[editing.type]}/${editing.id}`, options)
      : form.post(endpoint[kind], options);
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

  return (
    <AppLayout title={titles[module]}>
      <Head title={titles[module]} />
      <section className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:flex-row sm:items-end sm:px-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-300">
            <Boxes size={14} /> Alur WMS terintegrasi
          </span>
          <h2 className="mt-4 text-2xl font-semibold">{titles[module]}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Setiap dokumen tersambung ke approval, saldo stok, reservasi, HPP
            dan ledger audit.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3 text-sm">
          <b>{pendingApprovals.length}</b> approval menunggu tindakan Anda
        </div>
      </section>

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
                    Level {approval.current_level} dari {approval.total_levels}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.post(
                        `/workflow-approvals/${approval.id}`,
                        { action: "rejected" },
                        { preserveScroll: true },
                      )
                    }
                    className="rounded-lg bg-rose-50 p-2 text-rose-600"
                  >
                    <X size={17} />
                  </button>
                  <button
                    onClick={() =>
                      router.post(
                        `/workflow-approvals/${approval.id}`,
                        { action: "approved" },
                        { preserveScroll: true },
                      )
                    }
                    className="rounded-lg bg-emerald-500 p-2 text-white"
                  >
                    <Check size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
        {module !== "fulfillment" || fulfillmentAccess.canRequest ? (
          <Card
            title={
              editing
                ? `Edit ${tabs.find(([id]) => id === kind)?.[1]}`
                : "Buat dokumen"
            }
            description={
              editing
                ? "Perbarui data lalu simpan perubahan."
                : module === "fulfillment"
                  ? "Ajukan kebutuhan unit ke gudang kering atau basah."
                  : "Pilih proses, lengkapi data, lalu ajukan."
            }
          >
            <div className="mb-5 flex flex-wrap gap-2">
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
                    <input
                      className={input}
                      value={form.data.base_uom}
                      onChange={(e) => form.setData("base_uom", e.target.value)}
                    />
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
                  <Field label="Reorder point">
                    <input
                      type="number"
                      step=".001"
                      className={input}
                      value={form.data.reorder_point}
                      onChange={(e) =>
                        form.setData("reorder_point", e.target.value)
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
                <Field label="Request ke gudang">
                  <Select
                    value={form.data.from_warehouse_id}
                    onChange={(e: any) =>
                      form.setData("from_warehouse_id", e.target.value)
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
                            unit_price: 0,
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
                              onChange={(e: any) =>
                                updateDetail("item_id", e.target.value)
                              }
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
                              onChange={(e: any) =>
                                updateDetail("uom_id", e.target.value)
                              }
                            >
                              {uoms.map((uom: any) => (
                                <option key={uom.id} value={uom.id}>
                                  {uom.name}
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
                              <Field label="HPP / unit">
                                <input
                                  type="number"
                                  min="0"
                                  className={input}
                                  value={detail.unit_price ?? 0}
                                  onChange={(e) =>
                                    updateDetail("unit_price", e.target.value)
                                  }
                                />
                              </Field>
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
                        Daftar barang
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tambahkan seluruh kebutuhan unit dalam satu request.
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
                      className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(130px,.7fr)_minmax(110px,.5fr)_auto]"
                    >
                      <Field label={`Item ${index + 1}`}>
                        <Select
                          value={detail.item_id}
                          onChange={(e: any) =>
                            form.setData(
                              "details",
                              form.data.details.map((row: any, i: number) =>
                                i === index
                                  ? { ...row, item_id: e.target.value }
                                  : row,
                              ),
                            )
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
                          value={detail.uom_id}
                          onChange={(e: any) =>
                            form.setData(
                              "details",
                              form.data.details.map((row: any, i: number) =>
                                i === index
                                  ? { ...row, uom_id: e.target.value }
                                  : row,
                              ),
                            )
                          }
                        >
                          {uoms.map((x: any) => (
                            <option key={x.id} value={x.id}>
                              {x.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Jumlah">
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
                        onClick={() =>
                          form.setData(
                            "details",
                            form.data.details.filter(
                              (_: any, i: number) => i !== index,
                            ),
                          )
                        }
                        className="mt-6 grid size-10 place-items-center rounded-lg border border-rose-100 bg-white text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
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
              {["purchase-order", "grn", "adjustment", "opname"].includes(
                kind,
              ) && (
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
              <div className="flex gap-2 sm:col-span-2">
                <button
                  disabled={form.processing}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600 disabled:opacity-50"
                >
                  {editing ? <Check size={17} /> : <Plus size={17} />}{" "}
                  {form.processing
                    ? "Memproses..."
                    : editing
                      ? "Simpan perubahan"
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
          title="Ringkasan operasional"
          description="Status request dan perpindahan stok terbaru."
        >
          <RecordList
            module={module}
            records={records}
            onEdit={startEdit}
            fulfillmentAccess={fulfillmentAccess}
          />
        </Card>
      </div>
    </AppLayout>
  );
}

function RecordList({ module, records, onEdit, fulfillmentAccess }: any) {
  if (module === "master-data")
    return <MasterDataList records={records} onEdit={onEdit} />;
  if (module === "fulfillment")
    return <RequestStockList records={records} access={fulfillmentAccess} />;
  const list =
    module === "purchasing"
      ? [...(records.orders || []), ...(records.receipts || [])]
      : module === "fulfillment"
        ? [...(records.requests || []), ...(records.deliveries || [])]
        : module === "inventory-control"
          ? records.stocks || []
          : [];
  if (!list.length)
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        <ClipboardList className="mx-auto mb-3 text-slate-300" />
        Belum ada data pada modul ini.
      </div>
    );
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

function RequestStockList({ records, access }: any) {
  const requests = records.requests || [];
  if (!requests.length)
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        <ClipboardList className="mx-auto mb-3 text-slate-300" />
        Belum ada request stok.
      </div>
    );
  return (
    <div className="space-y-3">
      {requests.map((row: any) => (
        <div key={row.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{row.number}</p>
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
              {row.prepared_at
                ? "Barang disiapkan"
                : row.unit_approved
                  ? "Menunggu persiapan"
                  : row.status}
            </span>
          </div>
          {access.canPrepare &&
            row.unit_approved &&
            !row.prepared_at &&
            Number(access.warehouseId) === Number(row.from_warehouse_id) && (
              <button
                onClick={() =>
                  router.post(
                    `/operations/fulfillment/requests/${row.id}/prepare`,
                    {},
                    {
                      preserveScroll: true,
                      onSuccess: () =>
                        toast.success("Barang berhasil disiapkan."),
                    },
                  )
                }
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
              >
                <PackageCheck size={15} /> Tandai barang sudah disiapkan
              </button>
            )}
        </div>
      ))}
    </div>
  );
}

function MasterDataList({ records, onEdit }: any) {
  const groups = [
    [
      "Supplier",
      records.suppliers || [],
      (row: any) => row.name,
      (row: any) => `${row.code} · ${row.phone || "Tanpa telepon"}`,
    ],
    [
      "Satuan",
      records.uoms || [],
      (row: any) => row.name,
      (row: any) => `${row.code} · ${row.type}`,
    ],
    [
      "Lokasi gudang",
      records.locations || [],
      (row: any) => row.name,
      (row: any) => `${row.code} · ${row.warehouse?.name || "-"} · ${row.type}`,
    ],
    [
      "Item",
      records.items || [],
      (row: any) => row.name,
      (row: any) =>
        `${row.code} · ${row.base_uom} · ${row.category?.name || "Tanpa kategori"}`,
    ],
  ];

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
