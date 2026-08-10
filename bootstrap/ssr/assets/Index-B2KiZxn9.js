import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, Boxes, Check, ChevronDown, ClipboardList, Download, FileSpreadsheet, PackageCheck, Pencil, Plus, RotateCcw, Search, ShieldCheck, Upload, X } from "lucide-react";
//#region resources/js/pages/Operations/Index.tsx
var titles = {
	"master-data": "Master Data",
	purchasing: "Purchasing & Goods Receipt",
	fulfillment: "Request Stok ke Gudang Kering/Basah",
	"inventory-control": "Inventory Control"
};
var masterTitles = {
	supplier: "Master Supplier",
	item: "Master Item",
	location: "Master Lokasi",
	uom: "Master Satuan"
};
var badge = (status = "") => status.includes("approved") || status.includes("posted") || status.includes("received") ? "bg-emerald-50 text-emerald-700" : status.includes("reject") ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
var statusText = (status = "") => ({
	draft: "Draf",
	waiting_approval: "Menunggu persetujuan",
	approved: "Disetujui",
	posted: "Diposting",
	delivering: "Sedang dikirim",
	received: "Sudah diterima",
	rejected: "Ditolak",
	cancelled: "Dibatalkan"
})[status] || status.replaceAll("_", " ");
var formatFileSize = (bytes) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
function Field({ label, children }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "space-y-1.5 text-sm font-medium text-slate-700",
		children: [/* @__PURE__ */ jsx("span", { children: label }), children]
	});
}
var input = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
function Select({ value, onChange, children, placeholder = "Pilih data" }) {
	return /* @__PURE__ */ jsxs("select", {
		className: input,
		value,
		onChange,
		children: [/* @__PURE__ */ jsx("option", {
			value: "",
			children: placeholder
		}), children]
	});
}
function SearchableSelect({ value, onChange, options, placeholder = "Cari dan pilih data" }) {
	const selected = options.find((option) => String(option.value) === String(value));
	const [query, setQuery] = useState(selected?.label || "");
	const [open, setOpen] = useState(false);
	useEffect(() => {
		setQuery(selected?.label || "");
	}, [value, selected?.label]);
	const filtered = options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 50);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		onBlur: (event) => {
			if (!event.currentTarget.contains(event.relatedTarget)) {
				setOpen(false);
				setQuery(selected?.label || "");
			}
		},
		children: [
			/* @__PURE__ */ jsx(Search, {
				size: 16,
				className: "pointer-events-none absolute left-3.5 top-3.5 z-10 text-slate-400"
			}),
			/* @__PURE__ */ jsx("input", {
				value: query,
				placeholder,
				autoComplete: "off",
				className: `${input} pl-10 pr-9`,
				onFocus: (event) => {
					setOpen(true);
					event.currentTarget.select();
				},
				onChange: (event) => {
					setQuery(event.target.value);
					setOpen(true);
					if (!event.target.value) onChange("");
				}
			}),
			/* @__PURE__ */ jsx(ChevronDown, {
				size: 16,
				className: `pointer-events-none absolute right-3.5 top-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`
			}),
			open && /* @__PURE__ */ jsx("div", {
				className: "absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl",
				children: filtered.length ? filtered.map((option) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onMouseDown: (event) => event.preventDefault(),
					onClick: () => {
						onChange(String(option.value));
						setQuery(option.label);
						setOpen(false);
					},
					className: `flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${String(option.value) === String(value) ? "bg-emerald-50 font-semibold text-emerald-700" : "text-slate-700"}`,
					children: [/* @__PURE__ */ jsx("span", { children: option.label }), String(option.value) === String(value) && /* @__PURE__ */ jsx(Check, { size: 15 })]
				}, option.value)) : /* @__PURE__ */ jsx("p", {
					className: "px-3 py-6 text-center text-xs text-slate-500",
					children: "Barang tidak ditemukan."
				})
			})
		]
	});
}
function Card({ title, description, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-slate-200/80 bg-white shadow-sm",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "border-b border-slate-100 px-5 py-4",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "font-semibold text-slate-950",
				children: title
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-slate-500",
				children: description
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "p-5",
			children
		})]
	});
}
function Operations({ module, items, warehouses, suppliers, uoms, locations, managers, records, pendingApprovals, approvalHistory, fulfillmentAccess, requestStockItems, initialMaster, valuationMethod, initialItemWarehouse, initialItemSearch }) {
	const [kind, setKind] = useState(module === "purchasing" ? "purchase-order" : module === "fulfillment" ? "request" : module === "master-data" ? initialMaster || "supplier" : "adjustment");
	const [editing, setEditing] = useState(null);
	const [importFile, setImportFile] = useState(null);
	const importFileInput = useRef(null);
	const [importing, setImporting] = useState(false);
	const form = useForm({
		code: "",
		name: "",
		phone: "",
		address: "",
		type: module === "fulfillment" ? "transfer" : module === "inventory-control" ? "correction" : "base",
		supplier_id: "",
		warehouse_id: module === "inventory-control" && !fulfillmentAccess?.isSuperadmin ? fulfillmentAccess?.warehouseId || "" : "",
		from_warehouse_id: "",
		to_warehouse_id: "",
		purchase_order_id: "",
		stock_request_id: "",
		delivery_id: "",
		item_id: "",
		uom_id: "",
		qty: 1,
		unit_price: 0,
		approver_id: "",
		expected_date: "",
		batch_no: "",
		expired_at: "",
		location_id: "",
		reason: "",
		notes: "",
		details: [{
			item_id: "",
			uom_id: "",
			qty: 1,
			unit_price: "",
			batch_no: "",
			location_id: ""
		}],
		base_uom: "PCS",
		warehouse_type: "dry",
		min_stock: 0,
		issue_method: "fifo",
		has_batch: true,
		has_expired: false,
		is_active: true
	});
	const endpoint = {
		supplier: "/operations/master-data/suppliers",
		uom: "/operations/master-data/uoms",
		location: "/operations/master-data/locations",
		item: "/operations/master-data/items",
		"purchase-order": "/operations/purchasing/purchase-orders",
		grn: "/operations/purchasing/goods-receipts",
		request: "/operations/fulfillment/requests",
		delivery: "/operations/fulfillment/deliveries",
		receipt: "/operations/fulfillment/receipts",
		adjustment: "/operations/inventory-control/adjustments",
		opname: "/operations/inventory-control/opnames"
	};
	const availableRequestItems = (requestStockItems || []).filter((stock) => Number(stock.warehouse_id) === Number(form.data.from_warehouse_id));
	const selectedManager = managers.find((manager) => Number(manager.warehouse_id) === Number(form.data.warehouse_id));
	const cancelEdit = () => {
		setEditing(null);
		form.reset();
	};
	const startEdit = (type, row) => {
		setKind(type);
		setEditing({
			type,
			id: row.id
		});
		form.clearErrors();
		form.setData({
			...form.data,
			...row,
			warehouse_id: row.warehouse_id || "",
			is_active: row.is_active !== false,
			has_batch: !!row.has_batch,
			has_expired: !!row.has_expired
		});
		window.scrollTo({
			top: 250,
			behavior: "smooth"
		});
	};
	const submit = (e) => {
		e.preventDefault();
		const options = {
			preserveScroll: true,
			onSuccess: () => {
				toast.success(editing ? "Master data berhasil diperbarui." : "Dokumen berhasil diproses.");
				cancelEdit();
			},
			onError: (errors) => toast.error(Object.values(errors)[0])
		};
		if (editing) form.put(`${endpoint[editing.type]}/${editing.id}`, options);
		else form.post(endpoint[kind], options);
	};
	const importItems = () => {
		if (!importFile) {
			toast.error("Pilih file Excel atau CSV terlebih dahulu.");
			return;
		}
		setImporting(true);
		router.post("/operations/master-data/items/import", { file: importFile }, {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => {
				toast.success("Data item berhasil diimpor.");
				setImportFile(null);
				if (importFileInput.current) importFileInput.current.value = "";
			},
			onError: (errors) => toast.error(Object.values(errors)[0] || "Impor gagal."),
			onFinish: () => setImporting(false)
		});
	};
	const tabs = module === "master-data" ? [
		["supplier", "Supplier"],
		["uom", "Satuan"],
		["location", "Lokasi"],
		["item", "Item"]
	] : module === "purchasing" ? [["purchase-order", "Purchase Order"], ["grn", "Goods Receipt"]] : module === "fulfillment" ? [["request", "Request stok"]] : [["adjustment", "Adjustment"], ["opname", "Stock Opname"]];
	const orders = records?.orders || [];
	const requests = records?.requests || [];
	const deliveries = records?.deliveries || [];
	const pageTitle = module === "master-data" ? masterTitles[kind] || titles[module] : titles[module];
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: pageTitle,
		children: [
			/* @__PURE__ */ jsx(Head, { title: pageTitle }),
			/* @__PURE__ */ jsxs("section", {
				className: "mb-6 flex flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:flex-row sm:items-center sm:px-8",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-300",
						children: [
							/* @__PURE__ */ jsx(Boxes, { size: 14 }),
							" ",
							module === "fulfillment" ? "Permintaan persediaan unit" : "Alur WMS terintegrasi"
						]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-4 text-2xl font-semibold",
						children: pageTitle
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-2xl text-sm text-slate-400",
						children: module === "fulfillment" ? "Pilih gudang tujuan, tambahkan barang yang dibutuhkan, lalu kirim permintaan untuk disetujui." : "Setiap dokumen tersambung ke approval, saldo stok, reservasi, HPP dan ledger audit."
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "min-w-56 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3.5",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-xs text-slate-400",
						children: "Perlu tindakan Anda"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm font-medium text-white",
						children: pendingApprovals.length > 0 ? `${pendingApprovals.length} permintaan menunggu persetujuan` : "Tidak ada permintaan tertunda"
					})]
				})]
			}),
			module === "fulfillment" && fulfillmentAccess.canRequest && /* @__PURE__ */ jsx("section", {
				className: "mb-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3",
				children: [
					[
						"1",
						"Pilih gudang",
						"Tentukan gudang kering atau basah."
					],
					[
						"2",
						"Isi kebutuhan",
						"Pilih barang, satuan, dan jumlah."
					],
					[
						"3",
						"Kirim permintaan",
						"Pantau persetujuan pada riwayat."
					]
				].map(([number, label, description], index) => /* @__PURE__ */ jsxs("div", {
					className: `flex gap-3 px-5 py-4 ${index > 0 ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700",
						children: number
					}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-semibold text-slate-800",
						children: label
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-0.5 text-xs leading-5 text-slate-500",
						children: description
					})] })]
				}, number))
			}),
			pendingApprovals.length > 0 && /* @__PURE__ */ jsx(Card, {
				title: "Approval aktif",
				description: "Tahap approval yang saat ini menjadi tanggung jawab Anda.",
				children: /* @__PURE__ */ jsx("div", {
					className: "grid gap-3 md:grid-cols-2",
					children: pendingApprovals.map((approval) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-xs font-semibold uppercase tracking-wider text-emerald-600",
								children: approval.module.replaceAll("_", " ")
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 font-semibold",
								children: approval.transaction_no
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-slate-500",
								children: approval.steps?.find((step) => Number(step.level) === Number(approval.current_level))?.stage_label || "Menunggu persetujuan Anda"
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => {
									const remarks = window.prompt("Tuliskan alasan penolakan (minimal 5 karakter):");
									if (remarks === null) return;
									router.post(`/workflow-approvals/${approval.id}`, {
										action: "rejected",
										remarks
									}, { preserveScroll: true });
								},
								title: "Tolak permintaan",
								className: "inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600",
								children: [/* @__PURE__ */ jsx(X, { size: 15 }), " Tolak"]
							}), /* @__PURE__ */ jsxs("button", {
								onClick: () => router.post(`/workflow-approvals/${approval.id}`, { action: "approved" }, { preserveScroll: true }),
								title: "Setujui permintaan",
								className: "inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white",
								children: [/* @__PURE__ */ jsx(Check, { size: 15 }), " Setujui"]
							})]
						})]
					}, approval.id))
				})
			}),
			module === "fulfillment" && approvalHistory.length > 0 && /* @__PURE__ */ jsx(Card, {
				title: "Riwayat Approval Saya",
				description: "Keputusan dan pengajuan yang pernah diproses oleh akun Anda.",
				children: /* @__PURE__ */ jsx("div", {
					className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
					children: approvalHistory.flatMap((approval) => approval.steps.map((step) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-slate-200 bg-slate-50/50 p-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("p", {
										className: "truncate text-sm font-semibold text-slate-900",
										children: approval.transaction_no
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1 text-xs text-slate-500",
										children: step.stage_label || `Approval tahap ${step.level}`
									})]
								}), /* @__PURE__ */ jsx("span", {
									className: `shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge(step.status)}`,
									children: step.status === "approved" ? "Disetujui" : step.status === "rejected" ? "Ditolak" : step.status
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-3 text-[11px] text-slate-500",
								children: [step.actor?.name, step.acted_at && ` · ${new Date(step.acted_at).toLocaleString("id-ID")}`]
							}),
							step.remarks && /* @__PURE__ */ jsxs("p", {
								className: "mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-slate-600",
								children: [
									"“",
									step.remarks,
									"”"
								]
							})
						]
					}, `${approval.id}-${step.id}`)))
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]",
				children: [module !== "fulfillment" || fulfillmentAccess.canRequest ? /* @__PURE__ */ jsxs(Card, {
					title: editing ? `Edit ${tabs.find(([id]) => id === kind)?.[1]}` : module === "fulfillment" ? "Buat permintaan stok" : "Buat dokumen",
					description: editing ? "Perbarui data lalu simpan perubahan." : module === "fulfillment" ? "Lengkapi kebutuhan unit Anda. Kolom bertanda wajib harus diisi." : "Pilih proses, lengkapi data, lalu ajukan.",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: `mb-5 flex flex-wrap gap-2 ${["fulfillment", "master-data"].includes(module) ? "hidden" : ""}`,
							children: tabs.map(([id, label]) => /* @__PURE__ */ jsx("button", {
								onClick: () => {
									setKind(id);
									cancelEdit();
								},
								className: `rounded-xl px-3.5 py-2 text-sm font-semibold ${kind === id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`,
								children: label
							}, id))
						}),
						module === "inventory-control" && /* @__PURE__ */ jsx("div", {
							className: "mb-5 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-4",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-sm",
									children: /* @__PURE__ */ jsx(ShieldCheck, { size: 20 })
								}), /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("p", {
										className: "text-sm font-semibold text-slate-800",
										children: "Alur persetujuan gudang"
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200",
												children: "Admin membuat dokumen"
											}),
											/* @__PURE__ */ jsx(ArrowRight, {
												size: 14,
												className: "text-emerald-500"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200",
												children: "Manajer gudang meninjau"
											}),
											/* @__PURE__ */ jsx(ArrowRight, {
												size: 14,
												className: "text-emerald-500"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "rounded-lg bg-white px-2.5 py-1.5 ring-1 ring-slate-200",
												children: "Stok diperbarui"
											})
										]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-2 text-xs leading-5 text-slate-500",
										children: "Perubahan saldo baru diposting setelah manajer gudang terkait menyetujui dokumen."
									})
								] })]
							})
						}),
						module === "master-data" && kind === "item" && !editing && /* @__PURE__ */ jsxs("div", {
							className: "mb-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-sm font-semibold text-slate-800",
									children: "Impor beberapa item sekaligus"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-xs leading-5 text-slate-500",
									children: "Gunakan template Excel. Kolom satuan dapat dipilih dari master satuan aktif."
								})] }), /* @__PURE__ */ jsxs("a", {
									href: "/operations/master-data/items/import-template",
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 whitespace-nowrap",
									children: [/* @__PURE__ */ jsx(Download, { size: 15 }), " Unduh template"]
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center",
								children: [
									/* @__PURE__ */ jsx("input", {
										id: "item-import-file",
										ref: importFileInput,
										type: "file",
										accept: ".csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
										onChange: (event) => setImportFile(event.target.files?.[0] || null),
										className: "sr-only"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "min-w-0 flex-1",
										children: importFile ? /* @__PURE__ */ jsxs("div", {
											className: "flex min-h-12 items-center gap-3 rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 shadow-sm shadow-emerald-950/[0.03]",
											children: [
												/* @__PURE__ */ jsx(FileSpreadsheet, {
													size: 20,
													className: "shrink-0 text-emerald-600"
												}),
												/* @__PURE__ */ jsxs("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ jsx("p", {
														className: "truncate text-xs font-semibold text-slate-700",
														title: importFile.name,
														children: importFile.name
													}), /* @__PURE__ */ jsx("p", {
														className: "mt-0.5 text-[11px] text-slate-500",
														children: formatFileSize(importFile.size)
													})]
												}),
												/* @__PURE__ */ jsx("label", {
													htmlFor: "item-import-file",
													className: "cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50",
													children: "Ganti"
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													"aria-label": "Hapus file terpilih",
													onClick: () => {
														setImportFile(null);
														if (importFileInput.current) importFileInput.current.value = "";
													},
													className: "rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600",
													children: /* @__PURE__ */ jsx(X, { size: 15 })
												})
											]
										}) : /* @__PURE__ */ jsxs("label", {
											htmlFor: "item-import-file",
											className: "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50/30",
											children: [/* @__PURE__ */ jsx("span", {
												className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500",
												children: /* @__PURE__ */ jsx(FileSpreadsheet, { size: 17 })
											}), /* @__PURE__ */ jsxs("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ jsx("span", {
													className: "block text-xs font-semibold text-slate-700",
													children: "Pilih file untuk diimpor"
												}), /* @__PURE__ */ jsx("span", {
													className: "mt-0.5 block text-[11px] text-slate-500",
													children: "Format XLSX atau CSV, maksimal 2 MB"
												})]
											})]
										})
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										disabled: !importFile || importing,
										onClick: importItems,
										className: "inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:w-auto",
										children: [
											/* @__PURE__ */ jsx(Upload, {
												size: 15,
												className: importing ? "animate-pulse" : ""
											}),
											" ",
											importing ? "Mengimpor..." : "Impor item"
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								kind === "supplier" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Kode supplier",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.code,
											onChange: (e) => form.setData("code", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Nama supplier",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.name,
											onChange: (e) => form.setData("name", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Telepon",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.phone,
											onChange: (e) => form.setData("phone", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Alamat",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.address,
											onChange: (e) => form.setData("address", e.target.value)
										})
									})
								] }),
								kind === "uom" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Kode satuan",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.code,
											onChange: (e) => form.setData("code", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Nama satuan",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.name,
											onChange: (e) => form.setData("name", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Tipe",
										children: /* @__PURE__ */ jsxs(Select, {
											value: form.data.type,
											onChange: (e) => form.setData("type", e.target.value),
											children: [/* @__PURE__ */ jsx("option", {
												value: "base",
												children: "Base"
											}), /* @__PURE__ */ jsx("option", {
												value: "small",
												children: "Small"
											})]
										})
									})
								] }),
								kind === "location" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Gudang",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.warehouse_id,
											onChange: (e) => form.setData("warehouse_id", e.target.value),
											children: warehouses.map((x) => /* @__PURE__ */ jsx("option", {
												value: x.id,
												children: x.name
											}, x.id))
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Kode lokasi",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.code,
											onChange: (e) => form.setData("code", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Nama lokasi",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.name,
											onChange: (e) => form.setData("name", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Tipe",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.type,
											onChange: (e) => form.setData("type", e.target.value),
											children: [
												"zone",
												"rack",
												"bin"
											].map((x) => /* @__PURE__ */ jsx("option", { children: x }, x))
										})
									})
								] }),
								kind === "item" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Kode item",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.code,
											onChange: (e) => form.setData("code", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Nama item",
										children: /* @__PURE__ */ jsx("input", {
											className: input,
											value: form.data.name,
											onChange: (e) => form.setData("name", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Satuan dasar",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.base_uom,
											onChange: (e) => form.setData("base_uom", e.target.value),
											children: uoms.filter((uom) => uom.is_active !== false).map((uom) => /* @__PURE__ */ jsxs("option", {
												value: uom.code,
												children: [
													uom.code,
													" — ",
													uom.name
												]
											}, uom.id))
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Jenis gudang",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.warehouse_type,
											onChange: (e) => form.setData("warehouse_type", e.target.value),
											children: [
												"dry",
												"wet",
												"both"
											].map((x) => /* @__PURE__ */ jsx("option", { children: x }, x))
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Minimum stok",
										children: /* @__PURE__ */ jsx("input", {
											type: "number",
											step: ".001",
											className: input,
											value: form.data.min_stock,
											onChange: (e) => form.setData("min_stock", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Metode pengeluaran",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.issue_method,
											onChange: (e) => form.setData("issue_method", e.target.value),
											children: [
												"manual",
												"fifo",
												"fefo"
											].map((x) => /* @__PURE__ */ jsx("option", { children: x.toUpperCase() }, x))
										})
									}),
									/* @__PURE__ */ jsx("div", {
										className: "flex flex-wrap items-end gap-4 pb-2 text-sm text-slate-600",
										children: [
											["has_batch", "Kelola batch"],
											["has_expired", "Kelola kedaluwarsa"],
											["is_active", "Aktif"]
										].map(([key, label]) => /* @__PURE__ */ jsxs("label", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ jsx("input", {
												type: "checkbox",
												checked: !!form.data[key],
												onChange: (e) => form.setData(key, e.target.checked),
												className: "size-4 rounded border-slate-300 text-emerald-500"
											}), label]
										}, key))
									})
								] }),
								![
									"supplier",
									"uom",
									"location",
									"item",
									"delivery",
									"receipt",
									"request",
									"adjustment",
									"opname"
								].includes(kind) && /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Item",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.item_id,
											onChange: (e) => form.setData("item_id", e.target.value),
											children: items.map((x) => /* @__PURE__ */ jsxs("option", {
												value: x.id,
												children: [
													x.code,
													" — ",
													x.name
												]
											}, x.id))
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Satuan",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.uom_id,
											onChange: (e) => form.setData("uom_id", e.target.value),
											children: uoms.map((x) => /* @__PURE__ */ jsx("option", {
												value: x.id,
												children: x.name
											}, x.id))
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: kind === "opname" ? "Hasil hitung fisik" : "Kuantitas (+ masuk / - keluar)",
										children: /* @__PURE__ */ jsx("input", {
											type: "number",
											step: ".001",
											className: input,
											value: form.data.qty,
											onChange: (e) => form.setData("qty", e.target.value)
										})
									}),
									kind !== "opname" && /* @__PURE__ */ jsx(Field, {
										label: "HPP / unit",
										children: /* @__PURE__ */ jsx("input", {
											type: "number",
											className: input,
											value: form.data.unit_price,
											onChange: (e) => form.setData("unit_price", e.target.value)
										})
									})
								] }),
								["purchase-order", "grn"].includes(kind) && /* @__PURE__ */ jsx(Field, {
									label: "Supplier",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.supplier_id,
										onChange: (e) => form.setData("supplier_id", e.target.value),
										children: suppliers.map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.name
										}, x.id))
									})
								}),
								kind === "grn" && /* @__PURE__ */ jsx(Field, {
									label: "Purchase Order (opsional)",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.purchase_order_id,
										onChange: (e) => form.setData("purchase_order_id", e.target.value),
										children: orders.filter((x) => x.status === "approved").map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.number
										}, x.id))
									})
								}),
								[
									"purchase-order",
									"grn",
									"adjustment",
									"opname"
								].includes(kind) && /* @__PURE__ */ jsx(Field, {
									label: "Gudang",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.warehouse_id,
										onChange: (e) => {
											form.setData({
												...form.data,
												warehouse_id: e.target.value,
												...["adjustment", "opname"].includes(kind) ? { details: form.data.details.map((row) => ({
													...row,
													item_id: "",
													uom_id: ""
												})) } : {}
											});
										},
										children: warehouses.map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.name
										}, x.id))
									})
								}),
								kind === "request" && /* @__PURE__ */ jsxs("div", {
									className: "sm:col-span-2",
									children: [/* @__PURE__ */ jsx(Field, {
										label: "Gudang yang dituju *",
										children: /* @__PURE__ */ jsx(Select, {
											value: form.data.from_warehouse_id,
											placeholder: "Pilih gudang kering atau basah",
											onChange: (e) => form.setData({
												...form.data,
												from_warehouse_id: e.target.value,
												details: form.data.details.map((detail) => ({
													...detail,
													item_id: "",
													uom_id: ""
												}))
											}),
											children: warehouses.filter((x) => x.type === "main").map((x) => /* @__PURE__ */ jsx("option", {
												value: x.id,
												children: x.name
											}, x.id))
										})
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1.5 text-xs text-slate-500",
										children: "Pilih sesuai jenis barang yang akan diminta."
									})]
								}),
								["adjustment", "opname"].includes(kind) && /* @__PURE__ */ jsxs("div", {
									className: "space-y-3 sm:col-span-2",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600",
											children: [
												"Metode valuasi aktif: ",
												" ",
												/* @__PURE__ */ jsx("span", {
													className: "font-semibold text-slate-800",
													children: valuationMethod === "fifo" ? "FIFO" : "Moving Average"
												}),
												". ",
												kind === "opname" ? "Selisih kurang memakai biaya aktual saat approval; surplus memakai biaya stok aktif yang disimpan sebagai snapshot." : "Pengurangan memakai biaya aktual otomatis; penambahan memerlukan biaya unit."
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "text-sm font-semibold text-slate-800",
												children: kind === "opname" ? "Hasil hitung fisik" : "Detail adjustment"
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-0.5 text-xs text-slate-500",
												children: "Tambahkan beberapa item dalam satu dokumen dan satu proses approval."
											})] }), /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => form.setData("details", [...form.data.details, {
													item_id: "",
													uom_id: "",
													qty: kind === "opname" ? 0 : 1,
													unit_price: "",
													batch_no: "",
													location_id: ""
												}]),
												className: "inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
												children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " Tambah item"]
											})]
										}),
										form.data.details.map((detail, index) => {
											const warehouseItemIds = new Set((records?.stocks || []).filter((stock) => Number(stock.warehouse_id) === Number(form.data.warehouse_id) && Number(stock.qty_on_hand) > 0).map((stock) => Number(stock.item_id)));
											const availableInventoryItems = items.filter((item) => warehouseItemIds.has(Number(item.id)));
											const availableUoms = items.find((item) => Number(item.id) === Number(detail.item_id))?.item_uoms || [];
											const baseUom = availableUoms.find((itemUom) => itemUom.is_base);
											const updateDetail = (key, value) => form.setData("details", form.data.details.map((row, i) => i === index ? {
												...row,
												[key]: value
											} : row));
											return /* @__PURE__ */ jsxs("div", {
												className: "rounded-xl border border-slate-200 bg-slate-50/60 p-4",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "mb-3 flex items-center justify-between",
													children: [/* @__PURE__ */ jsxs("p", {
														className: "text-xs font-bold uppercase tracking-[.12em] text-slate-500",
														children: ["Item ", index + 1]
													}), /* @__PURE__ */ jsx("button", {
														type: "button",
														disabled: form.data.details.length === 1,
														onClick: () => form.setData("details", form.data.details.filter((_, i) => i !== index)),
														className: "grid size-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30",
														children: /* @__PURE__ */ jsx(X, { size: 15 })
													})]
												}), /* @__PURE__ */ jsxs("div", {
													className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
													children: [
														/* @__PURE__ */ jsx(Field, {
															label: "Item",
															children: /* @__PURE__ */ jsx(SearchableSelect, {
																value: detail.item_id,
																placeholder: form.data.warehouse_id ? "Cari item pada gudang ini" : "Pilih gudang terlebih dahulu",
																options: availableInventoryItems.map((item) => ({
																	value: item.id,
																	label: `${item.code} — ${item.name}`
																})),
																onChange: (itemId) => {
																	const itemBaseUom = items.find((candidate) => Number(candidate.id) === Number(itemId))?.item_uoms?.find((itemUom) => itemUom.is_base);
																	form.setData("details", form.data.details.map((row, i) => i === index ? {
																		...row,
																		item_id: itemId,
																		uom_id: itemBaseUom?.uom_id || ""
																	} : row));
																}
															})
														}),
														/* @__PURE__ */ jsx(Field, {
															label: "Satuan",
															children: /* @__PURE__ */ jsx(Select, {
																value: detail.uom_id,
																placeholder: detail.item_id ? "Pilih satuan item" : "Pilih item dahulu",
																onChange: (e) => updateDetail("uom_id", e.target.value),
																children: availableUoms.map((itemUom) => /* @__PURE__ */ jsxs("option", {
																	value: itemUom.uom_id,
																	children: [itemUom.uom?.name, itemUom.is_base ? " (dasar)" : ` (1 = ${Number(itemUom.conversion_factor).toLocaleString("id-ID")} ${baseUom?.uom?.code || "satuan dasar"})`]
																}, itemUom.uom_id))
															})
														}),
														/* @__PURE__ */ jsx(Field, {
															label: kind === "opname" ? "Jumlah hasil hitung" : "Qty adjustment (+ / -)",
															children: /* @__PURE__ */ jsx("input", {
																type: "number",
																min: kind === "opname" ? 0 : void 0,
																step: "0.001",
																className: input,
																value: detail.qty,
																onChange: (e) => updateDetail("qty", e.target.value)
															})
														}),
														kind === "adjustment" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
															Number(detail.qty) > 0 ? /* @__PURE__ */ jsx(Field, {
																label: `Biaya / ${baseUom?.uom?.code || "satuan dasar"}`,
																children: /* @__PURE__ */ jsx("input", {
																	type: "number",
																	min: "0.01",
																	step: "0.01",
																	required: true,
																	className: input,
																	value: detail.unit_price ?? "",
																	onChange: (e) => updateDetail("unit_price", e.target.value),
																	placeholder: "Wajib untuk qty positif"
																})
															}) : /* @__PURE__ */ jsxs("div", {
																className: "flex items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs leading-5 text-slate-500",
																children: [
																	"Biaya pengurangan dihitung otomatis sesuai ",
																	valuationMethod === "fifo" ? "layer FIFO" : "Moving Average",
																	"."
																]
															}),
															/* @__PURE__ */ jsx(Field, {
																label: "Nomor batch",
																children: /* @__PURE__ */ jsx("input", {
																	className: input,
																	value: detail.batch_no ?? "",
																	onChange: (e) => updateDetail("batch_no", e.target.value),
																	placeholder: "Opsional"
																})
															}),
															/* @__PURE__ */ jsx(Field, {
																label: "Lokasi",
																children: /* @__PURE__ */ jsx(Select, {
																	value: detail.location_id ?? "",
																	onChange: (e) => updateDetail("location_id", e.target.value),
																	children: locations.filter((location) => !form.data.warehouse_id || Number(location.warehouse_id) === Number(form.data.warehouse_id)).map((location) => /* @__PURE__ */ jsxs("option", {
																		value: location.id,
																		children: [
																			location.code,
																			" — ",
																			location.name
																		]
																	}, location.id))
																})
															})
														] })
													]
												})]
											}, index);
										})
									]
								}),
								kind === "request" && fulfillmentAccess.isSuperadmin && /* @__PURE__ */ jsx(Field, {
									label: "Gudang unit tujuan",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.to_warehouse_id,
										onChange: (e) => form.setData("to_warehouse_id", e.target.value),
										children: warehouses.filter((x) => x.type === "unit").map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.name
										}, x.id))
									})
								}),
								kind === "request" && /* @__PURE__ */ jsxs("div", {
									className: "space-y-3 sm:col-span-2",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "text-sm font-semibold text-slate-800",
												children: "Barang yang dibutuhkan"
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-0.5 text-xs text-slate-500",
												children: !form.data.from_warehouse_id ? "Pilih gudang sumber terlebih dahulu untuk melihat barang tersedia." : `${availableRequestItems.length} barang tersedia pada gudang yang dipilih.`
											})] }), /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => form.setData("details", [...form.data.details, {
													item_id: "",
													uom_id: "",
													qty: 1
												}]),
												className: "inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
												children: [/* @__PURE__ */ jsx(Plus, { size: 14 }), " Tambah barang"]
											})]
										}),
										form.data.details.map((detail, index) => /* @__PURE__ */ jsxs("div", {
											className: "relative grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ jsx("div", {
													className: "pr-10 sm:col-span-2",
													children: /* @__PURE__ */ jsx(Field, {
														label: `Nama barang ${index + 1} *`,
														children: /* @__PURE__ */ jsx(SearchableSelect, {
															value: detail.item_id,
															placeholder: form.data.from_warehouse_id ? "Cari barang tersedia" : "Pilih gudang sumber terlebih dahulu",
															options: availableRequestItems.map((stock) => ({
																value: stock.item.id,
																label: `${stock.item.code} — ${stock.item.name} · tersedia ${Number(stock.qty_available).toLocaleString("id-ID")} ${stock.uom_code}`
															})),
															onChange: (itemId) => {
																const selectedStock = availableRequestItems.find((stock) => Number(stock.item_id) === Number(itemId));
																form.setData("details", form.data.details.map((row, i) => i === index ? {
																	...row,
																	item_id: itemId,
																	uom_id: selectedStock?.uom_id || ""
																} : row));
															}
														})
													})
												}),
												/* @__PURE__ */ jsx(Field, {
													label: "Satuan tersedia",
													children: (() => {
														const selectedStock = availableRequestItems.find((stock) => Number(stock.item_id) === Number(detail.item_id));
														return /* @__PURE__ */ jsxs("div", {
															className: "flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-sm",
															children: [/* @__PURE__ */ jsx("span", {
																className: selectedStock ? "font-semibold text-slate-700" : "text-slate-400",
																children: selectedStock?.uom_name || "Pilih barang dahulu"
															}), selectedStock && /* @__PURE__ */ jsx("span", {
																className: "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
																children: selectedStock.uom_code
															})]
														});
													})()
												}),
												/* @__PURE__ */ jsx(Field, {
													label: "Jumlah *",
													children: /* @__PURE__ */ jsx("input", {
														type: "number",
														min: "0.001",
														step: "0.001",
														className: input,
														value: detail.qty,
														onChange: (e) => form.setData("details", form.data.details.map((row, i) => i === index ? {
															...row,
															qty: e.target.value
														} : row))
													})
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													disabled: form.data.details.length === 1,
													title: "Hapus barang",
													"aria-label": `Hapus barang ${index + 1}`,
													onClick: () => form.setData("details", form.data.details.filter((_, i) => i !== index)),
													className: "absolute right-4 top-4 grid size-9 place-items-center rounded-lg border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30",
													children: /* @__PURE__ */ jsx(X, { size: 16 })
												})
											]
										}, index)),
										/* @__PURE__ */ jsx(Field, {
											label: "Catatan tambahan (opsional)",
											children: /* @__PURE__ */ jsx("textarea", {
												rows: 3,
												className: "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50",
												value: form.data.notes,
												onChange: (e) => form.setData("notes", e.target.value),
												placeholder: "Contoh: Dibutuhkan untuk operasional akhir pekan."
											})
										})
									]
								}),
								kind === "delivery" && /* @__PURE__ */ jsx(Field, {
									label: "Request disetujui",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.stock_request_id,
										onChange: (e) => form.setData("stock_request_id", e.target.value),
										children: requests.filter((x) => x.status === "approved").map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.number
										}, x.id))
									})
								}),
								kind === "receipt" && /* @__PURE__ */ jsx(Field, {
									label: "Delivery dikirim",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.delivery_id,
										onChange: (e) => form.setData("delivery_id", e.target.value),
										children: deliveries.filter((x) => x.status === "shipped").map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.number
										}, x.id))
									})
								}),
								kind === "adjustment" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Field, {
									label: "Jenis adjustment",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.type,
										onChange: (e) => form.setData("type", e.target.value),
										children: [
											"damaged",
											"expired",
											"correction",
											"opening",
											"waste",
											"return"
										].map((x) => /* @__PURE__ */ jsx("option", { children: x }, x))
									})
								}), /* @__PURE__ */ jsx(Field, {
									label: "Alasan",
									children: /* @__PURE__ */ jsx("input", {
										className: input,
										value: form.data.reason,
										onChange: (e) => form.setData("reason", e.target.value)
									})
								})] }),
								["purchase-order", "grn"].includes(kind) && /* @__PURE__ */ jsx(Field, {
									label: "Approver",
									children: /* @__PURE__ */ jsx(Select, {
										value: form.data.approver_id,
										onChange: (e) => form.setData("approver_id", e.target.value),
										children: managers.map((x) => /* @__PURE__ */ jsx("option", {
											value: x.id,
											children: x.name
										}, x.id))
									})
								}),
								["adjustment", "opname"].includes(kind) && /* @__PURE__ */ jsxs("div", {
									className: "sm:col-span-2",
									children: [/* @__PURE__ */ jsx("p", {
										className: "mb-1.5 text-sm font-medium text-slate-700",
										children: "Manajer penyetuju"
									}), /* @__PURE__ */ jsxs("div", {
										className: `flex min-h-11 items-center gap-3 rounded-xl border px-3.5 ${selectedManager ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50"}`,
										children: [/* @__PURE__ */ jsx(ShieldCheck, {
											size: 18,
											className: selectedManager ? "text-emerald-600" : "text-amber-600"
										}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-sm font-semibold text-slate-800",
											children: selectedManager?.name || "Manajer gudang belum dikonfigurasi"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-[11px] text-slate-500",
											children: "Dipilih otomatis berdasarkan gudang dokumen"
										})] })]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex gap-2 sm:col-span-2",
									children: [/* @__PURE__ */ jsxs("button", {
										disabled: form.processing,
										className: "inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600 disabled:opacity-50",
										children: [
											editing ? /* @__PURE__ */ jsx(Check, { size: 17 }) : /* @__PURE__ */ jsx(PackageCheck, { size: 17 }),
											" ",
											form.processing ? "Mengirim..." : editing ? "Simpan perubahan" : module === "fulfillment" ? "Kirim permintaan stok" : module === "inventory-control" ? "Ajukan persetujuan" : "Simpan & proses"
										]
									}), editing && /* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: cancelEdit,
										className: "inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600",
										children: [/* @__PURE__ */ jsx(RotateCcw, { size: 16 }), " Batal"]
									})]
								})
							]
						})
					]
				}) : /* @__PURE__ */ jsx(Card, {
					title: "Antrean request stok",
					description: "Pantau approval dan persiapan barang sesuai tanggung jawab Anda.",
					children: /* @__PURE__ */ jsxs("div", {
						className: "py-8 text-center text-sm text-slate-500",
						children: [/* @__PURE__ */ jsx(PackageCheck, { className: "mx-auto mb-3 text-emerald-500" }), "Pilih request yang sudah disetujui manajer unit untuk menyiapkan barang."]
					})
				}), /* @__PURE__ */ jsx(Card, {
					title: module === "fulfillment" ? "Request stok per unit" : "Ringkasan operasional",
					description: module === "fulfillment" ? "Lihat unit peminta, gudang sumber, detail item, dan status persetujuan." : "Status request dan perpindahan stok terbaru.",
					children: /* @__PURE__ */ jsx(RecordList, {
						module,
						records,
						onEdit: startEdit,
						masterKind: kind,
						initialItemWarehouse,
						initialItemSearch
					})
				})]
			})
		]
	});
}
function RecordList({ module, records, onEdit, masterKind, initialItemWarehouse, initialItemSearch }) {
	if (module === "master-data") return /* @__PURE__ */ jsx(MasterDataList, {
		records,
		onEdit,
		kind: masterKind,
		initialItemWarehouse,
		initialItemSearch
	});
	if (module === "fulfillment") return /* @__PURE__ */ jsx(RequestStockList, { records });
	if (module === "inventory-control") return /* @__PURE__ */ jsx(InventoryControlList, { records });
	const list = module === "purchasing" ? [...records.orders || [], ...records.receipts || []] : module === "fulfillment" ? [...records.requests || [], ...records.deliveries || []] : module === "inventory-control" ? records.stocks || [] : [];
	if (!list.length) return /* @__PURE__ */ jsxs("div", {
		className: "py-12 text-center text-sm text-slate-500",
		children: [/* @__PURE__ */ jsx(ClipboardList, { className: "mx-auto mb-3 text-slate-300" }), "Belum ada data pada modul ini."]
	});
	return /* @__PURE__ */ jsx("div", {
		className: "max-h-[620px] space-y-2 overflow-auto pr-1",
		children: list.map((row) => /* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsx("p", {
					className: "truncate text-sm font-semibold text-slate-800",
					children: row.number || row.item?.name
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 truncate text-xs text-slate-500",
					children: row.warehouse?.name || row.type || `${row.qty_on_hand} tersedia, ${row.qty_reserved} reservasi`
				})]
			}), /* @__PURE__ */ jsx("span", {
				className: `shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status || "available")}`,
				children: row.status || "stock"
			})]
		}, `${row.number || "stock"}-${row.id}`))
	});
}
function InventoryControlList({ records }) {
	const documents = [...(records.opnames || []).map((row) => ({
		...row,
		documentType: "Stock Opname",
		summary: `${row.details?.length || 0} item dihitung`
	})), ...(records.adjustments || []).filter((row) => !row.stock_opname_id).map((row) => ({
		...row,
		documentType: "Adjustment",
		summary: `${row.details?.length || 0} item disesuaikan`
	}))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	if (!documents.length) return /* @__PURE__ */ jsxs("div", {
		className: "py-12 text-center text-sm text-slate-500",
		children: [/* @__PURE__ */ jsx(ClipboardList, { className: "mx-auto mb-3 text-slate-300" }), "Belum ada dokumen opname atau adjustment."]
	});
	return /* @__PURE__ */ jsx("div", {
		className: "max-h-[620px] space-y-3 overflow-auto pr-1",
		children: documents.map((row) => /* @__PURE__ */ jsxs("article", {
			className: "rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "text-[10px] font-bold uppercase tracking-[.14em] text-emerald-600",
									children: row.documentType
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-300",
									children: "•"
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500",
									children: row.warehouse?.name
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 truncate text-sm font-semibold text-slate-900",
							children: row.number
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-xs text-slate-500",
							children: [
								row.summary,
								" · Dibuat oleh ",
								row.creator?.name || "—"
							]
						})
					]
				}), /* @__PURE__ */ jsx("span", {
					className: `shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status)}`,
					children: statusText(row.status)
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500",
				children: [
					/* @__PURE__ */ jsx(ShieldCheck, {
						size: 14,
						className: "text-emerald-500"
					}),
					"Penyetuju:",
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-slate-700",
						children: row.assigned_approver?.name || "Belum dikonfigurasi"
					})
				]
			})]
		}, `${row.documentType}-${row.id}`))
	});
}
function RequestStockList({ records }) {
	const requests = records.requests || [];
	const [unitFilter, setUnitFilter] = useState("");
	const [warehouseFilter, setWarehouseFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const units = Array.from(new Map(requests.filter((row) => row.to_warehouse).map((row) => [row.to_warehouse.id, row.to_warehouse])).values());
	const sourceWarehouses = Array.from(new Map(requests.filter((row) => row.from_warehouse).map((row) => [row.from_warehouse.id, row.from_warehouse])).values());
	const filteredRequests = requests.filter((row) => (!unitFilter || String(row.to_warehouse_id) === unitFilter) && (!warehouseFilter || String(row.from_warehouse_id) === warehouseFilter) && (!statusFilter || row.status === statusFilter));
	const stageName = (step) => ({
		requester: "Unit Peminta",
		unit_manager: "Manajer Unit",
		warehouse_admin: "Admin Gudang",
		warehouse_manager: "Manajer Gudang"
	})[step?.stage_key] || step?.stage_label?.replace(/^Approval\s+/i, "") || "Approval";
	const requestStatus = (row) => {
		const activeStep = row.approval?.steps?.find((step) => Number(step.level) === Number(row.approval?.current_level));
		if (row.status === "rejected") {
			const rejectedStep = row.approval?.steps?.find((step) => step.status === "rejected");
			return `Ditolak: ${stageName(rejectedStep)}`;
		}
		if (row.status === "received") {
			const finalStep = [...row.approval?.steps || []].reverse().find((step) => step.status === "approved");
			return `Diterima: ${stageName(finalStep)}`;
		}
		if (row.status === "waiting_approval" && activeStep) return `Menunggu: ${stageName(activeStep)}`;
		return statusText(row.status);
	};
	if (!requests.length) return /* @__PURE__ */ jsxs("div", {
		className: "px-5 py-14 text-center",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "mx-auto grid size-12 place-items-center rounded-2xl bg-slate-50 text-slate-400",
				children: /* @__PURE__ */ jsx(ClipboardList, { size: 22 })
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-4 text-sm font-semibold text-slate-700",
				children: "Belum ada permintaan stok"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500",
				children: "Permintaan yang sudah dikirim akan tampil di sini beserta status persetujuannya."
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ jsxs(Link, {
					href: "/stock-requests",
					className: "inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700",
					children: ["Lihat seluruh request ", /* @__PURE__ */ jsx(ArrowRight, { size: 14 })]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ jsxs("select", {
						value: unitFilter,
						onChange: (event) => setUnitFilter(event.target.value),
						className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-400",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Semua unit"
						}), units.map((unit) => /* @__PURE__ */ jsx("option", {
							value: unit.id,
							children: unit.name
						}, unit.id))]
					}),
					/* @__PURE__ */ jsxs("select", {
						value: warehouseFilter,
						onChange: (event) => setWarehouseFilter(event.target.value),
						className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-400",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Semua gudang sumber"
						}), sourceWarehouses.map((warehouse) => /* @__PURE__ */ jsx("option", {
							value: warehouse.id,
							children: warehouse.name
						}, warehouse.id))]
					}),
					/* @__PURE__ */ jsxs("select", {
						value: statusFilter,
						onChange: (event) => setStatusFilter(event.target.value),
						className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-emerald-400",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Semua status"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "waiting_approval",
								children: "Menunggu persetujuan"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "received",
								children: "Sudah diterima"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "rejected",
								children: "Ditolak"
							})
						]
					})
				]
			}),
			!filteredRequests.length && /* @__PURE__ */ jsx("div", {
				className: "rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-500",
				children: "Tidak ada request yang sesuai dengan filter."
			}),
			filteredRequests.map((row) => /* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-slate-200 p-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ jsx("p", {
									className: "font-semibold text-slate-900",
									children: row.number
								}), row.to_warehouse?.name && /* @__PURE__ */ jsxs("span", {
									className: "inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/10",
									children: ["Unit: ", row.to_warehouse.name]
								})]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs text-slate-500",
								children: [
									row.to_warehouse?.name,
									" meminta dari ",
									row.from_warehouse?.name
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs text-slate-400",
								children: [
									"Diajukan oleh ",
									row.requester?.name,
									" · ",
									row.details.length,
									" item"
								]
							})
						] }), /* @__PURE__ */ jsx("span", {
							className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status)}`,
							children: requestStatus(row)
						})]
					}),
					/* @__PURE__ */ jsxs("details", {
						className: "group mt-4 border-t border-slate-100 pt-3",
						children: [/* @__PURE__ */ jsxs("summary", {
							className: "flex cursor-pointer list-none items-center justify-between rounded-lg px-1 py-2 text-xs font-semibold text-emerald-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden",
							children: [/* @__PURE__ */ jsxs("span", { children: [
								"Detail item request (",
								row.details.length,
								")"
							] }), /* @__PURE__ */ jsx(ChevronDown, {
								size: 16,
								className: "transition-transform group-open:rotate-180"
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-2 overflow-x-auto rounded-xl border border-slate-200",
							children: /* @__PURE__ */ jsxs("table", {
								className: "min-w-full text-xs",
								children: [/* @__PURE__ */ jsx("thead", {
									className: "bg-slate-50 text-left uppercase tracking-wider text-slate-500",
									children: /* @__PURE__ */ jsxs("tr", { children: [
										/* @__PURE__ */ jsx("th", {
											className: "px-3 py-2.5",
											children: "Item"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-3 py-2.5 text-right",
											children: "Request"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-3 py-2.5 text-right",
											children: "Disetujui"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-3 py-2.5 text-right",
											children: "Dikirim"
										}),
										/* @__PURE__ */ jsx("th", {
											className: "px-3 py-2.5 text-right",
											children: "Diterima"
										})
									] })
								}), /* @__PURE__ */ jsx("tbody", {
									className: "divide-y divide-slate-100",
									children: row.details.map((detail) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsxs("td", {
										className: "px-3 py-3",
										children: [/* @__PURE__ */ jsxs("p", {
											className: "font-semibold text-slate-800",
											children: [
												detail.item?.code,
												" · ",
												detail.item?.name
											]
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-0.5 text-slate-400",
											children: detail.uom?.code || detail.item?.base_uom || "-"
										})]
									}), [
										detail.qty_requested,
										detail.qty_approved,
										detail.qty_delivered,
										detail.qty_received
									].map((quantity, index) => /* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-3 py-3 text-right font-medium text-slate-700",
										children: Number(quantity || 0).toLocaleString("id-ID")
									}, index))] }, detail.id))
								})]
							})
						})]
					}),
					row.approval?.steps?.length > 0 && /* @__PURE__ */ jsxs("details", {
						className: "group mt-4 border-t border-slate-100 pt-3",
						children: [/* @__PURE__ */ jsxs("summary", {
							className: "flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-400 [&::-webkit-details-marker]:hidden",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs font-bold uppercase tracking-[.12em] text-slate-600",
								children: "Timeline approval"
							}), /* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-[11px] text-slate-500",
								children: [
									row.approval.steps.filter((step) => step.status !== "pending").length,
									" ",
									"dari ",
									row.approval.steps.length,
									" tahap selesai"
								]
							})] }), /* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "group-open:hidden",
										children: "Lihat detail"
									}),
									/* @__PURE__ */ jsx("span", {
										className: "hidden group-open:inline",
										children: "Tutup"
									}),
									/* @__PURE__ */ jsx(ChevronDown, {
										size: 16,
										className: "transition-transform duration-200 group-open:rotate-180"
									})
								]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-3 border-t border-slate-100 pt-4",
							children: row.approval.steps.map((step, index) => {
								const completed = step.status === "approved";
								const rejected = step.status === "rejected";
								const active = row.approval.status === "pending" && Number(row.approval.current_level) === Number(step.level);
								const actor = step.actor || step.approver;
								return /* @__PURE__ */ jsxs("div", {
									className: "relative flex gap-3 pb-4 last:pb-0",
									children: [
										index < row.approval.steps.length - 1 && /* @__PURE__ */ jsx("span", { className: "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-slate-200" }),
										/* @__PURE__ */ jsx("span", {
											className: `relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold ${completed ? "border-emerald-500 bg-emerald-500 text-white" : rejected ? "border-rose-500 bg-rose-500 text-white" : active ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-400"}`,
											children: completed ? "✓" : rejected ? "×" : step.level
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ jsxs("div", {
													className: "flex flex-wrap items-center justify-between gap-2",
													children: [/* @__PURE__ */ jsx("p", {
														className: "text-xs font-semibold text-slate-800",
														children: step.stage_label || `Approval tahap ${step.level}`
													}), /* @__PURE__ */ jsx("span", {
														className: `rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge(step.status)}`,
														children: completed ? "Disetujui" : rejected ? "Ditolak" : active ? "Menunggu tindakan" : "Menunggu giliran"
													})]
												}),
												/* @__PURE__ */ jsxs("p", {
													className: "mt-1 text-[11px] text-slate-500",
													children: [actor?.name || "Approver belum tersedia", step.acted_at && ` · ${new Date(step.acted_at).toLocaleString("id-ID")}`]
												}),
												step.remarks && /* @__PURE__ */ jsxs("p", {
													className: "mt-1 rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] italic text-slate-600",
													children: [
														"“",
														step.remarks,
														"”"
													]
												})
											]
										})
									]
								}, step.id);
							})
						})]
					})
				]
			}, row.id))
		]
	});
}
function MasterDataList({ records, onEdit, kind, initialItemWarehouse, initialItemSearch }) {
	const [itemSearch, setItemSearch] = useState(initialItemSearch || "");
	const initialItemSearchRender = useRef(true);
	const paginatedItems = records.items?.data ? records.items : null;
	useEffect(() => {
		if (initialItemSearchRender.current) {
			initialItemSearchRender.current = false;
			return;
		}
		const timeout = window.setTimeout(() => {
			router.get("/operations/master-data", {
				master: "item",
				item_warehouse: initialItemWarehouse,
				item_search: itemSearch.trim() || void 0
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true
			});
		}, 350);
		return () => window.clearTimeout(timeout);
	}, [itemSearch, initialItemWarehouse]);
	const groupMap = {
		supplier: [
			"Supplier",
			records.suppliers || [],
			(row) => row.name,
			(row) => `${row.code} · ${row.phone || "Tanpa telepon"}`
		],
		uom: [
			"Satuan",
			records.uoms || [],
			(row) => row.name,
			(row) => `${row.code} · ${row.type}`
		],
		location: [
			"Lokasi gudang",
			records.locations || [],
			(row) => row.name,
			(row) => `${row.code} · ${row.warehouse?.name || "-"} · ${row.type}`
		],
		item: [
			"Item",
			paginatedItems?.data || records.items || [],
			(row) => row.name,
			(row) => `${row.code} · ${row.base_uom} · ${row.category?.name || "Tanpa kategori"}`
		]
	};
	const groups = [groupMap[kind] || groupMap.supplier];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-5",
		children: [
			kind === "item" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex gap-2 rounded-xl bg-slate-100 p-1",
					children: [["dry", "Gudang Utama Kering"], ["wet", "Gudang Utama Basah"]].map(([value, label]) => /* @__PURE__ */ jsx(Link, {
						href: `/operations/master-data?master=item&item_warehouse=${value}${itemSearch.trim() ? `&item_search=${encodeURIComponent(itemSearch.trim())}` : ""}`,
						preserveScroll: true,
						className: `flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold transition ${initialItemWarehouse === value ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`,
						children: label
					}, value))
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" }),
						/* @__PURE__ */ jsx("input", {
							type: "text",
							"aria-label": "Cari nama item",
							value: itemSearch,
							onChange: (event) => setItemSearch(event.target.value),
							placeholder: "Cari nama item...",
							className: `${input} pl-10 pr-10`
						}),
						itemSearch && /* @__PURE__ */ jsx("button", {
							type: "button",
							"aria-label": "Reset pencarian item",
							title: "Reset pencarian",
							onClick: () => setItemSearch(""),
							className: "absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
							children: /* @__PURE__ */ jsx(X, { size: 15 })
						})
					]
				})]
			}),
			groups.map(([title, rows, getTitle, getMeta]) => /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "text-xs font-semibold uppercase tracking-[.14em] text-slate-500",
					children: title
				}), /* @__PURE__ */ jsx("span", {
					className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500",
					children: kind === "item" && paginatedItems ? paginatedItems.total : rows.length
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "space-y-2",
				children: rows.length ? rows.map((row) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate text-sm font-semibold text-slate-800",
							children: getTitle(row)
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 truncate text-xs text-slate-500",
							children: getMeta(row)
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", { className: `size-2 rounded-full ${row.is_active === false ? "bg-slate-300" : "bg-emerald-500"}` }), /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => onEdit(title === "Supplier" ? "supplier" : title === "Satuan" ? "uom" : title === "Lokasi gudang" ? "location" : "item", row),
							className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-emerald-200 hover:text-emerald-700",
							children: [/* @__PURE__ */ jsx(Pencil, { size: 13 }), " Edit"]
						})]
					})]
				}, row.id)) : /* @__PURE__ */ jsx("p", {
					className: "rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400",
					children: "Belum ada data."
				})
			})] }, title)),
			kind === "item" && paginatedItems?.last_page > 1 && /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-xs text-slate-500",
					children: [
						"Menampilkan ",
						paginatedItems.from,
						"–",
						paginatedItems.to,
						" dari ",
						paginatedItems.total,
						" item"
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-1.5",
					children: paginatedItems.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(Link, {
						href: link.url,
						preserveScroll: true,
						className: `rounded-lg border px-3 py-1.5 text-xs font-semibold ${link.active ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"}`,
						dangerouslySetInnerHTML: { __html: link.label }
					}, index) : /* @__PURE__ */ jsx("span", {
						className: "rounded-lg border border-slate-100 px-3 py-1.5 text-xs text-slate-300",
						dangerouslySetInnerHTML: { __html: link.label }
					}, index))
				})]
			})
		]
	});
}
//#endregion
export { Operations as default };

//# sourceMappingURL=Index-B2KiZxn9.js.map