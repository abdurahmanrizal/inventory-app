import { n as ConfirmActionDialog, t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as SearchableItemSelect } from "./searchable-item-select-3UmoD7Bb.js";
import { t as TransactionHistory } from "./TransactionHistory-BpwGx3Fx.js";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, CheckCircle2, PackageMinus, Plus, Trash2, Warehouse } from "lucide-react";
//#region resources/js/pages/StockOut/Index.tsx
var fieldClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
var emptyDetail = () => ({
	item_id: "",
	qty: 1,
	unit_cost: 0,
	batch_no: "",
	expired_at: ""
});
function Index({ transactions, warehouses, items, userWarehouse, access }) {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const form = useForm({
		type: "stock_out",
		stock_out_reason: "operational",
		source_warehouse_id: userWarehouse?.id || "",
		supplier_name: "",
		document_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		notes: "",
		details: [emptyDetail()]
	});
	const setDetail = (index, key, value) => form.setData("details", form.data.details.map((detail, position) => position === index ? {
		...detail,
		[key]: value
	} : detail));
	const submit = (event) => {
		event.preventDefault();
		setConfirmOpen(true);
	};
	const confirmSubmit = () => {
		form.post("/stock-transactions", {
			preserveScroll: true,
			onSuccess: () => {
				setConfirmOpen(false);
				form.reset();
			}
		});
	};
	const errors = Object.values(form.errors);
	const isUnitReturn = form.data.stock_out_reason === "restitution";
	const availableItems = items.filter((item) => !form.data.source_warehouse_id || item.warehouse_ids?.some((warehouseId) => String(warehouseId) === String(form.data.source_warehouse_id)));
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Stock Out",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Stock Out" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium text-blue-700",
						children: "Pergerakan persediaan"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-1 text-2xl font-semibold tracking-tight text-slate-950",
						children: "Buat pengajuan barang keluar"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-2xl text-sm leading-6 text-slate-500",
						children: "Pengajuan stock out akan melalui approval berjenjang dari manajer unit terkait sebelum stok gudang dipotong."
					})
				]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "space-y-5",
				children: [
					errors.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700",
						children: [/* @__PURE__ */ jsx(AlertCircle, {
							className: "mt-0.5 shrink-0",
							size: 19
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm font-semibold",
							children: "Periksa kembali data transaksi"
						}), /* @__PURE__ */ jsx("ul", {
							className: "mt-1 list-inside list-disc text-xs leading-5",
							children: errors.map((error, index) => /* @__PURE__ */ jsx("li", { children: error }, index))
						})] })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "border-b border-slate-100 p-5 sm:px-6",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs font-semibold text-slate-700",
									children: "Jenis transaksi"
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-3 inline-flex rounded-xl bg-slate-100 p-1.5",
									children: /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm",
										children: [/* @__PURE__ */ jsx(PackageMinus, {
											size: 16,
											className: "mr-2 inline"
										}), "Stock Out"]
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4",
								children: [
									/* @__PURE__ */ jsxs("label", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "text-xs font-semibold text-slate-700",
											children: ["Gudang asal ", /* @__PURE__ */ jsx("b", {
												className: "text-rose-500",
												children: "*"
											})]
										}), userWarehouse?.id ? /* @__PURE__ */ jsx("div", {
											className: `${fieldClass} flex items-center bg-slate-50 text-slate-600`,
											children: userWarehouse?.name || "Gudang akun belum ditentukan"
										}) : /* @__PURE__ */ jsxs("select", {
											className: fieldClass,
											value: form.data.source_warehouse_id,
											onChange: (event) => form.setData("source_warehouse_id", event.target.value),
											children: [/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Pilih gudang asal"
											}), warehouses.map((warehouse) => /* @__PURE__ */ jsx("option", {
												value: warehouse.id,
												children: warehouse.name
											}, warehouse.id))]
										})]
									}),
									/* @__PURE__ */ jsxs("label", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "text-xs font-semibold text-slate-700",
											children: ["Jenis pengeluaran ", /* @__PURE__ */ jsx("b", {
												className: "text-rose-500",
												children: "*"
											})]
										}), /* @__PURE__ */ jsxs("select", {
											className: fieldClass,
											value: form.data.stock_out_reason,
											onChange: (event) => form.setData("stock_out_reason", event.target.value),
											children: [
												/* @__PURE__ */ jsx("option", {
													value: "operational",
													children: "Pemakaian operasional"
												}),
												/* @__PURE__ */ jsx("option", {
													value: "waste",
													children: "Waste / terbuang"
												}),
												!access?.isUnitAdmin && /* @__PURE__ */ jsx("option", {
													value: "return",
													children: "Retur ke supplier"
												}),
												access?.isUnitAdmin && /* @__PURE__ */ jsx("option", {
													value: "restitution",
													children: "Pengembalian ke gudang utama"
												})
											]
										})]
									}),
									/* @__PURE__ */ jsxs("label", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "text-xs font-semibold text-slate-700",
											children: "Penerima / tujuan"
										}), isUnitReturn ? /* @__PURE__ */ jsx("div", {
											className: `${fieldClass} flex items-center bg-emerald-50/60 text-emerald-800`,
											children: "Ditentukan otomatis dari sumber stok"
										}) : /* @__PURE__ */ jsx("input", {
											className: fieldClass,
											placeholder: "Unit atau pihak penerima",
											value: form.data.supplier_name,
											onChange: (event) => form.setData("supplier_name", event.target.value)
										})]
									}),
									/* @__PURE__ */ jsxs("label", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "text-xs font-semibold text-slate-700",
											children: ["Tanggal dokumen ", /* @__PURE__ */ jsx("b", {
												className: "text-rose-500",
												children: "*"
											})]
										}), /* @__PURE__ */ jsx("input", {
											type: "date",
											className: fieldClass,
											value: form.data.document_date,
											onChange: (event) => form.setData("document_date", event.target.value)
										})]
									})
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "grid gap-5 px-5 pb-5 sm:px-6 md:grid-cols-2",
								children: /* @__PURE__ */ jsxs("label", {
									className: "space-y-2 md:col-span-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-xs font-semibold text-slate-700",
										children: "Catatan"
									}), /* @__PURE__ */ jsx("input", {
										className: fieldClass,
										placeholder: "Keperluan transaksi",
										value: form.data.notes,
										onChange: (event) => form.setData("notes", event.target.value)
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx("span", {
										className: "grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700",
										children: /* @__PURE__ */ jsx(Warehouse, { size: 18 })
									}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
										className: "text-sm font-semibold text-slate-900",
										children: "Detail barang"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500",
										children: "Isi item sesuai batch stok yang tersedia."
									})] })]
								}), /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => form.setData("details", [...form.data.details, emptyDetail()]),
									className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50",
									children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), "Tambah item"]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "space-y-3 p-4 sm:p-6",
								children: form.data.details.map((detail, index) => /* @__PURE__ */ jsxs("div", {
									className: "rounded-2xl border border-slate-200 bg-slate-50/60 p-4",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "mb-3 flex items-center justify-between",
										children: [/* @__PURE__ */ jsxs("span", {
											className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400",
											children: ["Item ", String(index + 1).padStart(2, "0")]
										}), /* @__PURE__ */ jsx("button", {
											"aria-label": "Hapus item",
											type: "button",
											disabled: form.data.details.length === 1,
											onClick: () => form.setData("details", form.data.details.filter((_, position) => position !== index)),
											className: "rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30",
											children: /* @__PURE__ */ jsx(Trash2, { size: 17 })
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "grid gap-4 md:grid-cols-12",
										children: [
											/* @__PURE__ */ jsxs("label", {
												className: "space-y-2 md:col-span-6",
												children: [
													/* @__PURE__ */ jsx("span", {
														className: "text-xs font-semibold text-slate-600",
														children: "Produk"
													}),
													/* @__PURE__ */ jsx(SearchableItemSelect, {
														value: detail.item_id,
														items: availableItems,
														onChange: (value) => setDetail(index, "item_id", value),
														placeholder: "Cari kode atau nama produk",
														entityLabel: "produk"
													}),
													detail.item_id && /* @__PURE__ */ jsxs("span", {
														className: "text-[11px] text-slate-500",
														children: [
															"Stok tersedia: ",
															availableItems.find((item) => String(item.id) === String(detail.item_id))?.available_qty ?? 0,
															" ",
															availableItems.find((item) => String(item.id) === String(detail.item_id))?.base_uom ?? ""
														]
													})
												]
											}),
											/* @__PURE__ */ jsxs("label", {
												className: "space-y-2 md:col-span-3",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-semibold text-slate-600",
													children: "Kuantitas"
												}), /* @__PURE__ */ jsx("input", {
													type: "number",
													min: "0.001",
													step: ".001",
													className: fieldClass,
													value: detail.qty,
													onChange: (event) => setDetail(index, "qty", event.target.value)
												})]
											}),
											/* @__PURE__ */ jsxs("label", {
												className: "space-y-2 md:col-span-3",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-xs font-semibold text-slate-600",
													children: "Nomor batch"
												}), /* @__PURE__ */ jsx("input", {
													className: fieldClass,
													placeholder: "Sesuai saldo stok",
													value: detail.batch_no,
													onChange: (event) => setDetail(index, "batch_no", event.target.value)
												})]
											})
										]
									})]
								}, index))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => form.reset(),
									className: "rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600",
									children: "Reset"
								}), /* @__PURE__ */ jsxs("button", {
									disabled: form.processing,
									className: "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-60",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { size: 17 }), form.processing ? "Mengirim..." : "Ajukan Stock Out"]
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsx(TransactionHistory, {
				transactions,
				title: "Daftar pengajuan Stock Out",
				emptyText: "Pengajuan Stock Out yang dibuat akan muncul di sini."
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: confirmOpen,
				onOpenChange: setConfirmOpen,
				onConfirm: confirmSubmit,
				processing: form.processing,
				tone: "amber",
				title: "Ajukan Stock Out?",
				description: "Pastikan gudang, produk, jumlah, dan batch sudah benar. Transaksi akan masuk ke approval berjenjang.",
				confirmLabel: "Ya, ajukan approval"
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-BnbGRmUi.js.map