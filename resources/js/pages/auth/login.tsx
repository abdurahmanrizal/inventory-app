import { Form, Head } from "@inertiajs/react";
import {
  Activity,
  Boxes,
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { store } from "@/routes/login";

type Props = { status?: string; canResetPassword: boolean };
const inputClass =
  "h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10";

export default function Login({ status }: Props) {
  return (
    <div className="min-h-screen bg-[#071220] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <Head title="Masuk ke WMS Core" />

      <section className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.06] p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="pointer-events-none absolute -left-32 -top-40 size-[560px] rounded-full bg-emerald-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 size-[480px] rounded-full bg-blue-500/10 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-950/40">
            <Boxes size={24} />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">WMS Core</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Inventory Control
            </p>
          </div>
        </div>

        <div className="relative my-auto max-w-xl py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
            <Activity size={14} /> Sistem operasional aktif
          </div>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-[-0.035em] xl:text-5xl">
            Kendalikan persediaan dari satu ruang kerja.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
            Kelola penerimaan, permintaan unit, mutasi, dan approval gudang
            secara akurat dan terintegrasi.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Feature icon={ShieldCheck} title="Akses berbasis role">
              Hak akses gudang dan unit terisolasi dengan aman.
            </Feature>
            <Feature icon={CheckCircle2} title="Approval terkontrol">
              Setiap pergerakan stok tercatat dan dapat ditelusuri.
            </Feature>
          </div>
        </div>
        <p className="relative text-xs text-slate-600">
          © {new Date().getFullYear()} WMS Core · Warehouse Management System
        </p>
      </section>

      <main className="relative flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Boxes size={21} />
            </span>
            <div>
              <p className="font-semibold text-slate-950">WMS Core</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Inventory Control
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:p-8">
            <div className="mb-7">
              <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <LockKeyhole size={21} />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Selamat datang kembali
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masukkan akun WMS Anda untuk melanjutkan ke workspace.
              </p>
            </div>
            {status && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-700">
                <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                {status}
              </div>
            )}
            {/*<PasskeyVerify
              label="Masuk dengan passkey"
              loadingLabel="Memverifikasi..."
              separator="atau gunakan email"
            />*/}

            <Form
              {...store.form()}
              resetOnSuccess={["password"]}
              className="space-y-5"
            >
              {({ processing, errors }) => (
                <>
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Email
                    </span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoFocus
                      tabIndex={1}
                      autoComplete="email"
                      placeholder="nama@perusahaan.com"
                      className={inputClass}
                    />
                    <InputError message={errors.email} />
                  </label>
                  <label className="grid gap-2">
                    {/*<span className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      Password
                      {canResetPassword && (
                        <TextLink
                          href={request()}
                          className="font-medium text-emerald-700 hover:text-emerald-600"
                          tabIndex={5}
                        >
                          Lupa password?
                        </TextLink>
                      )}
                    </span>*/}
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      tabIndex={2}
                      autoComplete="current-password"
                      placeholder="Masukkan password"
                      className={inputClass}
                    />
                    <InputError message={errors.password} />
                  </label>
                  <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-slate-600">
                    <Checkbox
                      id="remember"
                      name="remember"
                      tabIndex={3}
                      className="border-slate-300 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />
                    Ingat saya di perangkat ini
                  </label>
                  <button
                    type="submit"
                    tabIndex={4}
                    disabled={processing}
                    data-test="login-button"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60"
                  >
                    {processing && <Spinner />}
                    {processing ? "Memverifikasi..." : "Masuk ke WMS"}
                  </button>
                </>
              )}
            </Form>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            Akses dilindungi dan aktivitas pengguna tercatat
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm">
      <Icon size={20} className="text-emerald-400" />
      <p className="mt-3 text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{children}</p>
    </div>
  );
}
