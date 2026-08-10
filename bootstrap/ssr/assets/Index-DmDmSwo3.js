import { n as ConfirmActionDialog, t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { jsx, jsxs } from "react/jsx-runtime";
import { Building2, Droplets, Pencil, Plus, Search, Snowflake, Trash2, Warehouse, X } from "lucide-react";
//#region resources/js/pages/WarehouseManagement/Index.tsx
var input = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
var emptyForm = {
	code: "",
	name: "",
	type: "main",
	inventory_type: "dry",
	main_warehouse_id: "",
	is_active: true
};
function Index({ warehouses, mainWarehouses, filters, counts }) {
	const [editing, setEditing] = useState(null);
	const [deleting, setDeleting] = useState(null);
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
			router.get("/warehouse-management", {
				search: search.trim() || void 0,
				filter: activeFilter || void 0
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true
			});
		}, 350);
		return () => window.clearTimeout(timeout);
	}, [search, activeFilter]);
	const resetForm = () => {
		setEditing(null);
		form.setData(emptyForm);
		form.clearErrors();
	};
	const edit = (warehouse) => {
		setEditing(warehouse);
		form.setData({
			code: warehouse.code,
			name: warehouse.name,
			type: warehouse.type,
			inventory_type: warehouse.inventory_type || warehouse.main_warehouse?.inventory_type || "dry",
			main_warehouse_id: warehouse.main_warehouse_id || "",
			is_active: warehouse.is_active !== false
		});
		window.scrollTo({
			top: 180,
			behavior: "smooth"
		});
	};
	const submit = (event) => {
		event.preventDefault();
		const options = {
			preserveScroll: true,
			onSuccess: () => {
				toast.success(editing ? "Gudang berhasil diperbarui." : "Gudang berhasil ditambahkan.");
				resetForm();
			},
			onError: (errors) => toast.error(Object.values(errors)[0])
		};
		if (editing) form.put(`/warehouse-management/${editing.id}`, options);
		else form.post("/warehouse-management", options);
	};
	const tabs = [
		[
			"",
			"Semua",
			counts.all
		],
		[
			"main",
			"Gudang Utama",
			counts.main
		],
		[
			"unit",
			"Gudang Unit",
			counts.unit
		],
		[
			"dry",
			"Kering",
			counts.dry
		],
		[
			"wet",
			"Basah",
			counts.wet
		],
		[
			"inactive",
			"Nonaktif",
			counts.inactive
		]
	];
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Master Gudang",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Master Gudang" }),
			/* @__PURE__ */ jsxs("section", {
				className: "mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300",
						children: [/* @__PURE__ */ jsx(Warehouse, { size: 14 }), " Khusus Super Admin"]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-4 text-2xl font-semibold",
						children: "Kelola struktur gudang"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-2xl text-sm leading-6 text-slate-400",
						children: "Tentukan gudang utama kering/basah dan hubungkan setiap gudang unit ke sumber distribusinya."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "h-fit rounded-2xl border border-slate-200 bg-white shadow-sm",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "border-b border-slate-100 px-5 py-4",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "font-semibold text-slate-900",
							children: editing ? "Edit gudang" : "Tambah gudang"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-slate-500",
							children: "Kategori gudang menentukan cakupan item dan alur distribusi."
						})]
					}), /* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						className: "space-y-4 p-5",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Kode gudang",
								children: /* @__PURE__ */ jsx("input", {
									required: true,
									value: form.data.code,
									onChange: (e) => form.setData("code", e.target.value.toUpperCase()),
									className: input,
									placeholder: "Contoh: WH-DRY"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Nama gudang",
								children: /* @__PURE__ */ jsx("input", {
									required: true,
									value: form.data.name,
									onChange: (e) => form.setData("name", e.target.value),
									className: input,
									placeholder: "Nama gudang"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Jenis gudang",
								children: /* @__PURE__ */ jsxs("select", {
									value: form.data.type,
									onChange: (e) => form.setData({
										...form.data,
										type: e.target.value,
										main_warehouse_id: e.target.value === "main" ? "" : form.data.main_warehouse_id
									}),
									className: input,
									children: [/* @__PURE__ */ jsx("option", {
										value: "main",
										children: "Gudang Utama"
									}), /* @__PURE__ */ jsx("option", {
										value: "unit",
										children: "Gudang Unit"
									})]
								})
							}),
							form.data.type === "main" ? /* @__PURE__ */ jsx(Field, {
								label: "Kategori persediaan",
								children: /* @__PURE__ */ jsxs("select", {
									value: form.data.inventory_type,
									onChange: (e) => form.setData("inventory_type", e.target.value),
									className: input,
									children: [/* @__PURE__ */ jsx("option", {
										value: "dry",
										children: "Kering"
									}), /* @__PURE__ */ jsx("option", {
										value: "wet",
										children: "Basah"
									})]
								})
							}) : /* @__PURE__ */ jsx(Field, {
								label: "Gudang utama sumber",
								children: /* @__PURE__ */ jsxs("select", {
									required: true,
									value: form.data.main_warehouse_id,
									onChange: (e) => form.setData("main_warehouse_id", e.target.value),
									className: input,
									children: [/* @__PURE__ */ jsx("option", {
										value: "",
										children: "Pilih gudang utama"
									}), mainWarehouses.filter((main) => main.is_active || Number(main.id) === Number(form.data.main_warehouse_id)).map((main) => /* @__PURE__ */ jsxs("option", {
										value: main.id,
										children: [
											main.name,
											" ·",
											" ",
											main.inventory_type === "wet" ? "Basah" : "Kering"
										]
									}, main.id))]
								})
							}),
							/* @__PURE__ */ jsxs("label", {
								className: "flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700",
								children: [/* @__PURE__ */ jsx("input", {
									type: "checkbox",
									checked: form.data.is_active,
									onChange: (e) => form.setData("is_active", e.target.checked),
									className: "size-4 rounded border-slate-300 text-emerald-600"
								}), "Gudang aktif"]
							}),
							Object.keys(form.errors).length > 0 && /* @__PURE__ */ jsx("div", {
								className: "rounded-xl bg-rose-50 px-4 py-3 text-xs text-rose-700",
								children: Object.values(form.errors).map((error, index) => /* @__PURE__ */ jsx("p", { children: error }, index))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ jsxs("button", {
									disabled: form.processing,
									className: "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50",
									children: [
										editing ? /* @__PURE__ */ jsx(Pencil, { size: 16 }) : /* @__PURE__ */ jsx(Plus, { size: 16 }),
										" ",
										editing ? "Simpan perubahan" : "Tambah gudang"
									]
								}), editing && /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: resetForm,
									className: "rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600",
									children: "Batal"
								})]
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("section", {
					className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "border-b border-slate-100 p-5",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "font-semibold text-slate-900",
									children: "Daftar gudang"
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-1 text-xs text-slate-500",
									children: [warehouses.total, " gudang sesuai filter."]
								})] }), /* @__PURE__ */ jsxs("div", {
									className: "relative sm:w-72",
									children: [
										/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" }),
										/* @__PURE__ */ jsx("input", {
											"aria-label": "Cari gudang",
											value: search,
											onChange: (e) => setSearch(e.target.value),
											className: `${input} pl-10 pr-10`,
											placeholder: "Cari kode atau nama..."
										}),
										search && /* @__PURE__ */ jsx("button", {
											type: "button",
											"aria-label": "Reset pencarian gudang",
											onClick: () => setSearch(""),
											className: "absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100",
											children: /* @__PURE__ */ jsx(X, { size: 15 })
										})
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "mt-4 flex gap-2 overflow-x-auto pb-1",
								children: tabs.map(([value, label, count]) => /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setActiveFilter(value),
									className: `inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${activeFilter === value ? "bg-emerald-600 text-white" : "border border-slate-200 text-slate-600"}`,
									children: [label, /* @__PURE__ */ jsx("span", {
										className: "opacity-70",
										children: count
									})]
								}, value || "all"))
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "divide-y divide-slate-100",
							children: warehouses.data.length ? warehouses.data.map((warehouse) => {
								const inventoryType = warehouse.inventory_type || warehouse.main_warehouse?.inventory_type;
								const Icon = warehouse.type === "unit" ? Building2 : inventoryType === "wet" ? Droplets : Snowflake;
								return /* @__PURE__ */ jsxs("div", {
									className: "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: `grid size-10 shrink-0 place-items-center rounded-xl ${inventoryType === "wet" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`,
											children: /* @__PURE__ */ jsx(Icon, { size: 18 })
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ jsx("p", {
												className: "font-semibold text-slate-900",
												children: warehouse.name
											}), /* @__PURE__ */ jsxs("p", {
												className: "mt-1 text-xs text-slate-500",
												children: [
													warehouse.code,
													" ·",
													" ",
													warehouse.type === "main" ? "Gudang Utama" : `Unit dari ${warehouse.main_warehouse?.name || "-"}`
												]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${inventoryType === "wet" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`,
													children: inventoryType === "wet" ? "Basah" : "Kering"
												}),
												/* @__PURE__ */ jsx("span", { className: `size-2 rounded-full ${warehouse.is_active ? "bg-emerald-500" : "bg-slate-300"}` }),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => edit(warehouse),
													className: "grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500",
													children: /* @__PURE__ */ jsx(Pencil, { size: 15 })
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													onClick: () => setDeleting(warehouse),
													className: "grid size-9 place-items-center rounded-lg border border-rose-100 text-rose-500",
													children: /* @__PURE__ */ jsx(Trash2, { size: 15 })
												})
											]
										})
									]
								}, warehouse.id);
							}) : /* @__PURE__ */ jsx("div", {
								className: "px-5 py-14 text-center text-sm text-slate-400",
								children: "Gudang tidak ditemukan."
							})
						}),
						warehouses.last_page > 1 && /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-1.5 border-t border-slate-100 px-5 py-4",
							children: warehouses.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(Link, {
								href: link.url,
								preserveState: true,
								preserveScroll: true,
								className: `rounded-lg border px-3 py-1.5 text-xs font-semibold ${link.active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600"}`,
								dangerouslySetInnerHTML: { __html: link.label }
							}, index) : /* @__PURE__ */ jsx("span", {
								className: "rounded-lg px-3 py-1.5 text-xs text-slate-300",
								dangerouslySetInnerHTML: { __html: link.label }
							}, index))
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: !!deleting,
				onOpenChange: (open) => !open && setDeleting(null),
				onConfirm: () => deleting && form.delete(`/warehouse-management/${deleting.id}`, {
					preserveScroll: true,
					onSuccess: () => {
						toast.success("Gudang berhasil dihapus.");
						setDeleting(null);
					},
					onError: (errors) => toast.error(Object.values(errors)[0])
				}),
				processing: form.processing,
				tone: "rose",
				title: "Hapus gudang ini?",
				description: `${deleting?.name || "Gudang"} hanya dapat dihapus jika belum pernah digunakan.`,
				confirmLabel: "Ya, hapus gudang"
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block space-y-1.5",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-xs font-semibold text-slate-700",
			children: label
		}), children]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DmDmSwo3.js.map