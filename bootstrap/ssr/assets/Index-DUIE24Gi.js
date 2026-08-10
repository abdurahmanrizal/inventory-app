import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { jsx, jsxs } from "react/jsx-runtime";
import { CheckCheck, KeyRound, Save, ShieldCheck, UsersRound, X } from "lucide-react";
//#region resources/js/pages/AccessManagement/Index.tsx
var roleLabels = {
	superadmin: "Super Admin",
	warehouse_admin_dry: "Admin Gudang Kering",
	warehouse_admin_wet: "Admin Gudang Basah",
	unit_user: "Admin Unit",
	unit_manager: "Manajer Unit / Gudang",
	warehouse_manager: "Manajer Gudang Utama",
	finance: "Keuangan"
};
function Index({ roles, permissions, assigned }) {
	const editableRoles = roles.filter((role) => role.code !== "superadmin");
	const [selectedRole, setSelectedRole] = useState(editableRoles[0]?.id);
	const selected = roles.find((role) => role.id === selectedRole);
	const form = useForm({ permissions: assigned[selectedRole] || [] });
	const chooseRole = (role) => {
		const values = assigned[role.id] || [];
		setSelectedRole(role.id);
		form.setDefaults("permissions", values);
		form.setData("permissions", values);
		form.clearErrors();
	};
	const toggle = (code) => form.setData("permissions", form.data.permissions.includes(code) ? form.data.permissions.filter((item) => item !== code) : [...form.data.permissions, code]);
	const submit = () => form.put(`/access-management/${selectedRole}`, {
		preserveScroll: true,
		onSuccess: () => {
			form.setDefaults("permissions", form.data.permissions);
			toast.success("Hak akses role berhasil diperbarui.");
		},
		onError: (errors) => toast.error(Object.values(errors)[0])
	});
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Manajemen Akses",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Manajemen Akses" }),
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
							children: "Hak akses berdasarkan role"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 max-w-2xl text-sm leading-6 text-slate-400",
							children: "Tentukan permission yang dimiliki setiap role. Data role dan permission dikelola melalui modul terpisah."
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ jsx(Stat, {
							icon: UsersRound,
							label: "Role dikelola",
							value: editableRoles.length
						}), /* @__PURE__ */ jsx(Stat, {
							icon: KeyRound,
							label: "Jenis akses",
							value: permissions.length
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
							className: "font-semibold text-slate-950",
							children: "Konfigurasi hak akses"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-slate-500",
							children: "Pilih role, kemudian tentukan permission yang dapat digunakan."
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [form.isDirty && /* @__PURE__ */ jsx("span", {
								className: "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700",
								children: "Belum disimpan"
							}), /* @__PURE__ */ jsxs("span", {
								className: "rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700",
								children: [
									form.data.permissions.length,
									" dari ",
									permissions.length,
									" aktif"
								]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "border-b border-slate-100 bg-slate-50/70 px-5 py-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2",
							children: editableRoles.map((role) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => chooseRole(role),
								"aria-pressed": selectedRole === role.id,
								className: `inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${selectedRole === role.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:text-emerald-700"}`,
								children: [
									/* @__PURE__ */ jsx(KeyRound, { size: 16 }),
									" ",
									roleLabels[role.code] || role.name
								]
							}, role.id))
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-xs text-slate-500",
							children: "Super Admin selalu memiliki seluruh akses dan tidak dapat dibatasi."
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm font-semibold text-slate-800",
							children: roleLabels[selected?.code] || selected?.name
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 text-xs text-slate-500",
							children: "Klik kartu untuk mengaktifkan atau menonaktifkan akses."
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => form.setData("permissions", permissions.map((item) => item.code)),
								className: "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700",
								children: [/* @__PURE__ */ jsx(CheckCheck, { size: 14 }), " Pilih semua"]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => form.setData("permissions", []),
								className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600",
								children: [/* @__PURE__ */ jsx(X, { size: 14 }), " Kosongkan"]
							})]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "grid gap-3 p-5 sm:grid-cols-2",
						children: permissions.map((permission) => {
							const active = form.data.permissions.includes(permission.code);
							return /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => toggle(permission.code),
								"aria-pressed": active,
								className: `flex min-h-28 items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white hover:bg-slate-50"}`,
								children: [/* @__PURE__ */ jsx("span", {
									className: `mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border ${active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`,
									children: active && /* @__PURE__ */ jsx(ShieldCheck, { size: 13 })
								}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
									className: "block text-sm font-semibold text-slate-800",
									children: permission.name
								}), /* @__PURE__ */ jsx("span", {
									className: "mt-1 block text-xs leading-5 text-slate-500",
									children: permission.module
								})] })]
							}, permission.id);
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col-reverse gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-slate-500",
							children: [
								"Perubahan berlaku untuk seluruh user dengan role",
								" ",
								/* @__PURE__ */ jsx("b", { children: roleLabels[selected?.code] || selected?.name }),
								"."
							]
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: form.processing || !selectedRole || !form.isDirty,
							onClick: submit,
							className: "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white disabled:opacity-50",
							children: [
								/* @__PURE__ */ jsx(Save, { size: 16 }),
								" ",
								form.processing ? "Menyimpan..." : "Simpan hak akses"
							]
						})]
					})
				]
			})
		]
	});
}
function Stat({ icon: Icon, label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "min-w-28 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 text-slate-400",
			children: [/* @__PURE__ */ jsx(Icon, { size: 14 }), /* @__PURE__ */ jsx("p", {
				className: "text-xs",
				children: label
			})]
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-xl font-semibold",
			children: value
		})]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DUIE24Gi.js.map