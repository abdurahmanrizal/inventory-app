import { Head, useForm } from '@inertiajs/react';
import { Calculator, Check, Layers3, LockKeyhole, Save, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/AppLayout';

type Method = 'moving_average' | 'fifo';

export default function InventoryValuation({
    setting,
}: {
    setting: { valuation_method: Method; locked: boolean; locked_at: string | null };
}) {
    const form = useForm({ valuation_method: setting.valuation_method });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/settings/inventory-valuation', {
            preserveScroll: true,
            onSuccess: () => {
                form.setDefaults('valuation_method', form.data.valuation_method);
                toast.success('Metode valuasi berhasil disimpan.');
            },
            onError: (errors) => toast.error(String(Object.values(errors)[0] ?? 'Metode valuasi gagal disimpan.')),
        });
    };

    return (
        <AppLayout title="Pengaturan Valuasi">
            <Head title="Pengaturan Valuasi" />

            <section className="mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300">
                            <ShieldCheck size={14} /> Khusus Super Admin
                        </span>
                        <h2 className="mt-4 text-2xl font-semibold">Metode valuasi persediaan</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Tentukan satu metode perhitungan HPP yang digunakan secara global untuk seluruh gudang dan barang.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3">
                        <p className="text-xs text-slate-400">Metode aktif</p>
                        <p className="mt-1 font-semibold text-emerald-300">
                            {setting.valuation_method === 'fifo' ? 'FIFO' : 'Moving Average'}
                        </p>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                    <h3 className="font-semibold text-slate-950">Konfigurasi valuasi</h3>
                    <p className="mt-1 text-sm text-slate-500">Pilihan akan dikunci otomatis setelah transaksi persediaan pertama diposting.</p>
                </div>

                <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
                    {setting.locked && (
                        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            <LockKeyhole className="mt-0.5 size-5 shrink-0" />
                            <div>
                                <p className="font-semibold">Metode valuasi telah dikunci</p>
                                <p className="mt-1 text-amber-700">Transaksi persediaan sudah diposting. Perubahan metode memerlukan proses migrasi nilai persediaan.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 lg:grid-cols-2">
                        <MethodCard
                            id="moving_average"
                            icon={Calculator}
                            title="Moving Average"
                            description="HPP dihitung ulang sebagai rata-rata tertimbang setiap kali stok baru diterima."
                            checked={form.data.valuation_method === 'moving_average'}
                            disabled={setting.locked}
                            onChange={() => form.setData('valuation_method', 'moving_average')}
                        />
                        <MethodCard
                            id="fifo"
                            icon={Layers3}
                            title="FIFO"
                            description="Barang keluar menggunakan layer biaya penerimaan yang paling lama terlebih dahulu."
                            checked={form.data.valuation_method === 'fifo'}
                            disabled={setting.locked}
                            onChange={() => form.setData('valuation_method', 'fifo')}
                        />
                    </div>

                    <InputError message={form.errors.valuation_method} />
                    <div className="flex items-center justify-end border-t border-slate-100 pt-5">
                        <button
                            type="submit"
                            disabled={setting.locked || form.processing || !form.isDirty}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={17} /> {form.processing ? 'Menyimpan...' : 'Simpan metode'}
                        </button>
                    </div>
                </form>
            </section>
        </AppLayout>
    );
}

function MethodCard({ id, icon: Icon, title, description, checked, disabled, onChange }: {
    id: Method;
    icon: typeof Calculator;
    title: string;
    description: string;
    checked: boolean;
    disabled: boolean;
    onChange: () => void;
}) {
    return (
        <label className={`relative flex items-start gap-4 rounded-2xl border p-5 transition ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${checked ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}>
            <input id={id} type="radio" name="valuation_method" checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${checked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon size={21} />
            </span>
            <span>
                <span className="flex items-center gap-2 font-semibold text-slate-950">
                    {title} {checked && <Check size={17} className="text-emerald-600" />}
                </span>
                <span className="mt-1.5 block text-sm leading-6 text-slate-500">{description}</span>
            </span>
        </label>
    );
}
