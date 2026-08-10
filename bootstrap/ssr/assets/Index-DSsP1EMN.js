import { n as ConfirmActionDialog, t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, Link, router, usePoll } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, CalendarDays, Check, ClipboardCheck, Clock3, Download, History, Image, Package, Search, Warehouse, X, XCircle } from "lucide-react";
//#region resources/js/pages/Approvals/Index.tsx
var stockOutReasonLabels = {
	operational: "Operasional",
	shrinkage: "Penyusutan",
	expired: "Kedaluwarsa",
	damaged: "Barang Rusak",
	waste: "Waste / Terbuang",
	return: "Retur",
	restitution: "Pengembalian",
	other: "Lainnya"
};
var historyCategories = [
	{
		value: "all",
		label: "Semua"
	},
	{
		value: "stock_in",
		label: "Stock In"
	},
	{
		value: "stock_out",
		label: "Stock Out"
	},
	{
		value: "stock_request",
		label: "Request per Unit"
	},
	{
		value: "adjustment_opname",
		label: "Adjustment / Opname"
	}
];
function Index({ transactions, workflowApprovals = [], approvalHistory = [], warehouses, canFilterWarehouse, selectedWarehouse, userRole, mainWarehouses = [], warehouseCounts = {} }) {
	const [rejecting, setRejecting] = useState(null);
	const [approving, setApproving] = useState(null);
	const [remarks, setRemarks] = useState("");
	const [processing, setProcessing] = useState(null);
	const [previewEvidence, setPreviewEvidence] = useState(null);
	const [historyCategory, setHistoryCategory] = useState("all");
	const [historySearch, setHistorySearch] = useState("");
	const [historyDateFrom, setHistoryDateFrom] = useState("");
	const [historyDateTo, setHistoryDateTo] = useState("");
	const [activeMainWarehouse, setActiveMainWarehouse] = useState(null);
	const isMainWarehouseManager = userRole === "warehouse_manager";
	const warehouseOfTransaction = (transaction) => transaction.type === "stock_in" ? transaction.destination_warehouse_id : transaction.request_kind === "unit_return" ? transaction.destination_warehouse_id : transaction.source_warehouse_id || transaction.destination_warehouse_id;
	const warehouseOfWorkflow = (approval) => approval.module === "stock_adjustment" ? approval.inventory_document?.warehouse_id : approval.stock_request?.from_warehouse_id;
	const visibleTransactions = isMainWarehouseManager && activeMainWarehouse ? (transactions.data || []).filter((transaction) => String(warehouseOfTransaction(transaction)) === activeMainWarehouse) : transactions.data;
	const visibleWorkflowApprovals = isMainWarehouseManager && activeMainWarehouse ? workflowApprovals.filter((approval) => String(warehouseOfWorkflow(approval)) === activeMainWarehouse) : workflowApprovals;
	const dateFilteredHistory = useMemo(() => {
		const search = historySearch.trim().toLocaleLowerCase("id-ID");
		const from = historyDateFrom ? /* @__PURE__ */ new Date(`${historyDateFrom}T00:00:00`) : null;
		const to = historyDateTo ? /* @__PURE__ */ new Date(`${historyDateTo}T23:59:59.999`) : null;
		return approvalHistory.filter((history) => {
			const actedAt = new Date(history.acted_at);
			const matchesDate = (!from || actedAt >= from) && (!to || actedAt <= to);
			const searchableText = [
				history.transaction_no,
				history.stage_label,
				history.source_name,
				history.destination_name,
				history.remarks
			].filter(Boolean).join(" ").toLocaleLowerCase("id-ID");
			return matchesDate && (!search || searchableText.includes(search));
		});
	}, [
		approvalHistory,
		historyDateFrom,
		historyDateTo,
		historySearch
	]);
	const historyCounts = useMemo(() => historyCategories.reduce((counts, category) => ({
		...counts,
		[category.value]: category.value === "all" ? dateFilteredHistory.length : dateFilteredHistory.filter((history) => history.category === category.value).length
	}), {}), [dateFilteredHistory]);
	const visibleHistory = useMemo(() => historyCategory === "all" ? dateFilteredHistory : dateFilteredHistory.filter((history) => history.category === historyCategory), [dateFilteredHistory, historyCategory]);
	usePoll(5e3, {
		only: [
			"transactions",
			"workflowApprovals",
			"approvalHistory",
			"mainWarehouses",
			"warehouseCounts",
			"approvalScope"
		],
		preserveScroll: true,
		preserveState: true
	});
	const approve = () => {
		if (!approving) return;
		setProcessing(`${approving.kind || "transaction"}-${approving.id}`);
		router.post(approving.kind === "workflow" ? `/workflow-approvals/${approving.id}` : `/approvals/${approving.id}/approve`, approving.kind === "workflow" ? { action: "approved" } : {}, {
			preserveScroll: true,
			onSuccess: () => setApproving(null),
			onFinish: () => setProcessing(null)
		});
	};
	const reject = (event) => {
		event.preventDefault();
		if (remarks.trim().length < 5) return;
		setProcessing(`${rejecting.kind || "transaction"}-${rejecting.id}`);
		router.post(rejecting.kind === "workflow" ? `/workflow-approvals/${rejecting.id}` : `/approvals/${rejecting.id}/reject`, rejecting.kind === "workflow" ? {
			action: "rejected",
			remarks
		} : { remarks }, {
			preserveScroll: true,
			onSuccess: () => {
				setRejecting(null);
				setRemarks("");
			},
			onFinish: () => setProcessing(null)
		});
	};
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Pusat Approval",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Pusat Approval" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium text-amber-700",
						children: "Pusat persetujuan"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-1 text-2xl font-semibold tracking-tight text-slate-950",
						children: "Antrean approval"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm leading-6 text-slate-500",
						children: "Tinjau detail setiap transaksi sebelum memperbarui saldo persediaan."
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-stretch gap-3 sm:flex-row sm:items-center",
					children: [canFilterWarehouse && /* @__PURE__ */ jsxs("label", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Warehouse, {
							size: 16,
							className: "pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
						}), /* @__PURE__ */ jsxs("select", {
							value: selectedWarehouse || "",
							onChange: (event) => router.get("/approvals", event.target.value ? { warehouse_id: event.target.value } : {}, {
								preserveState: true,
								replace: true
							}),
							className: "h-11 min-w-64 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50",
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Semua gudang / unit"
							}), warehouses.map((warehouse) => /* @__PURE__ */ jsx("option", {
								value: warehouse.id,
								children: warehouse.name
							}, warehouse.id))]
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "inline-flex w-fit items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-700",
							children: /* @__PURE__ */ jsx(Clock3, { size: 18 })
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-lg font-semibold leading-none text-amber-900",
							children: (transactions.total ?? transactions.data.length) + workflowApprovals.length
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] font-medium text-amber-700",
							children: "Menunggu tindakan"
						})] })]
					})]
				})]
			}),
			isMainWarehouseManager && mainWarehouses.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "mb-5 flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setActiveMainWarehouse(null),
					className: `inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${!activeMainWarehouse ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"}`,
					children: ["Semua gudang utama", /* @__PURE__ */ jsx("span", {
						className: `grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] ${!activeMainWarehouse ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`,
						children: (transactions.total ?? transactions.data.length) + workflowApprovals.length
					})]
				}), mainWarehouses.map((warehouse) => {
					const count = warehouseCounts[warehouse.id] || 0;
					const active = activeMainWarehouse === String(warehouse.id);
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setActiveMainWarehouse(String(warehouse.id)),
						className: `inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${active ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"}`,
						children: [warehouse.name, /* @__PURE__ */ jsx("span", {
							className: `grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`,
							children: count
						})]
					}, warehouse.id);
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [
					visibleWorkflowApprovals.map((approval) => {
						const stockRequest = approval.stock_request;
						const inventoryDocument = approval.inventory_document;
						const isInventoryControl = approval.module === "stock_adjustment";
						const isOpname = Boolean(inventoryDocument?.stock_opname_id);
						const activeStep = approval.steps.find((step) => Number(step.level) === Number(approval.current_level));
						const actionTarget = {
							...approval,
							kind: "workflow",
							number: approval.transaction_no
						};
						return /* @__PURE__ */ jsx("article", {
							className: "overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-start xl:justify-between",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center gap-3",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600",
													children: isInventoryControl ? /* @__PURE__ */ jsx(ClipboardCheck, { size: 19 }) : /* @__PURE__ */ jsx(Package, { size: 19 })
												}),
												/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
													className: "font-semibold tracking-tight text-slate-950",
													children: approval.transaction_no
												}), /* @__PURE__ */ jsxs("p", {
													className: "mt-0.5 text-xs text-slate-500",
													children: [
														"Diajukan oleh",
														" ",
														isInventoryControl ? inventoryDocument?.creator?.name || "-" : stockRequest?.requester?.name || "-"
													]
												})] }),
												isInventoryControl && /* @__PURE__ */ jsx("span", {
													className: "inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10",
													children: isOpname ? "Stock Opname" : "Adjustment Stok"
												}),
												/* @__PURE__ */ jsx("span", {
													className: "inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10",
													children: activeStep?.stage_label || "Menunggu persetujuan"
												}),
												!isInventoryControl && stockRequest?.to_warehouse?.name && /* @__PURE__ */ jsxs("span", {
													className: "inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/10",
													children: ["Unit: ", stockRequest.to_warehouse.name]
												})
											]
										}),
										isInventoryControl ? /* @__PURE__ */ jsxs("div", {
											className: "mt-5 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm sm:grid-cols-2",
											children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "text-[10px] font-bold uppercase tracking-[.12em] text-slate-400",
												children: "Gudang"
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-1 font-semibold text-slate-800",
												children: inventoryDocument?.warehouse?.name || "-"
											})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
												className: "text-[10px] font-bold uppercase tracking-[.12em] text-slate-400",
												children: "Tanggal dokumen"
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-1 font-semibold text-slate-800",
												children: inventoryDocument?.adjustment_date ? new Date(inventoryDocument.adjustment_date).toLocaleDateString("id-ID") : "-"
											})] })]
										}) : /* @__PURE__ */ jsxs("div", {
											className: "mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-600",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "font-medium text-slate-800",
													children: stockRequest?.from_warehouse?.name || "-"
												}),
												/* @__PURE__ */ jsx(ArrowRight, {
													size: 15,
													className: "text-slate-300"
												}),
												/* @__PURE__ */ jsx("span", {
													className: "font-medium text-slate-800",
													children: stockRequest?.to_warehouse?.name || "-"
												})
											]
										}),
										/* @__PURE__ */ jsx("div", {
											className: "mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3",
											children: (isInventoryControl ? isOpname ? inventoryDocument?.opname?.details || [] : inventoryDocument?.details || [] : stockRequest?.details || []).map((detail) => /* @__PURE__ */ jsxs("div", {
												className: "rounded-xl border border-slate-100 p-3.5",
												children: [/* @__PURE__ */ jsxs("p", {
													className: "truncate text-sm font-semibold text-slate-800",
													children: [
														detail.item?.code,
														" · ",
														detail.item?.name
													]
												}), /* @__PURE__ */ jsx("p", {
													className: "mt-2 text-xs text-slate-500",
													children: isOpname ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
														"Sistem",
														" ",
														/* @__PURE__ */ jsx("b", {
															className: "font-semibold text-slate-700",
															children: Number(detail.system_qty).toLocaleString("id-ID")
														}),
														" ",
														"· Fisik",
														" ",
														/* @__PURE__ */ jsx("b", {
															className: "font-semibold text-slate-700",
															children: Number(detail.count_qty).toLocaleString("id-ID")
														}),
														" ",
														"· Selisih",
														" ",
														/* @__PURE__ */ jsx("b", {
															className: Number(detail.diff_qty) === 0 ? "font-semibold text-slate-700" : "font-semibold text-rose-600",
															children: Number(detail.diff_qty).toLocaleString("id-ID")
														})
													] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
														isInventoryControl ? "Perubahan " : "Request ",
														/* @__PURE__ */ jsxs("b", {
															className: "font-semibold text-slate-700",
															children: [
																Number(isInventoryControl ? detail.qty_adjustment : detail.qty_requested).toLocaleString("id-ID"),
																" ",
																detail.uom?.code || detail.item?.base_uom
															]
														}),
														!isInventoryControl && Number(detail.qty_approved) > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [
															" ",
															"· Disetujui",
															" ",
															/* @__PURE__ */ jsxs("b", {
																className: "font-semibold text-emerald-700",
																children: [
																	Number(detail.qty_approved).toLocaleString("id-ID"),
																	" ",
																	detail.uom?.code || detail.item?.base_uom
																]
															})
														] })
													] })
												})]
											}, detail.id))
										}),
										(isInventoryControl ? inventoryDocument?.reason || inventoryDocument?.opname?.notes : stockRequest?.notes) && /* @__PURE__ */ jsxs("p", {
											className: "mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800",
											children: [
												"Catatan:",
												" ",
												isInventoryControl ? inventoryDocument?.opname?.notes || inventoryDocument?.reason : stockRequest.notes
											]
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row xl:w-48 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 xl:flex-col",
									children: [/* @__PURE__ */ jsxs("button", {
										disabled: processing === `workflow-${approval.id}`,
										onClick: () => setApproving(actionTarget),
										className: "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-500 disabled:opacity-60",
										children: [/* @__PURE__ */ jsx(Check, { size: 17 }), " Setujui"]
									}), /* @__PURE__ */ jsxs("button", {
										disabled: processing === `workflow-${approval.id}`,
										onClick: () => setRejecting(actionTarget),
										className: "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60",
										children: [/* @__PURE__ */ jsx(XCircle, { size: 17 }), " Tolak"]
									})]
								})]
							})
						}, `workflow-${approval.id}`);
					}),
					visibleTransactions.map((transaction) => /* @__PURE__ */ jsx("article", {
						className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-start xl:justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-3",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600",
												children: /* @__PURE__ */ jsx(Package, { size: 19 })
											}),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
												className: "font-semibold tracking-tight text-slate-950",
												children: transaction.number
											}), /* @__PURE__ */ jsxs("p", {
												className: "mt-0.5 text-xs text-slate-500",
												children: ["Dibuat oleh ", transaction.creator?.name || "-"]
											})] }),
											/* @__PURE__ */ jsxs("span", {
												className: "ml-0 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10 sm:ml-2",
												children: [
													/* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-amber-500" }),
													" ",
													"Menunggu approval"
												]
											}),
											transaction.type === "stock_in" && /* @__PURE__ */ jsx("span", {
												className: "inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10",
												children: "Kategori Stock In"
											})
										]
									}),
									transaction.type === "stock_in" && /* @__PURE__ */ jsxs("div", {
										className: "mt-4 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:grid-cols-2",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-[11px] font-semibold uppercase tracking-[.12em] text-blue-600",
											children: "Supplier"
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-1 text-sm font-semibold text-slate-800",
											children: transaction.supplier_name || "Tidak dicantumkan"
										})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
											className: "text-[11px] font-semibold uppercase tracking-[.12em] text-blue-600",
											children: "Tanggal dokumen"
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-1 text-sm font-semibold text-slate-800",
											children: new Date(transaction.document_date).toLocaleDateString("id-ID")
										})] })]
									}),
									transaction.type === "stock_out" && /* @__PURE__ */ jsxs("div", {
										className: "mt-4 rounded-2xl border border-orange-200 bg-orange-50/70 px-4 py-3.5",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-[11px] font-semibold uppercase tracking-[.12em] text-orange-600",
											children: "Jenis Pengeluaran"
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-1 text-sm font-semibold text-orange-950",
											children: stockOutReasonLabels[transaction.stock_out_reason] || "Tidak dicantumkan"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-600",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "font-medium text-slate-800",
												children: transaction.source_warehouse?.name || "Eksternal"
											}),
											/* @__PURE__ */ jsx(ArrowRight, {
												size: 15,
												className: "text-slate-300"
											}),
											/* @__PURE__ */ jsx("span", {
												className: "font-medium text-slate-800",
												children: transaction.destination_warehouse?.name || "Eksternal"
											})
										]
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3",
										children: transaction.details.map((detail) => /* @__PURE__ */ jsxs("div", {
											className: "rounded-xl border border-slate-100 p-3.5",
											children: [/* @__PURE__ */ jsxs("p", {
												className: "truncate text-sm font-semibold text-slate-800",
												children: [
													detail.item.code,
													" · ",
													detail.item.name
												]
											}), /* @__PURE__ */ jsxs("div", {
												className: "mt-2 flex items-center justify-between gap-3 text-xs text-slate-500",
												children: [/* @__PURE__ */ jsxs("span", { children: [
													"Qty",
													" ",
													/* @__PURE__ */ jsxs("b", {
														className: "font-semibold text-slate-700",
														children: [
															Number(detail.qty).toLocaleString("id-ID"),
															" ",
															detail.item?.base_uom || ""
														]
													})
												] }), /* @__PURE__ */ jsxs("span", { children: [
													"HPP",
													" ",
													/* @__PURE__ */ jsxs("b", {
														className: "font-semibold text-slate-700",
														children: [
															"Rp",
															" ",
															Number(transaction.type === "stock_out" ? detail.current_hpp ?? detail.unit_cost : detail.unit_cost).toLocaleString("id-ID")
														]
													})
												] })]
											})]
										}, detail.id))
									}),
									transaction.type === "stock_in" && /* @__PURE__ */ jsxs("div", {
										className: "mt-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "mb-2 text-xs font-semibold uppercase tracking-[.12em] text-slate-500",
											children: "File pendukung"
										}), /* @__PURE__ */ jsx("div", {
											className: "grid gap-3 sm:grid-cols-2",
											children: [
												[
													"receipt",
													"Foto nota",
													transaction.receipt_image_path
												],
												[
													"payment",
													"Bukti pembayaran",
													transaction.payment_proof_image_path
												],
												[
													"delivery",
													"Bukti pengiriman",
													transaction.delivery_proof_image_path
												]
											].map(([kind, label, path]) => path ? /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => setPreviewEvidence({
													url: `/stock-transactions/${transaction.id}/evidence/${kind}`,
													label
												}),
												className: "group overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-md",
												children: [/* @__PURE__ */ jsx("img", {
													src: `/stock-transactions/${transaction.id}/evidence/${kind}`,
													alt: label,
													className: "h-32 w-full bg-slate-100 object-cover"
												}), /* @__PURE__ */ jsxs("span", {
													className: "flex items-center justify-between px-3.5 py-3 text-xs font-semibold text-slate-700",
													children: [label, /* @__PURE__ */ jsx("span", {
														className: "text-blue-600",
														children: "Lihat penuh"
													})]
												})]
											}, kind) : /* @__PURE__ */ jsx("div", {
												className: "grid min-h-32 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center",
												children: /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Image, {
													className: "mx-auto text-slate-300",
													size: 22
												}), /* @__PURE__ */ jsxs("span", {
													className: "mt-2 block text-xs text-slate-400",
													children: [label, " tidak dilampirkan"]
												})] })
											}, kind))
										})]
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row xl:w-48 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 xl:flex-col",
								children: [/* @__PURE__ */ jsxs("button", {
									disabled: processing === `transaction-${transaction.id}`,
									onClick: () => setApproving(transaction),
									className: "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-500 disabled:opacity-60",
									children: [
										/* @__PURE__ */ jsx(Check, { size: 17 }),
										" ",
										transaction.type === "stock_in" ? "Setujui & Masukkan Stok" : "Setujui & Posting"
									]
								}), /* @__PURE__ */ jsxs("button", {
									disabled: processing === `transaction-${transaction.id}`,
									onClick: () => setRejecting(transaction),
									className: "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60",
									children: [/* @__PURE__ */ jsx(XCircle, { size: 17 }), " Tolak"]
								})]
							})]
						})
					}, transaction.id)),
					!visibleTransactions.length && !visibleWorkflowApprovals.length && /* @__PURE__ */ jsxs("div", {
						className: "rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600",
								children: /* @__PURE__ */ jsx(ClipboardCheck, { size: 25 })
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "mt-4 font-semibold text-slate-800",
								children: "Semua sudah ditinjau"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-slate-500",
								children: "Tidak ada transaksi yang menunggu approval."
							})
						]
					})
				]
			}),
			transactions.links?.length > 3 && /* @__PURE__ */ jsx("nav", {
				className: "mt-6 flex flex-wrap justify-center gap-1.5",
				children: transactions.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(Link, {
					href: link.url,
					preserveScroll: true,
					className: `grid min-h-9 min-w-9 place-items-center rounded-lg border px-3 text-sm transition ${link.active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`,
					dangerouslySetInnerHTML: { __html: link.label }
				}, index) : /* @__PURE__ */ jsx("span", {
					className: "grid min-h-9 min-w-9 place-items-center rounded-lg border border-slate-100 px-3 text-sm text-slate-300",
					dangerouslySetInnerHTML: { __html: link.label }
				}, index))
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "border-b border-slate-100 px-5 py-4 sm:px-6",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600",
								children: /* @__PURE__ */ jsx(History, { size: 19 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-semibold text-slate-950",
								children: "Riwayat Approval Saya"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-xs text-slate-500",
								children: "Seluruh keputusan yang pernah Anda lakukan."
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px]",
							children: [
								/* @__PURE__ */ jsxs("label", {
									className: "relative",
									children: [/* @__PURE__ */ jsx(Search, {
										size: 16,
										className: "pointer-events-none absolute left-3.5 top-3 text-slate-400"
									}), /* @__PURE__ */ jsx("input", {
										type: "search",
										value: historySearch,
										onChange: (event) => setHistorySearch(event.target.value),
										placeholder: "Cari nomor, gudang, tahap, catatan...",
										className: "h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
									})]
								}),
								/* @__PURE__ */ jsxs("label", {
									className: "relative",
									children: [/* @__PURE__ */ jsx(CalendarDays, {
										size: 15,
										className: "pointer-events-none absolute left-3.5 top-3 text-slate-400"
									}), /* @__PURE__ */ jsx("input", {
										type: "date",
										"aria-label": "Tanggal mulai",
										value: historyDateFrom,
										max: historyDateTo || void 0,
										onChange: (event) => setHistoryDateFrom(event.target.value),
										className: "h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
									})]
								}),
								/* @__PURE__ */ jsxs("label", {
									className: "relative",
									children: [/* @__PURE__ */ jsx(CalendarDays, {
										size: 15,
										className: "pointer-events-none absolute left-3.5 top-3 text-slate-400"
									}), /* @__PURE__ */ jsx("input", {
										type: "date",
										"aria-label": "Tanggal akhir",
										value: historyDateTo,
										min: historyDateFrom || void 0,
										onChange: (event) => setHistoryDateTo(event.target.value),
										className: "h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
									})]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-4 flex gap-2 overflow-x-auto pb-1",
							children: historyCategories.map((category) => {
								const active = historyCategory === category.value;
								return /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setHistoryCategory(category.value),
									className: `inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${active ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`,
									children: [category.label, /* @__PURE__ */ jsx("span", {
										className: `grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`,
										children: historyCounts[category.value] || 0
									})]
								}, category.value);
							})
						})
					]
				}), visibleHistory.length > 0 ? /* @__PURE__ */ jsx("div", {
					className: "divide-y divide-slate-100",
					children: visibleHistory.map((history) => /* @__PURE__ */ jsxs("div", {
						className: "grid gap-4 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-semibold text-slate-800",
										children: history.transaction_no
									}), /* @__PURE__ */ jsx("span", {
										className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${history.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`,
										children: history.status === "approved" ? "Disetujui" : "Ditolak"
									})]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mt-1 text-xs text-slate-500",
									children: [history.stage_label, history.source_name && ` · ${history.source_name} → ${history.destination_name || "Eksternal"}`]
								}),
								history.remarks && /* @__PURE__ */ jsxs("p", {
									className: "mt-2 text-sm italic text-slate-600",
									children: [
										"“",
										history.remarks,
										"”"
									]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col items-start gap-3 md:items-end",
							children: [/* @__PURE__ */ jsx("time", {
								className: "text-xs text-slate-500",
								children: new Date(history.acted_at).toLocaleString("id-ID")
							}), history.can_download_delivery_note && history.category === "stock_request" && /* @__PURE__ */ jsxs("a", {
								href: `/stock-requests/${history.stock_request_id}/delivery-note`,
								target: "_blank",
								rel: "noreferrer",
								title: `Sudah diunduh ${history.delivery_note_download_count ?? 0} kali`,
								className: "relative inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:border-emerald-500 hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100",
								children: [
									/* @__PURE__ */ jsx(Download, { size: 15 }),
									"Unduh Surat Jalan",
									/* @__PURE__ */ jsx("span", {
										"aria-label": `Sudah diunduh ${history.delivery_note_download_count ?? 0} kali`,
										className: "absolute -right-2 -top-2 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-blue-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm",
										children: history.delivery_note_download_count ?? 0
									})
								]
							})]
						})]
					}, history.key))
				}) : /* @__PURE__ */ jsx("div", {
					className: "px-6 py-10 text-center text-sm text-slate-500",
					children: "Tidak ada riwayat yang sesuai dengan filter."
				})]
			}),
			rejecting && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm",
				onMouseDown: (event) => event.target === event.currentTarget && setRejecting(null),
				children: /* @__PURE__ */ jsxs("form", {
					onSubmit: reject,
					className: "w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start justify-between border-b border-slate-100 p-5 sm:p-6",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "font-semibold text-slate-950",
								children: "Tolak transaksi"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-slate-500",
								children: rejecting.number
							})] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								"aria-label": "Tutup",
								onClick: () => setRejecting(null),
								className: "rounded-lg p-2 text-slate-400 hover:bg-slate-100",
								children: /* @__PURE__ */ jsx(X, { size: 18 })
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "p-5 sm:p-6",
							children: [
								/* @__PURE__ */ jsxs("label", {
									className: "text-xs font-semibold text-slate-700",
									children: ["Alasan penolakan ", /* @__PURE__ */ jsx("b", {
										className: "text-rose-500",
										children: "*"
									})]
								}),
								/* @__PURE__ */ jsx("textarea", {
									autoFocus: true,
									rows: 4,
									value: remarks,
									onChange: (event) => setRemarks(event.target.value),
									placeholder: "Jelaskan alasan penolakan secara singkat...",
									className: "mt-2 w-full resize-none rounded-xl border border-slate-200 p-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
								}),
								/* @__PURE__ */ jsx("p", {
									className: `mt-1.5 text-xs ${remarks.length > 0 && remarks.trim().length < 5 ? "text-rose-500" : "text-slate-400"}`,
									children: "Minimal 5 karakter."
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-end gap-2 bg-slate-50 px-5 py-4 sm:px-6",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setRejecting(null),
								className: "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600",
								children: "Batal"
							}), /* @__PURE__ */ jsx("button", {
								disabled: remarks.trim().length < 5 || processing === `${rejecting.kind || "transaction"}-${rejecting.id}`,
								className: "rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/15 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50",
								children: "Konfirmasi Penolakan"
							})]
						})
					]
				})
			}),
			previewEvidence && /* @__PURE__ */ jsx("div", {
				className: "fixed inset-0 z-[60] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm",
				onMouseDown: (event) => event.target === event.currentTarget && setPreviewEvidence(null),
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between border-b border-slate-100 px-5 py-4",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "font-semibold text-slate-900",
							children: previewEvidence.label
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 text-xs text-slate-500",
							children: "Dokumen pendukung pengajuan Stock In"
						})] }), /* @__PURE__ */ jsx("button", {
							type: "button",
							"aria-label": "Tutup preview",
							onClick: () => setPreviewEvidence(null),
							className: "rounded-lg p-2 text-slate-500 hover:bg-slate-100",
							children: /* @__PURE__ */ jsx(X, { size: 19 })
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "max-h-[75vh] overflow-auto bg-slate-100 p-4",
						children: /* @__PURE__ */ jsx("img", {
							src: previewEvidence.url,
							alt: previewEvidence.label,
							className: "mx-auto max-h-[70vh] rounded-lg bg-white object-contain shadow"
						})
					})]
				})
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: Boolean(approving),
				onOpenChange: (open) => !open && setApproving(null),
				onConfirm: approve,
				processing: processing === `${approving?.kind || "transaction"}-${approving?.id}`,
				title: approving?.type === "stock_in" ? "Setujui Stock In?" : "Setujui dan posting transaksi?",
				description: approving?.type === "stock_in" ? `Setelah ${approving?.number || ""} disetujui, stok akan masuk ke saldo gudang.` : `Transaksi ${approving?.number || ""} akan memengaruhi saldo stok dan tidak dapat disetujui ulang.`,
				confirmLabel: approving?.type === "stock_in" ? "Ya, setujui & masukkan stok" : "Ya, setujui & posting"
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DSsP1EMN.js.map