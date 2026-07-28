/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Legacy WMS page migrated from JSX; type incrementally.
import { Head, useForm } from "@inertiajs/react";
import { AlertCircle, CheckCircle2, PackageMinus, Plus, Trash2, Warehouse } from "lucide-react";
import { useState } from "react";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import TransactionHistory from "../../components/TransactionHistory";
import AppLayout from "../../layouts/AppLayout";

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const emptyDetail = () => ({
  item_id: "",
  qty: 1,
  unit_cost: 0,
  batch_no: "",
  expired_at: "",
});

export default function Index({ transactions, warehouses, items, userWarehouse }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const form = useForm({
    type: "stock_out",
    stock_out_reason: "operational",
    source_warehouse_id: userWarehouse?.id || "",
    supplier_name: "",
    document_date: new Date().toISOString().slice(0, 10),
    notes: "",
    details: [emptyDetail()],
  });

  const setDetail = (index, key, value) =>
    form.setData(
      "details",
      form.data.details.map((detail, position) =>
        position === index ? { ...detail, [key]: value } : detail,
      ),
    );

  const submit = (event) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    form.post("/stock-transactions", {
      preserveScroll: true,
      onSuccess: () => {
        setConfirmOpen(false);
        form.reset();
      },
    });
  };

  const errors = Object.values(form.errors);

  return (
    <AppLayout title="Stock Out">
      <Head title="Stock Out" />

      <div className="mb-6">
        <p className="text-sm font-medium text-blue-700">Pergerakan persediaan</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Buat pengajuan barang keluar
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Pengajuan stock out akan melalui approval berjenjang dari manajer unit terkait sebelum stok gudang dipotong.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {errors.length > 0 && (
          <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertCircle className="mt-0.5 shrink-0" size={19} />
            <div>
              <p className="text-sm font-semibold">Periksa kembali data transaksi</p>
              <ul className="mt-1 list-inside list-disc text-xs leading-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="border-b border-slate-100 p-5 sm:px-6">
            <p className="text-xs font-semibold text-slate-700">Jenis transaksi</p>
            <div className="mt-3 inline-flex rounded-xl bg-slate-100 p-1.5">
              <button
                type="button"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm"
              >
                <PackageMinus size={16} className="mr-2 inline" />
                Stock Out
              </button>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">
                Gudang asal <b className="text-rose-500">*</b>
              </span>
              {userWarehouse?.id ? (
                <div className={`${fieldClass} flex items-center bg-slate-50 text-slate-600`}>
                  {userWarehouse?.name || "Gudang akun belum ditentukan"}
                </div>
              ) : (
                <select
                  className={fieldClass}
                  value={form.data.source_warehouse_id}
                  onChange={(event) => form.setData("source_warehouse_id", event.target.value)}
                >
                  <option value="">Pilih gudang asal</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">
                Jenis pengeluaran <b className="text-rose-500">*</b>
              </span>
              <select
                className={fieldClass}
                value={form.data.stock_out_reason}
                onChange={(event) => form.setData("stock_out_reason", event.target.value)}
              >
                <option value="operational">Pemakaian operasional</option>
                <option value="shrinkage">Penyusutan</option>
                <option value="expired">Kedaluwarsa</option>
                <option value="damaged">Rusak</option>
                <option value="waste">Waste / terbuang</option>
                <option value="return">Retur</option>
                <option value="other">Lainnya</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Penerima / tujuan</span>
              <input
                className={fieldClass}
                placeholder="Unit atau pihak penerima"
                value={form.data.supplier_name}
                onChange={(event) => form.setData("supplier_name", event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">
                Tanggal dokumen <b className="text-rose-500">*</b>
              </span>
              <input
                type="date"
                className={fieldClass}
                value={form.data.document_date}
                onChange={(event) => form.setData("document_date", event.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-5 px-5 pb-5 sm:px-6 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-semibold text-slate-700">Catatan</span>
              <input
                className={fieldClass}
                placeholder="Keperluan transaksi"
                value={form.data.notes}
                onChange={(event) => form.setData("notes", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                <Warehouse size={18} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Detail barang</h3>
                <p className="text-xs text-slate-500">Isi item sesuai batch stok yang tersedia.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => form.setData("details", [...form.data.details, emptyDetail()])}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus size={15} />
              Tambah item
            </button>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {form.data.details.map((detail, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Item {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    aria-label="Hapus item"
                    type="button"
                    disabled={form.data.details.length === 1}
                    onClick={() => form.setData("details", form.data.details.filter((_, position) => position !== index))}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-12">
                  <label className="space-y-2 md:col-span-6">
                    <span className="text-xs font-semibold text-slate-600">Produk</span>
                    <select
                      className={fieldClass}
                      value={detail.item_id}
                      onChange={(event) => setDetail(index, "item_id", event.target.value)}
                    >
                      <option value="">Pilih produk</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} - {item.name} ({item.base_uom})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-3">
                    <span className="text-xs font-semibold text-slate-600">Kuantitas</span>
                    <input
                      type="number"
                      min="0.001"
                      step=".001"
                      className={fieldClass}
                      value={detail.qty}
                      onChange={(event) => setDetail(index, "qty", event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-3">
                    <span className="text-xs font-semibold text-slate-600">Nomor batch</span>
                    <input
                      className={fieldClass}
                      placeholder="Sesuai saldo stok"
                      value={detail.batch_no}
                      onChange={(event) => setDetail(index, "batch_no", event.target.value)}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={() => form.reset()}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600"
            >
              Reset
            </button>
            <button
              disabled={form.processing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-60"
            >
              <CheckCircle2 size={17} />
              {form.processing ? "Mengirim..." : "Ajukan Stock Out"}
            </button>
          </div>
        </section>
      </form>

      <TransactionHistory
        transactions={transactions}
        title="Daftar pengajuan Stock Out"
        emptyText="Pengajuan Stock Out yang dibuat akan muncul di sini."
      />

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmSubmit}
        processing={form.processing}
        tone="amber"
        title="Ajukan Stock Out?"
        description="Pastikan gudang, produk, jumlah, dan batch sudah benar. Transaksi akan masuk ke approval berjenjang."
        confirmLabel="Ya, ajukan approval"
      />
    </AppLayout>
  );
}
