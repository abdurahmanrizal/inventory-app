import { Head, useForm } from "@inertiajs/react";
import {
  KeyRound,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import ConfirmActionDialog from "../../components/confirm-action-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import AppLayout from "../../layouts/AppLayout";

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";

export default function Index({ roles, systemRoles }: any) {
  const [editing, setEditing] = useState<any>(undefined);
  const [deleting, setDeleting] = useState<any>(null);
  const form = useForm({ code: "", name: "", description: "" });

  const openEditor = (role: any = null) => {
    form.setData({
      code: role?.code || "",
      name: role?.name || "",
      description: role?.description || "",
    });
    form.clearErrors();
    setEditing(role);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        setEditing(undefined);
        toast.success(
          editing ? "Role berhasil diperbarui." : "Role berhasil ditambahkan.",
        );
      },
      onError: (errors: any) => toast.error(Object.values(errors)[0] as string),
    };

    if (editing) {
      form.put(`/access-management/roles/${editing.id}`, options);
    } else {
      form.post("/access-management/roles", options);
    }
  };
  const remove = () =>
    deleting &&
    form.delete(`/access-management/roles/${deleting.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeleting(null);
        toast.success("Role berhasil dihapus.");
      },
      onError: (errors: any) => toast.error(Object.values(errors)[0] as string),
    });

  return (
    <AppLayout title="Manajemen Role">
      <Head title="Manajemen Role" />
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300">
              <ShieldCheck size={14} /> Khusus Super Admin
            </span>
            <h2 className="mt-4 text-2xl font-semibold">Role pengguna</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Tambahkan dan kelola kelompok akses pengguna pada WMS.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
            <p className="text-xs text-slate-400">Total role</p>
            <p className="mt-1 text-xl font-semibold">{roles.length}</p>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5">
          <div>
            <h3 className="font-semibold text-slate-950">Daftar role</h3>
            <p className="mt-1 text-sm text-slate-500">
              Identitas role yang tersedia pada sistem.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openEditor(null)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white"
          >
            <Plus size={16} /> Tambah role
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {roles.map((role: any) => (
            <div
              key={role.id}
              className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/70"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <KeyRound size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-800">{role.name}</p>
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                    {role.code}
                  </code>
                  {systemRoles.includes(role.code) && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      Role sistem
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {role.description || "Tanpa deskripsi"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openEditor(role)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-emerald-600"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                disabled={systemRoles.includes(role.code)}
                onClick={() => setDeleting(role)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-rose-600 disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[480px]">
          <form onSubmit={submit}>
            <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
              <div className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <KeyRound size={18} />
                </span>
                <div className="min-w-0 pr-6">
                  <DialogTitle className="text-lg leading-6 text-slate-950">
                    {editing ? "Edit role" : "Tambah role baru"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm leading-5 text-slate-500">
                    Atur identitas dan keterangan role pengguna.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-5 px-6 py-5">
              <Field label="Nama role" error={form.errors.name}>
                <input
                  className={input}
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  placeholder="Contoh: Auditor Stok"
                  autoFocus
                />
              </Field>
              <Field label="Kode role" error={form.errors.code}>
                <input
                  className={input}
                  value={form.data.code}
                  onChange={(e) =>
                    form.setData(
                      "code",
                      e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    )
                  }
                  placeholder="auditor_stok"
                />
                <p className="text-[11px] leading-4 text-slate-400">
                  Gunakan huruf kecil, angka, dan garis bawah.
                </p>
              </Field>
              <Field label="Deskripsi" error={form.errors.description}>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-400"
                  value={form.data.description}
                  onChange={(e) => form.setData("description", e.target.value)}
                  placeholder="Jelaskan fungsi dan cakupan role ini"
                />
              </Field>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditing(undefined)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                disabled={form.processing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
              >
                <Save size={15} /> {form.processing ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmActionDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={remove}
        processing={form.processing}
        tone="rose"
        title="Hapus role?"
        description={`Role “${deleting?.name || ""}” dan relasi hak aksesnya akan dihapus.`}
        confirmLabel="Ya, hapus"
      />
    </AppLayout>
  );
}

function Field({ label, error, children }: any) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
