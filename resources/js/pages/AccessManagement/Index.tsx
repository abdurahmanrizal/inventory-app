import { Head, useForm } from "@inertiajs/react";
import {
  CheckCheck,
  KeyRound,
  Save,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AppLayout from "../../layouts/AppLayout";

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  warehouse_admin_dry: "Admin Gudang Kering",
  warehouse_admin_wet: "Admin Gudang Basah",
  unit_user: "Admin Unit",
  unit_manager: "Manajer Unit / Gudang",
  finance: "Keuangan",
};

export default function Index({ roles, permissions, assigned }: any) {
  const editableRoles = roles.filter((role: any) => role.code !== "superadmin");
  const [selectedRole, setSelectedRole] = useState(editableRoles[0]?.id);
  const selected = roles.find((role: any) => role.id === selectedRole);
  const form = useForm({ permissions: assigned[selectedRole] || [] });
  const chooseRole = (role: any) => {
    const values = assigned[role.id] || [];
    setSelectedRole(role.id);
    form.setDefaults("permissions", values);
    form.setData("permissions", values);
    form.clearErrors();
  };
  const toggle = (code: string) =>
    form.setData(
      "permissions",
      form.data.permissions.includes(code)
        ? form.data.permissions.filter((item: string) => item !== code)
        : [...form.data.permissions, code],
    );
  const submit = () =>
    form.put(`/access-management/${selectedRole}`, {
      preserveScroll: true,
      onSuccess: () => {
        form.setDefaults("permissions", form.data.permissions);
        toast.success("Hak akses role berhasil diperbarui.");
      },
      onError: (errors) => toast.error(Object.values(errors)[0] as string),
    });

  return (
    <AppLayout title="Manajemen Akses">
      <Head title="Manajemen Akses" />
      <section className="mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300">
              <ShieldCheck size={14} /> Khusus Super Admin
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              Hak akses berdasarkan role
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Tentukan permission yang dimiliki setiap role. Data role dan
              permission dikelola melalui modul terpisah.
            </p>
          </div>
          <div className="flex gap-3">
            <Stat
              icon={UsersRound}
              label="Role dikelola"
              value={editableRoles.length}
            />
            <Stat
              icon={KeyRound}
              label="Jenis akses"
              value={permissions.length}
            />
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Konfigurasi hak akses
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Pilih role, kemudian tentukan permission yang dapat digunakan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {form.isDirty && (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Belum disimpan
              </span>
            )}
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {form.data.permissions.length} dari {permissions.length} aktif
            </span>
          </div>
        </div>
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {editableRoles.map((role: any) => (
              <button
                type="button"
                key={role.id}
                onClick={() => chooseRole(role)}
                aria-pressed={selectedRole === role.id}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${selectedRole === role.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:text-emerald-700"}`}
              >
                <KeyRound size={16} /> {roleLabels[role.code] || role.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Super Admin selalu memiliki seluruh akses dan tidak dapat dibatasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {roleLabels[selected?.code] || selected?.name}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Klik kartu untuk mengaktifkan atau menonaktifkan akses.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                form.setData(
                  "permissions",
                  permissions.map((item: any) => item.code),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
            >
              <CheckCheck size={14} /> Pilih semua
            </button>
            <button
              type="button"
              onClick={() => form.setData("permissions", [])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
            >
              <X size={14} /> Kosongkan
            </button>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {permissions.map((permission: any) => {
            const active = form.data.permissions.includes(permission.code);
            return (
              <button
                type="button"
                key={permission.id}
                onClick={() => toggle(permission.code)}
                aria-pressed={active}
                className={`flex min-h-28 items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}
                >
                  {active && <ShieldCheck size={13} />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    {permission.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {permission.module}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Perubahan berlaku untuk seluruh user dengan role{" "}
            <b>{roleLabels[selected?.code] || selected?.name}</b>.
          </p>
          <button
            type="button"
            disabled={form.processing || !selectedRole || !form.isDirty}
            onClick={submit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save size={16} />{" "}
            {form.processing ? "Menyimpan..." : "Simpan hak akses"}
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />
        <p className="text-xs">{label}</p>
      </div>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
