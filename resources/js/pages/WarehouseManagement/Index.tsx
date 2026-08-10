import { Head, Link, router, useForm } from "@inertiajs/react";
import {
  Building2,
  Droplets,
  Pencil,
  Plus,
  Search,
  Snowflake,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import AppLayout from "../../layouts/AppLayout";

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";

const emptyForm = {
  code: "",
  name: "",
  type: "main",
  inventory_type: "dry",
  main_warehouse_id: "",
  is_active: true,
};

export default function Index({
  warehouses,
  mainWarehouses,
  filters,
  counts,
}: any) {
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [search, setSearch] = useState(filters.search || "");
  const [activeFilter, setActiveFilter] = useState(filters.filter || "");
  const initialRender = useRef(true);
  const form = useForm(emptyForm);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;

      return;
    }

    const timeout = window.setTimeout(() => {
      router.get(
        "/warehouse-management",
        {
          search: search.trim() || undefined,
          filter: activeFilter || undefined,
        },
        { preserveState: true, preserveScroll: true, replace: true },
      );
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search, activeFilter]);

  const resetForm = () => {
    setEditing(null);
    form.setData(emptyForm);
    form.clearErrors();
  };

  const edit = (warehouse: any) => {
    setEditing(warehouse);
    form.setData({
      code: warehouse.code,
      name: warehouse.name,
      type: warehouse.type,
      inventory_type:
        warehouse.inventory_type ||
        warehouse.main_warehouse?.inventory_type ||
        "dry",
      main_warehouse_id: warehouse.main_warehouse_id || "",
      is_active: warehouse.is_active !== false,
    });
    window.scrollTo({ top: 180, behavior: "smooth" });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(
          editing
            ? "Gudang berhasil diperbarui."
            : "Gudang berhasil ditambahkan.",
        );
        resetForm();
      },
      onError: (errors: any) => toast.error(Object.values(errors)[0] as string),
    };

    if (editing) {
      form.put(`/warehouse-management/${editing.id}`, options);
    } else {
      form.post("/warehouse-management", options);
    }
  };

  const tabs = [
    ["", "Semua", counts.all],
    ["main", "Gudang Utama", counts.main],
    ["unit", "Gudang Unit", counts.unit],
    ["dry", "Kering", counts.dry],
    ["wet", "Basah", counts.wet],
    ["inactive", "Nonaktif", counts.inactive],
  ];

  return (
    <AppLayout title="Master Gudang">
      <Head title="Master Gudang" />
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300">
          <Warehouse size={14} /> Khusus Super Admin
        </span>
        <h2 className="mt-4 text-2xl font-semibold">Kelola struktur gudang</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Tentukan gudang utama kering/basah dan hubungkan setiap gudang unit ke
          sumber distribusinya.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-900">
              {editing ? "Edit gudang" : "Tambah gudang"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Kategori gudang menentukan cakupan item dan alur distribusi.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4 p-5">
            <Field label="Kode gudang">
              <input
                required
                value={form.data.code}
                onChange={(e) =>
                  form.setData("code", e.target.value.toUpperCase())
                }
                className={input}
                placeholder="Contoh: WH-DRY"
              />
            </Field>
            <Field label="Nama gudang">
              <input
                required
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                className={input}
                placeholder="Nama gudang"
              />
            </Field>
            <Field label="Jenis gudang">
              <select
                value={form.data.type}
                onChange={(e) =>
                  form.setData({
                    ...form.data,
                    type: e.target.value,
                    main_warehouse_id:
                      e.target.value === "main"
                        ? ""
                        : form.data.main_warehouse_id,
                  })
                }
                className={input}
              >
                <option value="main">Gudang Utama</option>
                <option value="unit">Gudang Unit</option>
              </select>
            </Field>
            {form.data.type === "main" ? (
              <Field label="Kategori persediaan">
                <select
                  value={form.data.inventory_type}
                  onChange={(e) =>
                    form.setData("inventory_type", e.target.value)
                  }
                  className={input}
                >
                  <option value="dry">Kering</option>
                  <option value="wet">Basah</option>
                </select>
              </Field>
            ) : (
              <Field label="Gudang utama sumber">
                <select
                  required
                  value={form.data.main_warehouse_id}
                  onChange={(e) =>
                    form.setData("main_warehouse_id", e.target.value)
                  }
                  className={input}
                >
                  <option value="">Pilih gudang utama</option>
                  {mainWarehouses
                    .filter(
                      (main: any) =>
                        main.is_active ||
                        Number(main.id) === Number(form.data.main_warehouse_id),
                    )
                    .map((main: any) => (
                      <option key={main.id} value={main.id}>
                        {main.name} ·{" "}
                        {main.inventory_type === "wet" ? "Basah" : "Kering"}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.data.is_active}
                onChange={(e) => form.setData("is_active", e.target.checked)}
                className="size-4 rounded border-slate-300 text-emerald-600"
              />
              Gudang aktif
            </label>
            {Object.keys(form.errors).length > 0 && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {Object.values(form.errors).map((error: any, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                disabled={form.processing}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                {editing ? <Pencil size={16} /> : <Plus size={16} />}{" "}
                {editing ? "Simpan perubahan" : "Tambah gudang"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Daftar gudang</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {warehouses.total} gudang sesuai filter.
                </p>
              </div>
              <div className="relative sm:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <input
                  aria-label="Cari gudang"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`${input} pl-10 pr-10`}
                  placeholder="Cari kode atau nama..."
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Reset pencarian gudang"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {tabs.map(([value, label, count]: any) => (
                <button
                  key={value || "all"}
                  type="button"
                  onClick={() => setActiveFilter(value)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${activeFilter === value ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"}`}
                >
                  {label}
                  <span className="opacity-70">{count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {warehouses.data.length ? (
              warehouses.data.map((warehouse: any) => {
                const inventoryType =
                  warehouse.inventory_type ||
                  warehouse.main_warehouse?.inventory_type;
                const Icon =
                  warehouse.type === "unit"
                    ? Building2
                    : inventoryType === "wet"
                      ? Droplets
                      : Snowflake;

                return (
                  <div
                    key={warehouse.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${inventoryType === "wet" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">
                        {warehouse.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {warehouse.code} ·{" "}
                        {warehouse.type === "main"
                          ? "Gudang Utama"
                          : `Unit dari ${warehouse.main_warehouse?.name || "-"}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${inventoryType === "wet" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {inventoryType === "wet" ? "Basah" : "Kering"}
                      </span>
                      <span
                        className={`size-2 rounded-full ${warehouse.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
                      />
                      <button
                        type="button"
                        onClick={() => edit(warehouse)}
                        className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(warehouse)}
                        className="grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-14 text-center text-sm text-slate-400">
                Gudang tidak ditemukan.
              </div>
            )}
          </div>
          {warehouses.last_page > 1 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-5 py-4">
              {warehouses.links.map((link: any, index: number) =>
                link.url ? (
                  <Link
                    key={index}
                    href={link.url}
                    preserveState
                    preserveScroll
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${link.active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600"}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <span
                    key={index}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-300"
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>
      <ConfirmActionDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() =>
          deleting &&
          form.delete(`/warehouse-management/${deleting.id}`, {
            preserveScroll: true,
            onSuccess: () => {
              toast.success("Gudang berhasil dihapus.");
              setDeleting(null);
            },
            onError: (errors: any) =>
              toast.error(Object.values(errors)[0] as string),
          })
        }
        processing={form.processing}
        tone="rose"
        title="Hapus gudang ini?"
        description={`${deleting?.name || "Gudang"} hanya dapat dihapus jika belum pernah digunakan.`}
        confirmLabel="Ya, hapus gudang"
      />
    </AppLayout>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
