/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Legacy WMS page migrated from JSX; type incrementally.
import { Head, useForm } from "@inertiajs/react";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  ChevronDown,
  CheckCircle2,
  Image,
  PackagePlus,
  Plus,
  Trash2,
  Upload,
  Warehouse,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CameraCaptureDialog from "../../components/camera-capture-dialog";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import SearchableItemSelect from "../../components/searchable-item-select";
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

function SupportingDocumentInput({ label, description, value, onChange }) {
  const fileInput = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const inputClass = "sr-only";

  useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  const selectFile = (event) => {
    onChange(event.target.files?.[0] || null);
    event.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
      <span className="flex items-start gap-3">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Pratinjau ${label}`}
            className="size-16 shrink-0 rounded-xl bg-white object-cover shadow-sm ring-1 ring-slate-200"
          />
        ) : (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
            <Image size={18} />
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-800">
            {label}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            {description}
          </span>
        </span>
      </span>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={inputClass}
        onChange={selectFile}
      />
      <div
        className="relative mt-4"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setMenuOpen(false);
          }
        }}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
        >
          <Upload size={15} />
          {value ? "Ganti dokumen" : "Tambah dokumen"}
          <ChevronDown
            size={15}
            className={`ml-auto transition ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setCameraOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Camera size={16} /> Ambil dari kamera
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                fileInput.current?.click();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Upload size={16} /> Pilih dari perangkat
            </button>
          </div>
        )}
      </div>

      <span
        className={`mt-3 block truncate text-xs ${value ? "font-medium text-emerald-700" : "text-slate-400"}`}
      >
        {value ? value.name : "Belum ada file dipilih"}
      </span>
      <span className="mt-1 block text-[11px] text-slate-400">
        JPG, PNG, atau WebP · maksimal 10 MB · dikompres otomatis
      </span>

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        label={label}
        onCapture={onChange}
      />
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
    delivery_proof_image: null,
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
                    <SearchableItemSelect
                      value={detail.item_id}
                      items={items}
                      placeholder="Cari kode atau nama produk"
                      onChange={(itemId) => setDetail(index, "item_id", itemId)}
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
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
              {[
                [
                  "receipt_image",
                  "Foto nota",
                  "Foto nota pembelian dari supplier",
                ],
                [
                  "payment_proof_image",
                  "Bukti pembayaran",
                  "Foto transfer atau bukti pembayaran",
                ],
                [
                  "delivery_proof_image",
                  "Bukti pengiriman",
                  "Foto surat jalan atau bukti barang dikirim",
                ],
              ].map(([key, label, description]) => (
                <SupportingDocumentInput
                  key={key}
                  label={label}
                  description={description}
                  value={form.data[key]}
                  onChange={(file) => form.setData(key, file)}
                />
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
