/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Legacy WMS page migrated from JSX; type incrementally.
import { Head, useForm } from "@inertiajs/react";
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Image,
  PackagePlus,
  Plus,
  Search,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import TransactionHistory from "../../components/TransactionHistory";
import AppLayout from "../../layouts/AppLayout";

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const emptyDetail = () => ({
  item_id: "",
  qty: 1,
  unit_cost: 0,
  batch_no: "",
  expired_at: "",
});

function SearchableProductSelect({ value, items, onChange }) {
  const selected = items.find((item) => String(item.id) === String(value));
  const [query, setQuery] = useState(
    selected ? `${selected.code} — ${selected.name}` : "",
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected ? `${selected.code} — ${selected.name}` : "");
  }, [value, selected?.code, selected?.name]);

  const filteredItems = items
    .filter((item) =>
      `${item.code} ${item.name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, 50);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery(selected ? `${selected.code} — ${selected.name}` : "");
        }
      }}
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-3.5 z-10 text-slate-400"
      />
      <input
        value={query}
        autoComplete="off"
        placeholder="Cari kode atau nama produk"
        className={`${fieldClass} pl-10 pr-9`}
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
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(String(item.id));
                  setQuery(`${item.code} — ${item.name}`);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${
                  String(item.id) === String(value)
                    ? "bg-emerald-50 font-semibold text-emerald-700"
                    : "text-slate-700"
                }`}
              >
                <span>{item.code} — {item.name}</span>
                {String(item.id) === String(value) && (
                  <CheckCircle2 size={15} />
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-xs text-slate-500">
              Produk tidak ditemukan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Index({
  transactions,
  warehouses,
  items,
  stockInMode,
  userWarehouse,
}) {
  const isUnitRequest = stockInMode === "unit_request";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const form = useForm({
    type: isUnitRequest ? "transfer" : "stock_in",
    request_kind: stockInMode,
    source_warehouse_id: "",
    destination_warehouse_id: isUnitRequest ? userWarehouse?.id : "",
    supplier_name: "",
    receipt_image: null,
    payment_proof_image: null,
    document_date: new Date().toISOString().slice(0, 10),
    notes: "",
    details: [emptyDetail()],
  });

  const setDetail = (index, key, value) => {
    form.setData(
      "details",
      form.data.details.map((detail, position) =>
        position === index ? { ...detail, [key]: value } : detail,
      ),
    );
  };

  const removeDetail = (index) => {
    if (form.data.details.length === 1) {
      return;
    }

    form.setData(
      "details",
      form.data.details.filter((_, position) => position !== index),
    );
  };

  const submit = (event) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    form.post("/stock-transactions", {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setConfirmOpen(false);
        form.reset();
      },
    });
  };

  const errors = Object.values(form.errors);

  return (
    <AppLayout title="Stock In">
      <Head title="Stock In" />

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            {isUnitRequest
              ? "Permintaan persediaan unit"
              : "Penerimaan persediaan"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {isUnitRequest
              ? "Request stok ke gudang utama"
              : "Buat transaksi Stock In"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {isUnitRequest
              ? "Ajukan kebutuhan stok unit Anda ke gudang kering atau basah untuk disetujui oleh manajer unit."
              : "Catat barang masuk dari supplier beserta nilai perolehan dan informasi batch."}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={16} />
          Masuk ke antrean approval
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {errors.length > 0 && (
          <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertCircle className="mt-0.5 shrink-0" size={19} />
            <div>
              <p className="text-sm font-semibold">
                Periksa kembali data transaksi
              </p>
              <ul className="mt-1 list-inside list-disc text-xs leading-5 text-rose-600">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Warehouse size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {isUnitRequest
                  ? "Informasi permintaan"
                  : "Informasi penerimaan"}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {isUnitRequest
                  ? "Jalur distribusi stok sesuai unit pengguna."
                  : "Data utama dokumen dan gudang tujuan."}
              </p>
            </div>
          </div>
          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-3">
            {isUnitRequest ? (
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-semibold text-slate-700">
                  Request dari gudang <b className="text-rose-500">*</b>
                </span>
                <select
                  className={fieldClass}
                  value={form.data.source_warehouse_id}
                  onChange={(event) =>
                    form.setData("source_warehouse_id", event.target.value)
                  }
                >
                  <option value="">Pilih gudang kering / basah</option>
                  {warehouses
                    .filter((warehouse) => warehouse.type === "main")
                    .map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} → {userWarehouse?.name}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">
                  Gudang tujuan <b className="text-rose-500">*</b>
                </span>
                <select
                  className={fieldClass}
                  value={form.data.destination_warehouse_id}
                  onChange={(event) =>
                    form.setData("destination_warehouse_id", event.target.value)
                  }
                >
                  <option value="">Pilih gudang tujuan</option>
                  {warehouses
                    .filter((warehouse) => warehouse.type === "main")
                    .map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {!isUnitRequest && (
              <label className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">
                  Nama supplier
                </span>
                <input
                  className={fieldClass}
                  placeholder="Contoh: PT Sumber Makmur"
                  value={form.data.supplier_name}
                  onChange={(event) =>
                    form.setData("supplier_name", event.target.value)
                  }
                />
              </label>
            )}
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">
                Tanggal dokumen <b className="text-rose-500">*</b>
              </span>
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                />
                <input
                  type="date"
                  className={`${fieldClass} pl-10`}
                  value={form.data.document_date}
                  onChange={(event) =>
                    form.setData("document_date", event.target.value)
                  }
                />
              </div>
            </label>
          </div>
        </section>

        <section className="relative z-10 overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <PackagePlus size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Detail barang
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {form.data.details.length} baris item ditambahkan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                form.setData("details", [...form.data.details, emptyDetail()])
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Plus size={15} /> Tambah item
            </button>
          </div>

          <div className="space-y-3 p-4 sm:p-6">
            {form.data.details.map((detail, index) => (
              <div
                className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                key={index}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Item {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    aria-label="Hapus item"
                    type="button"
                    disabled={form.data.details.length === 1}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                    onClick={() => removeDetail(index)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-12">
                  <label
                    className={`space-y-2 ${isUnitRequest ? "md:col-span-5" : "md:col-span-4"}`}
                  >
                    <span className="text-xs font-semibold text-slate-600">
                      Produk
                    </span>
                    <SearchableProductSelect
                      value={detail.item_id}
                      items={items}
                      onChange={(itemId) =>
                        setDetail(index, "item_id", itemId)
                      }
                    />
                  </label>
                  {!isUnitRequest && (
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Kuantitas
                      </span>
                      <input
                        type="number"
                        min="0.001"
                        step=".001"
                        className={fieldClass}
                        value={detail.qty}
                        onChange={(event) =>
                          setDetail(index, "qty", event.target.value)
                        }
                      />
                    </label>
                  )}
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-600">
                      HPP / unit
                    </span>
                    <input
                      type="number"
                      min="0"
                      className={fieldClass}
                      value={detail.unit_cost}
                      onChange={(event) =>
                        setDetail(index, "unit_cost", event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Nomor batch
                    </span>
                    <input
                      className={fieldClass}
                      placeholder="Opsional"
                      value={detail.batch_no}
                      onChange={(event) =>
                        setDetail(index, "batch_no", event.target.value)
                      }
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Kedaluwarsa
                    </span>
                    <input
                      type="date"
                      className={fieldClass}
                      value={detail.expired_at}
                      onChange={(event) =>
                        setDetail(index, "expired_at", event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!isUnitRequest && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <Image size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Dokumen pendukung
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Gambar otomatis dikompres saat transaksi disimpan.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {[
                ["receipt_image", "Foto nota", "Foto nota pembelian dari supplier"],
                ["payment_proof_image", "Bukti pembayaran", "Foto transfer atau bukti pembayaran"],
              ].map(([key, label, description]) => (
                <label
                  key={key}
                  className="group cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <span className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm group-hover:text-emerald-700">
                      <Image size={18} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-4 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 file:shadow-sm"
                    onChange={(event) => form.setData(key, event.target.files?.[0] || null)}
                  />
                  <span className="mt-2 block text-[11px] text-slate-400">
                    JPG, PNG, atau WebP · maksimal 10 MB
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
          <label className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">
              Catatan transaksi
            </span>
            <textarea
              rows={3}
              className={`${fieldClass} h-auto resize-y py-3`}
              placeholder="Tambahkan informasi yang perlu diketahui approver..."
              value={form.data.notes}
              onChange={(event) => form.setData("notes", event.target.value)}
            />
          </label>
          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => form.reset()}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              disabled={form.processing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60"
            >
              <CheckCircle2 size={17} />{" "}
              {form.processing
                ? "Mengirim..."
                : isUnitRequest
                  ? "Kirim Request ke Manajer"
                  : "Simpan Penerimaan"}
            </button>
          </div>
        </section>
      </form>

      <TransactionHistory
        transactions={transactions}
        title={
          isUnitRequest
            ? "Daftar request stok unit"
            : "Daftar pengajuan Stock In"
        }
        emptyText={
          isUnitRequest
            ? "Request stok unit yang dibuat akan muncul di sini."
            : "Pengajuan Stock In yang dibuat akan muncul di sini."
        }
      />
      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmSubmit}
        processing={form.processing}
        title={
          isUnitRequest ? "Ajukan request stok?" : "Simpan penerimaan barang?"
        }
        description={
          isUnitRequest
            ? "Request akan dikirim kepada manajer unit untuk diperiksa dan disetujui."
            : "Pastikan supplier, jumlah, HPP, dan informasi batch sudah sesuai sebelum disimpan."
        }
        confirmLabel={
          isUnitRequest ? "Ya, kirim request" : "Ya, simpan penerimaan"
        }
      />
    </AppLayout>
  );
}
