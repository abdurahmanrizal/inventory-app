import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BRHxsiws.js";
import { n as ConfirmActionDialog, t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";
import { jsx, jsxs } from "react/jsx-runtime";
import { KeyRound, Pencil, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
//#region resources/js/pages/RoleManagement/Index.tsx
var input = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
function Index({ roles, systemRoles }) {
	const [editing, setEditing] = useState(void 0);
	const [deleting, setDeleting] = useState(null);
	const form = useForm({
		code: "",
		name: "",
		description: ""
	});
	const openEditor = (role = null) => {
		form.setData({
			code: role?.code || "",
			name: role?.name || "",
			description: role?.description || ""
		});
		form.clearErrors();
		setEditing(role);
	};
	const submit = (event) => {
		event.preventDefault();
		const options = {
			preserveScroll: true,
			onSuccess: () => {
				setEditing(void 0);
				toast.success(editing ? "Role berhasil diperbarui." : "Role berhasil ditambahkan.");
			},
			onError: (errors) => toast.error(Object.values(errors)[0])
		};
		if (editing) form.put(`/access-management/roles/${editing.id}`, options);
		else form.post("/access-management/roles", options);
	};
	const remove = () => deleting && form.delete(`/access-management/roles/${deleting.id}`, {
		preserveScroll: true,
		onSuccess: () => {
			setDeleting(null);
			toast.success("Role berhasil dihapus.");
		},
		onError: (errors) => toast.error(Object.values(errors)[0])
	});
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Manajemen Role",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Manajemen Role" }),
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
							children: "Role pengguna"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 max-w-2xl text-sm text-slate-400",
							children: "Tambahkan dan kelola kelompok akses pengguna pada WMS."
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-400",
							children: "Total role"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xl font-semibold",
							children: roles.length
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: "font-semibold text-slate-950",
						children: "Daftar role"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-slate-500",
						children: "Identitas role yang tersedia pada sistem."
					})] }), /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => openEditor(null),
						className: "inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ jsx(Plus, { size: 16 }), " Tambah role"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "divide-y divide-slate-100",
					children: roles.map((role) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 px-5 py-4 hover:bg-slate-50/70",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600",
								children: /* @__PURE__ */ jsx(KeyRound, { size: 18 })
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ jsx("p", {
											className: "font-semibold text-slate-800",
											children: role.name
										}),
										/* @__PURE__ */ jsx("code", {
											className: "rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500",
											children: role.code
										}),
										systemRoles.includes(role.code) && /* @__PURE__ */ jsx("span", {
											className: "rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600",
											children: "Role sistem"
										})
									]
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-slate-500",
									children: role.description || "Tanpa deskripsi"
								})]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => openEditor(role),
								className: "rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-emerald-600",
								children: /* @__PURE__ */ jsx(Pencil, { size: 16 })
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: systemRoles.includes(role.code),
								onClick: () => setDeleting(role),
								className: "rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:text-rose-600 disabled:opacity-30",
								children: /* @__PURE__ */ jsx(Trash2, { size: 16 })
							})
						]
					}, role.id))
				})]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: editing !== void 0,
				onOpenChange: (open) => !open && setEditing(void 0),
				children: /* @__PURE__ */ jsx(DialogContent, {
					className: "overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[480px]",
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						children: [
							/* @__PURE__ */ jsx(DialogHeader, {
								className: "border-b border-slate-100 px-6 py-5 text-left",
								children: /* @__PURE__ */ jsxs("div", {
									className: "flex items-start gap-3.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600",
										children: /* @__PURE__ */ jsx(KeyRound, { size: 18 })
									}), /* @__PURE__ */ jsxs("div", {
										className: "min-w-0 pr-6",
										children: [/* @__PURE__ */ jsx(DialogTitle, {
											className: "text-lg leading-6 text-slate-950",
											children: editing ? "Edit role" : "Tambah role baru"
										}), /* @__PURE__ */ jsx(DialogDescription, {
											className: "mt-1 text-sm leading-5 text-slate-500",
											children: "Atur identitas dan keterangan role pengguna."
										})]
									})]
								})
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-5 px-6 py-5",
								children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Nama role",
										error: form.errors.name,
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.name,
											onChange: (e) => form.setData("name", e.target.value),
											placeholder: "Contoh: Auditor Stok",
											autoFocus: true
										})
									}),
									/* @__PURE__ */ jsxs(Field, {
										label: "Kode role",
										error: form.errors.code,
										children: [/* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.code,
											onChange: (e) => form.setData("code", e.target.value.toLowerCase().replace(/\s+/g, "_")),
											placeholder: "auditor_stok"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] leading-4 text-slate-400",
											children: "Gunakan huruf kecil, angka, dan garis bawah."
										})]
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Deskripsi",
										error: form.errors.description,
										children: /* @__PURE__ */ jsx("textarea", {
											className: "min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-emerald-400",
											value: form.data.description,
											onChange: (e) => form.setData("description", e.target.value),
											placeholder: "Jelaskan fungsi dan cakupan role ini"
										})
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setEditing(void 0),
									className: "h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
									children: "Batal"
								}), /* @__PURE__ */ jsxs("button", {
									disabled: form.processing,
									className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50",
									children: [
										/* @__PURE__ */ jsx(Save, { size: 15 }),
										" ",
										form.processing ? "Menyimpan..." : "Simpan"
									]
								})]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: Boolean(deleting),
				onOpenChange: (open) => !open && setDeleting(null),
				onConfirm: remove,
				processing: form.processing,
				tone: "rose",
				title: "Hapus role?",
				description: `Role “${deleting?.name || ""}” dan relasi hak aksesnya akan dihapus.`,
				confirmLabel: "Ya, hapus"
			})
		]
	});
}
function Field({ label, error, children }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block space-y-1.5",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "text-xs font-semibold text-slate-700",
				children: label
			}),
			children,
			error && /* @__PURE__ */ jsx("span", {
				className: "block text-xs text-rose-600",
				children: error
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-CJE-p0OK.js.map