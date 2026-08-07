/* eslint-disable @typescript-eslint/no-explicit-any */
import { Head, Link, useForm } from "@inertiajs/react";
import {
  KeyRound,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import AppLayout from "../../layouts/AppLayout";

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
const roleTone: Record<string, string> = {
  superadmin: "bg-violet-50 text-violet-700",
  warehouse_admin_dry: "bg-amber-50 text-amber-700",
  warehouse_admin_wet: "bg-blue-50 text-blue-700",
  unit_manager: "bg-emerald-50 text-emerald-700",
  unit_user: "bg-slate-100 text-slate-700",
  finance: "bg-cyan-50 text-cyan-700",
};

export default function Index({ users, warehouses, roles }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [search, setSearch] = useState("");
  const form = useForm({
    name: "",
    email: "",
    role: "unit_user",
    warehouse_id: "",
    password: "",
    password_confirmation: "",
  });
  const visibleUsers = useMemo(
    () =>
      users.data.filter((user: any) =>
        `${user.name} ${user.email} ${user.role} ${user.warehouse?.name || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [users.data, search],
  );
  const reset = () => {
    setEditing(null);
    form.reset();
    form.clearErrors();
  };
  const createNew = () => {
    reset();
    setSearch("");
    window.requestAnimationFrame(() =>
      document
        .getElementById("user-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };
  const edit = (user: any) => {
    setEditing(user);
    form.setData({
      name: user.name,
      email: user.email,
      role: user.role,
      warehouse_id: user.warehouse_id || "",
      password: "",
      password_confirmation: "",
    });
    window.scrollTo({ top: 220, behavior: "smooth" });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(
          editing ? "User berhasil diperbarui." : "User berhasil ditambahkan.",
        );
        reset();
      },
      onError: (errors: any) => toast.error(Object.values(errors)[0] as string),
    };
    editing
      ? form.put(`/user-management/${editing.id}`, options)
      : form.post("/user-management", options);
  };
  const remove = () =>
    deleting &&
    form.delete(`/user-management/${deleting.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("User berhasil dihapus.");
        setDeleting(null);
      },
      onError: (errors: any) => toast.error(Object.values(errors)[0] as string),
    });

  return (
    <AppLayout title="Manajemen User">
      <Head title="Manajemen User" />
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300">
              <ShieldCheck size={14} /> Khusus Super Admin
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              Kelola akses pengguna WMS
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Tambahkan akun, tentukan role dan gudang, atau perbarui akses
              pengguna dengan aman.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
            <p className="text-xs text-slate-400">Total pengguna</p>
            <p className="mt-1 text-xl font-semibold">{users.total}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section
          id="user-form"
          className="h-fit scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                {editing ? <Pencil size={18} /> : <Plus size={18} />}
              </span>
              <div>
                <h3 className="font-semibold text-slate-950">
                  {editing ? "Edit pengguna" : "Tambah pengguna"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {editing
                    ? "Kosongkan password bila tidak diubah."
                    : "Buat akun dan tentukan ruang lingkupnya."}
                </p>
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4 p-5">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Nama lengkap
              </span>
              <input
                className={input}
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                placeholder="Nama pengguna"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Email
              </span>
              <input
                type="email"
                className={input}
                value={form.data.email}
                onChange={(e) => form.setData("email", e.target.value)}
                placeholder="user@wms.test"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Role</span>
              <select
                className={input}
                value={form.data.role}
                onChange={(e) =>
                  form.setData({
                    ...form.data,
                    role: e.target.value,
                    warehouse_id:
                      ["superadmin", "finance"].includes(e.target.value)
                        ? ""
                        : form.data.warehouse_id,
                  })
                }
              >
                {roles.map((role: any) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            {!['superadmin', 'finance'].includes(form.data.role) && (
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  Gudang / unit
                </span>
                <select
                  className={input}
                  value={form.data.warehouse_id}
                  onChange={(e) => form.setData("warehouse_id", e.target.value)}
                >
                  <option value="">Pilih gudang atau unit</option>
                  {warehouses.map((warehouse: any) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} · {warehouse.type}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  Password{" "}
                  {editing && (
                    <small className="font-normal text-slate-400">
                      (opsional)
                    </small>
                  )}
                </span>
                <input
                  type="password"
                  className={input}
                  value={form.data.password}
                  onChange={(e) => form.setData("password", e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-700">
                  Konfirmasi password
                </span>
                <input
                  type="password"
                  className={input}
                  value={form.data.password_confirmation}
                  onChange={(e) =>
                    form.setData("password_confirmation", e.target.value)
                  }
                  placeholder="Ulangi password"
                />
              </label>
            </div>
            {Object.keys(form.errors).length > 0 && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700">
                {Object.values(form.errors).map((error: any, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                disabled={form.processing}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {editing ? <Pencil size={16} /> : <Plus size={16} />}{" "}
                {form.processing
                  ? "Memproses..."
                  : editing
                    ? "Simpan perubahan"
                    : "Tambah user"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">Daftar pengguna</h3>
              <p className="mt-1 text-sm text-slate-500">
                Role dan penempatan gudang seluruh akun.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-3 text-slate-400"
                />
                <input
                  className={`${input} pl-10 sm:w-64`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pengguna..."
                />
              </label>
              <button
                type="button"
                onClick={createNew}
                className="inline-flex h-11 items-center justify-center whitespace-nowrap gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-600"
              >
                <Plus size={16} /> Buat user baru
              </button>
            </div>
          </div>
          {visibleUsers.length ? (
            <div className="divide-y divide-slate-100">
              {visibleUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {user.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleTone[user.role] || "bg-slate-100 text-slate-600"}`}
                    >
                      {user.role === "finance"
                        ? "Keuangan"
                        : user.role
                            .replaceAll("_", " ")
                            .replace(/\b\w/g, (char: string) => char.toUpperCase())}
                    </span>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {user.warehouse?.name || "Akses seluruh gudang"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => edit(user)}
                      className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                      aria-label="Edit user"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleting(user)}
                      className="grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50"
                      aria-label="Hapus user"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <UsersRound className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">
                Pengguna tidak ditemukan.
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
            {users.links.map((link: any, index: number) => (
              <Link
                key={index}
                href={link.url || "#"}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${link.active ? "bg-emerald-500 text-white" : link.url ? "border border-slate-200 text-slate-600" : "text-slate-300"}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </section>
      </div>
      <ConfirmActionDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
        processing={form.processing}
        tone="rose"
        title="Hapus pengguna ini?"
        description={`${deleting?.name || "Pengguna"} akan kehilangan akses ke WMS. User yang sudah memiliki riwayat transaksi tidak dapat dihapus.`}
        confirmLabel="Ya, hapus user"
      />
    </AppLayout>
  );
}
