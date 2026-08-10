import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as InputError } from "./input-error-kjOtsSWi.js";
import { Head, useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { jsx, jsxs } from "react/jsx-runtime";
import { Calculator, Check, Layers3, LockKeyhole, Save, ShieldCheck } from "lucide-react";
//#region resources/js/pages/settings/inventory-valuation.tsx
function InventoryValuation({ setting }) {
	const form = useForm({ valuation_method: setting.valuation_method });
	const submit = (event) => {
		event.preventDefault();
		form.put("/settings/inventory-valuation", {
			preserveScroll: true,
			onSuccess: () => {
				form.setDefaults("valuation_method", form.data.valuation_method);
				toast.success("Metode valuasi berhasil disimpan.");
			},
			onError: (errors) => toast.error(String(Object.values(errors)[0] ?? "Metode valuasi gagal disimpan."))
		});
	};
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Pengaturan Valuasi",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Pengaturan Valuasi" }),
			/* @__PURE__ */ jsx("section", {
				className: "mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col justify-between gap-5 sm:flex-row sm:items-end",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300",
							children: [/* @__PURE__ */ jsx(ShieldCheck, { size: 14 }), " Khusus Super Admin"]
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-4 text-2xl font-semibold",
							children: "Metode valuasi persediaan"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 max-w-2xl text-sm leading-6 text-slate-400",
							children: "Tentukan satu metode perhitungan HPP yang digunakan secara global untuk seluruh gudang dan barang."
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-400",
							children: "Metode aktif"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 font-semibold text-emerald-300",
							children: setting.valuation_method === "fifo" ? "FIFO" : "Moving Average"
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-b border-slate-100 px-5 py-5 sm:px-6",
					children: [/* @__PURE__ */ jsx("h3", {
						className: "font-semibold text-slate-950",
						children: "Konfigurasi valuasi"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-slate-500",
						children: "Pilihan akan dikunci otomatis setelah transaksi persediaan pertama diposting."
					})]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: submit,
					className: "space-y-5 p-5 sm:p-6",
					children: [
						setting.locked && /* @__PURE__ */ jsxs("div", {
							className: "flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900",
							children: [/* @__PURE__ */ jsx(LockKeyhole, { className: "mt-0.5 size-5 shrink-0" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "font-semibold",
								children: "Metode valuasi telah dikunci"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-amber-700",
								children: "Transaksi persediaan sudah diposting. Perubahan metode memerlukan proses migrasi nilai persediaan."
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid gap-4 lg:grid-cols-2",
							children: [/* @__PURE__ */ jsx(MethodCard, {
								id: "moving_average",
								icon: Calculator,
								title: "Moving Average",
								description: "HPP dihitung ulang sebagai rata-rata tertimbang setiap kali stok baru diterima.",
								checked: form.data.valuation_method === "moving_average",
								disabled: setting.locked,
								onChange: () => form.setData("valuation_method", "moving_average")
							}), /* @__PURE__ */ jsx(MethodCard, {
								id: "fifo",
								icon: Layers3,
								title: "FIFO",
								description: "Barang keluar menggunakan layer biaya penerimaan yang paling lama terlebih dahulu.",
								checked: form.data.valuation_method === "fifo",
								disabled: setting.locked,
								onChange: () => form.setData("valuation_method", "fifo")
							})]
						}),
						/* @__PURE__ */ jsx(InputError, { message: form.errors.valuation_method }),
						/* @__PURE__ */ jsx("div", {
							className: "flex items-center justify-end border-t border-slate-100 pt-5",
							children: /* @__PURE__ */ jsxs("button", {
								type: "submit",
								disabled: setting.locked || form.processing || !form.isDirty,
								className: "inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50",
								children: [
									/* @__PURE__ */ jsx(Save, { size: 17 }),
									" ",
									form.processing ? "Menyimpan..." : "Simpan metode"
								]
							})
						})
					]
				})]
			})
		]
	});
}
function MethodCard({ id, icon: Icon, title, description, checked, disabled, onChange }) {
	return /* @__PURE__ */ jsxs("label", {
		className: `relative flex items-start gap-4 rounded-2xl border p-5 transition ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${checked ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500" : "border-slate-200 hover:border-emerald-300"}`,
		children: [
			/* @__PURE__ */ jsx("input", {
				id,
				type: "radio",
				name: "valuation_method",
				checked,
				disabled,
				onChange,
				className: "sr-only"
			}),
			/* @__PURE__ */ jsx("span", {
				className: `flex size-11 shrink-0 items-center justify-center rounded-xl ${checked ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`,
				children: /* @__PURE__ */ jsx(Icon, { size: 21 })
			}),
			/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-2 font-semibold text-slate-950",
				children: [
					title,
					" ",
					checked && /* @__PURE__ */ jsx(Check, {
						size: 17,
						className: "text-emerald-600"
					})
				]
			}), /* @__PURE__ */ jsx("span", {
				className: "mt-1.5 block text-sm leading-6 text-slate-500",
				children: description
			})] })
		]
	});
}
//#endregion
export { InventoryValuation as default };

//# sourceMappingURL=inventory-valuation-FQ85_A47.js.map