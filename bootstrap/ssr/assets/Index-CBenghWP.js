import { n as ConfirmActionDialog, t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { jsx, jsxs } from "react/jsx-runtime";
import { Pencil, Plus, Search, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";
//#region resources/js/pages/UserManagement/Index.tsx
var input = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
var roleTone = {
	superadmin: "bg-violet-50 text-violet-700",
	warehouse_admin_dry: "bg-amber-50 text-amber-700",
	warehouse_admin_wet: "bg-blue-50 text-blue-700",
	unit_manager: "bg-emerald-50 text-emerald-700",
	warehouse_manager: "bg-teal-50 text-teal-700",
	unit_user: "bg-slate-100 text-slate-700",
	finance: "bg-cyan-50 text-cyan-700"
};
function Index({ users, warehouses, roles, filters, roleCounts, totalUsers }) {
	const [editing, setEditing] = useState(null);
	const [deleting, setDeleting] = useState(null);
	const [search, setSearch] = useState(filters?.search || "");
	const [activeRole, setActiveRole] = useState(filters?.role || "");
	const initialSearch = useRef(true);
	const form = useForm({
		name: "",
		email: "",
		role: "unit_user",
		warehouse_id: "",
		password: "",
		password_confirmation: ""
	});
	useEffect(() => {
		if (initialSearch.current) {
			initialSearch.current = false;
			return;
		}
		const timeout = window.setTimeout(() => {
			router.get("/user-management", {
				search: search.trim() || void 0,
				role: activeRole || void 0
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true
			});
		}, 350);
		return () => window.clearTimeout(timeout);
	}, [search, activeRole]);
	const selectRole = (role) => {
		setActiveRole(role);
	};
	const reset = () => {
		setEditing(null);
		form.reset();
		form.clearErrors();
	};
	const edit = (user) => {
		setEditing(user);
		form.setData({
			name: user.name,
			email: user.email,
			role: user.role,
			warehouse_id: user.warehouse_id || "",
			password: "",
			password_confirmation: ""
		});
		window.scrollTo({
			top: 220,
			behavior: "smooth"
		});
	};
	const submit = (event) => {
		event.preventDefault();
		const options = {
			preserveScroll: true,
			onSuccess: () => {
				toast.success(editing ? "User berhasil diperbarui." : "User berhasil ditambahkan.");
				reset();
			},
			onError: (errors) => toast.error(Object.values(errors)[0])
		};
		if (editing) form.put(`/user-management/${editing.id}`, options);
		else form.post("/user-management", options);
	};
	const remove = () => deleting && form.delete(`/user-management/${deleting.id}`, {
		preserveScroll: true,
		onSuccess: () => {
			toast.success("User berhasil dihapus.");
			setDeleting(null);
		},
		onError: (errors) => toast.error(Object.values(errors)[0])
	});
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Manajemen User",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Manajemen User" }),
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
							children: "Kelola akses pengguna WMS"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 max-w-2xl text-sm text-slate-400",
							children: "Tambahkan akun, tentukan role dan gudang, atau perbarui akses pengguna dengan aman."
						})
					] }), /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-400",
							children: "Total pengguna"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xl font-semibold",
							children: totalUsers
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]",
				children: [/* @__PURE__ */ jsxs("section", {
					id: "user-form",
					className: "h-fit scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white shadow-sm",
					children: [/* @__PURE__ */ jsx("div", {
						className: "border-b border-slate-100 px-5 py-5",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600",
								children: editing ? /* @__PURE__ */ jsx(Pencil, { size: 18 }) : /* @__PURE__ */ jsx(Plus, { size: 18 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-semibold text-slate-950",
								children: editing ? "Edit pengguna" : "Tambah pengguna"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-slate-500",
								children: editing ? "Kosongkan password bila tidak diubah." : "Buat akun dan tentukan ruang lingkupnya."
							})] })]
						})
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						className: "space-y-4 p-5",
						children: [
							/* @__PURE__ */ jsxs("label", {
								className: "block space-y-1.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-slate-700",
									children: "Nama lengkap"
								}), /* @__PURE__ */ jsx("input", {
									className: input,
									value: form.data.name,
									onChange: (e) => form.setData("name", e.target.value),
									placeholder: "Nama pengguna"
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "block space-y-1.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-slate-700",
									children: "Email"
								}), /* @__PURE__ */ jsx("input", {
									type: "email",
									className: input,
									value: form.data.email,
									onChange: (e) => form.setData("email", e.target.value),
									placeholder: "user@wms.test"
								})]
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "block space-y-1.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-slate-700",
									children: "Role"
								}), /* @__PURE__ */ jsx("select", {
									className: input,
									value: form.data.role,
									onChange: (e) => form.setData({
										...form.data,
										role: e.target.value,
										warehouse_id: [
											"superadmin",
											"finance",
											"warehouse_manager"
										].includes(e.target.value) ? "" : form.data.warehouse_id
									}),
									children: roles.map((role) => /* @__PURE__ */ jsx("option", {
										value: role.value,
										children: role.label
									}, role.value))
								})]
							}),
							![
								"superadmin",
								"finance",
								"warehouse_manager"
							].includes(form.data.role) && /* @__PURE__ */ jsxs("label", {
								className: "block space-y-1.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs font-semibold text-slate-700",
									children: "Gudang / unit"
								}), /* @__PURE__ */ jsxs("select", {
									className: input,
									value: form.data.warehouse_id,
									onChange: (e) => form.setData("warehouse_id", e.target.value),
									children: [/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Pilih gudang atau unit"
									}), warehouses.map((warehouse) => /* @__PURE__ */ jsxs("option", {
										value: warehouse.id,
										children: [
											warehouse.name,
											" · ",
											warehouse.type
										]
									}, warehouse.id))]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-1",
								children: [/* @__PURE__ */ jsxs("label", {
									className: "block space-y-1.5",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-xs font-semibold text-slate-700",
										children: [
											"Password",
											" ",
											editing && /* @__PURE__ */ jsx("small", {
												className: "font-normal text-slate-400",
												children: "(opsional)"
											})
										]
									}), /* @__PURE__ */ jsx("input", {
										type: "password",
										className: input,
										value: form.data.password,
										onChange: (e) => form.setData("password", e.target.value),
										placeholder: "Minimal 8 karakter"
									})]
								}), /* @__PURE__ */ jsxs("label", {
									className: "block space-y-1.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-xs font-semibold text-slate-700",
										children: "Konfirmasi password"
									}), /* @__PURE__ */ jsx("input", {
										type: "password",
										className: input,
										value: form.data.password_confirmation,
										onChange: (e) => form.setData("password_confirmation", e.target.value),
										placeholder: "Ulangi password"
									})]
								})]
							}),
							Object.keys(form.errors).length > 0 && /* @__PURE__ */ jsx("div", {
								className: "rounded-xl bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-700",
								children: Object.values(form.errors).map((error, index) => /* @__PURE__ */ jsx("p", { children: error }, index))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsxs("button", {
									disabled: form.processing,
									className: "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-100 disabled:opacity-50",
									children: [
										editing ? /* @__PURE__ */ jsx(Pencil, { size: 16 }) : /* @__PURE__ */ jsx(Plus, { size: 16 }),
										" ",
										form.processing ? "Memproses..." : editing ? "Simpan perubahan" : "Tambah user"
									]
								}), editing && /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: reset,
									className: "rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600",
									children: "Batal"
								})]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("section", {
					className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-semibold text-slate-950",
								children: "Daftar pengguna"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-slate-500",
								children: "Role dan penempatan gudang seluruh akun."
							})] }), /* @__PURE__ */ jsx("div", {
								className: "flex flex-col gap-2 sm:flex-row",
								children: /* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ jsx(Search, {
											size: 16,
											className: "absolute left-3.5 top-3 text-slate-400"
										}),
										/* @__PURE__ */ jsx("input", {
											"aria-label": "Cari pengguna",
											className: `${input} pl-10 pr-10 sm:w-64`,
											value: search,
											onChange: (e) => {
												setSearch(e.target.value);
												setActiveRole("");
											},
											placeholder: "Cari pengguna..."
										}),
										search && /* @__PURE__ */ jsx("button", {
											type: "button",
											"aria-label": "Reset pencarian pengguna",
											title: "Reset pencarian",
											onClick: () => {
												setSearch("");
												setActiveRole("");
											},
											className: "absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
											children: /* @__PURE__ */ jsx(X, { size: 15 })
										})
									]
								})
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "border-b border-slate-100 bg-slate-50/60 px-5 py-3",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex gap-2 overflow-x-auto pb-1",
								children: [/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => selectRole(""),
									className: `inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${!activeRole ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"}`,
									children: ["Semua", /* @__PURE__ */ jsx("span", {
										className: `rounded-full px-1.5 py-0.5 text-[10px] ${!activeRole ? "bg-white/20" : "bg-slate-100"}`,
										children: Object.values(roleCounts || {}).reduce((total, count) => total + Number(count), 0)
									})]
								}), roles.map((role) => /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => selectRole(role.value),
									className: `inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${activeRole === role.value ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"}`,
									children: [role.label, /* @__PURE__ */ jsx("span", {
										className: `rounded-full px-1.5 py-0.5 text-[10px] ${activeRole === role.value ? "bg-white/20" : "bg-slate-100"}`,
										children: Number(roleCounts?.[role.value] || 0)
									})]
								}, role.value))]
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "border-b border-slate-100 px-5 py-3 text-xs text-slate-500",
							children: [
								"Menampilkan ",
								users.from || 0,
								"–",
								users.to || 0,
								" dari ",
								users.total,
								" ",
								"pengguna",
								search ? ` untuk pencarian “${filters.search}”` : "",
								"."
							]
						}),
						users.data.length ? /* @__PURE__ */ jsx("div", {
							className: "divide-y divide-slate-100",
							children: users.data.map((user) => /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600",
										children: user.name.slice(0, 2).toUpperCase()
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ jsx("p", {
											className: "truncate font-semibold text-slate-900",
											children: user.name
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-0.5 truncate text-xs text-slate-500",
											children: user.email
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "sm:text-right",
										children: [/* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleTone[user.role] || "bg-slate-100 text-slate-600"}`,
											children: user.role === "finance" ? "Keuangan" : user.role === "warehouse_manager" ? "Manajer Gudang Utama" : user.role.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-1.5 text-xs text-slate-400",
											children: user.warehouse?.name || "Akses seluruh gudang"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ jsx("button", {
											onClick: () => edit(user),
											className: "grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-200 hover:text-emerald-600",
											"aria-label": "Edit user",
											children: /* @__PURE__ */ jsx(Pencil, { size: 15 })
										}), /* @__PURE__ */ jsx("button", {
											onClick: () => setDeleting(user),
											className: "grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50",
											"aria-label": "Hapus user",
											children: /* @__PURE__ */ jsx(Trash2, { size: 15 })
										})]
									})
								]
							}, user.id))
						}) : /* @__PURE__ */ jsxs("div", {
							className: "py-16 text-center",
							children: [/* @__PURE__ */ jsx(UsersRound, { className: "mx-auto text-slate-300" }), /* @__PURE__ */ jsx("p", {
								className: "mt-3 text-sm text-slate-500",
								children: "Pengguna tidak ditemukan."
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4",
							children: users.links.map((link, index) => /* @__PURE__ */ jsx(Link, {
								href: link.url || "#",
								preserveState: true,
								preserveScroll: true,
								className: `rounded-lg px-3 py-1.5 text-xs font-semibold ${link.active ? "bg-emerald-500 text-white" : link.url ? "border border-slate-200 text-slate-600" : "text-slate-300"}`,
								dangerouslySetInnerHTML: { __html: link.label }
							}, index))
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: !!deleting,
				onOpenChange: (open) => !open && setDeleting(null),
				onConfirm: remove,
				processing: form.processing,
				tone: "rose",
				title: "Hapus pengguna ini?",
				description: `${deleting?.name || "Pengguna"} akan kehilangan akses ke WMS. User yang sudah memiliki riwayat transaksi tidak dapat dihapus.`,
				confirmLabel: "Ya, hapus user"
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-CBenghWP.js.map