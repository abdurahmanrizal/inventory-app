import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { Head, Link, router } from "@inertiajs/react";
import { Fragment, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ChevronDown, ClipboardList, Package, Search } from "lucide-react";
//#region resources/js/pages/StockRequests/Index.tsx
var badge = (status = "") => status === "received" ? "bg-emerald-50 text-emerald-700" : status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
var stageName = (step) => ({
	requester: "Unit Peminta",
	unit_manager: "Manajer Unit",
	warehouse_admin: "Admin Gudang",
	warehouse_manager: "Manajer Gudang"
})[step?.stage_key] || "Approval";
var requestStatus = (row) => {
	const steps = row.approval?.steps || [];
	if (row.status === "rejected") return `Ditolak: ${stageName(steps.find((step) => step.status === "rejected"))}`;
	if (row.status === "received") return `Diterima: ${stageName([...steps].reverse().find((step) => step.status === "approved"))}`;
	const active = steps.find((step) => Number(step.level) === Number(row.approval?.current_level));
	return active ? `Menunggu: ${stageName(active)}` : "Menunggu persetujuan";
};
function Index({ requests, filters, units, sourceWarehouses }) {
	const [form, setForm] = useState({
		search: filters.search || "",
		unit_id: filters.unit_id || "",
		warehouse_id: filters.warehouse_id || "",
		status: filters.status || "",
		date_from: filters.date_from || "",
		date_to: filters.date_to || ""
	});
	const [expandedRequestId, setExpandedRequestId] = useState(null);
	const toggleDetails = (requestId) => {
		setExpandedRequestId((activeId) => activeId === requestId ? null : requestId);
	};
	const submit = (event) => {
		event.preventDefault();
		router.get("/stock-requests", form, {
			preserveState: true,
			replace: true
		});
	};
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Daftar Request Stok Unit",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Daftar Request Stok Unit" }),
			/* @__PURE__ */ jsxs("section", {
				className: "mb-6 rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-xs font-semibold uppercase tracking-[.14em] text-emerald-300",
						children: "Fulfillment"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-2 text-2xl font-semibold",
						children: "Daftar Request Stok Unit"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm text-slate-400",
						children: "Telusuri seluruh request berdasarkan unit, gudang sumber, tanggal, dan status."
					})
				]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "relative md:col-span-2",
						children: [/* @__PURE__ */ jsx(Search, {
							className: "absolute left-3 top-3 text-slate-400",
							size: 16
						}), /* @__PURE__ */ jsx("input", {
							value: form.search,
							onChange: (event) => setForm({
								...form,
								search: event.target.value
							}),
							placeholder: "Nomor atau nama item",
							className: "h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-emerald-400"
						})]
					}),
					/* @__PURE__ */ jsxs(FilterSelect, {
						value: form.unit_id,
						onChange: (value) => setForm({
							...form,
							unit_id: value
						}),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Semua unit"
						}), units.map((unit) => /* @__PURE__ */ jsx("option", {
							value: unit.id,
							children: unit.name
						}, unit.id))]
					}),
					/* @__PURE__ */ jsxs(FilterSelect, {
						value: form.warehouse_id,
						onChange: (value) => setForm({
							...form,
							warehouse_id: value
						}),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "Semua gudang"
						}), sourceWarehouses.map((warehouse) => /* @__PURE__ */ jsx("option", {
							value: warehouse.id,
							children: warehouse.name
						}, warehouse.id))]
					}),
					/* @__PURE__ */ jsxs(FilterSelect, {
						value: form.status,
						onChange: (value) => setForm({
							...form,
							status: value
						}),
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Semua status"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "waiting_approval",
								children: "Menunggu"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "received",
								children: "Diterima"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "rejected",
								children: "Ditolak"
							})
						]
					}),
					/* @__PURE__ */ jsx("button", {
						className: "h-10 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-500",
						children: "Terapkan filter"
					}),
					/* @__PURE__ */ jsx("input", {
						type: "date",
						value: form.date_from,
						onChange: (event) => setForm({
							...form,
							date_from: event.target.value
						}),
						className: "h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-400"
					}),
					/* @__PURE__ */ jsx("input", {
						type: "date",
						value: form.date_to,
						onChange: (event) => setForm({
							...form,
							date_to: event.target.value
						}),
						className: "h-10 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-emerald-400"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "hidden max-h-[620px] overflow-auto md:block",
						children: /* @__PURE__ */ jsxs("table", {
							className: "min-w-full text-sm",
							children: [/* @__PURE__ */ jsx("thead", {
								className: "sticky top-0 z-10 bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0_rgb(226,232,240)]",
								children: /* @__PURE__ */ jsx("tr", { children: [
									"Request / tanggal",
									"Unit peminta",
									"Gudang sumber",
									"Item",
									"Total qty",
									"Status",
									"Detail"
								].map((label) => /* @__PURE__ */ jsx("th", {
									className: "whitespace-nowrap px-4 py-3",
									children: label
								}, label)) })
							}), /* @__PURE__ */ jsx("tbody", {
								className: "divide-y divide-slate-100",
								children: requests.data.map((row) => {
									const expanded = expandedRequestId === row.id;
									return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("tr", {
										className: `transition ${expanded ? "bg-emerald-50/30" : "hover:bg-slate-50/70"}`,
										children: [
											/* @__PURE__ */ jsxs("td", {
												className: "whitespace-nowrap px-4 py-4",
												children: [/* @__PURE__ */ jsx("p", {
													className: "font-semibold text-slate-900",
													children: row.number
												}), /* @__PURE__ */ jsx("p", {
													className: "mt-1 text-xs text-slate-400",
													children: new Date(row.request_date).toLocaleDateString("id-ID")
												})]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-4",
												children: /* @__PURE__ */ jsx("span", {
													className: "inline-flex whitespace-nowrap rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700",
													children: row.to_warehouse?.name
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-4 text-slate-600",
												children: row.from_warehouse?.name
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-4 font-medium",
												children: row.details_count
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-4 font-medium",
												children: Number(row.total_qty_requested || 0).toLocaleString("id-ID")
											}),
											/* @__PURE__ */ jsx("td", {
												className: "whitespace-nowrap px-4 py-4",
												children: /* @__PURE__ */ jsx("span", {
													className: `rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge(row.status)}`,
													children: requestStatus(row)
												})
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-4 py-4 text-right",
												children: /* @__PURE__ */ jsxs("button", {
													type: "button",
													"aria-expanded": expanded,
													onClick: () => toggleDetails(row.id),
													className: "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50",
													children: [expanded ? "Tutup" : "Lihat", /* @__PURE__ */ jsx(ChevronDown, {
														size: 14,
														className: `transition ${expanded ? "rotate-180" : ""}`
													})]
												})
											})
										]
									}), expanded && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
										colSpan: 7,
										className: "bg-slate-50/70 px-4 py-4",
										children: /* @__PURE__ */ jsx(RequestItemList, { details: row.details })
									}) })] }, row.id);
								})
							})]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "divide-y divide-slate-100 md:hidden",
						children: requests.data.map((row) => {
							const expanded = expandedRequestId === row.id;
							return /* @__PURE__ */ jsxs("article", {
								className: "p-4",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-start justify-between gap-3",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ jsx("p", {
												className: "truncate text-sm font-semibold text-slate-900",
												children: row.number
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-1 text-xs text-slate-400",
												children: new Date(row.request_date).toLocaleDateString("id-ID")
											})]
										}), /* @__PURE__ */ jsx("span", {
											className: `shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badge(row.status)}`,
											children: requestStatus(row)
										})]
									}),
									/* @__PURE__ */ jsxs("dl", {
										className: "mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs",
										children: [
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
												className: "text-[10px] font-semibold uppercase tracking-wider text-slate-400",
												children: "Unit peminta"
											}), /* @__PURE__ */ jsx("dd", {
												className: "mt-1 font-semibold text-slate-700",
												children: row.to_warehouse?.name || "-"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
												className: "text-[10px] font-semibold uppercase tracking-wider text-slate-400",
												children: "Gudang sumber"
											}), /* @__PURE__ */ jsx("dd", {
												className: "mt-1 font-semibold text-slate-700",
												children: row.from_warehouse?.name || "-"
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
												className: "text-[10px] font-semibold uppercase tracking-wider text-slate-400",
												children: "Jumlah item"
											}), /* @__PURE__ */ jsx("dd", {
												className: "mt-1 font-semibold text-slate-700",
												children: row.details_count
											})] }),
											/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
												className: "text-[10px] font-semibold uppercase tracking-wider text-slate-400",
												children: "Total qty"
											}), /* @__PURE__ */ jsx("dd", {
												className: "mt-1 font-semibold text-slate-700",
												children: Number(row.total_qty_requested || 0).toLocaleString("id-ID")
											})] })
										]
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										"aria-expanded": expanded,
										onClick: () => toggleDetails(row.id),
										className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700",
										children: [expanded ? "Tutup detail item" : "Lihat detail item", /* @__PURE__ */ jsx(ChevronDown, {
											size: 15,
											className: `transition ${expanded ? "rotate-180" : ""}`
										})]
									}),
									expanded && /* @__PURE__ */ jsx("div", {
										className: "mt-3",
										children: /* @__PURE__ */ jsx(RequestItemList, { details: row.details })
									})
								]
							}, row.id);
						})
					}),
					!requests.data.length && /* @__PURE__ */ jsxs("div", {
						className: "py-14 text-center text-sm text-slate-500",
						children: [/* @__PURE__ */ jsx(ClipboardList, { className: "mx-auto mb-3 text-slate-300" }), "Data request tidak ditemukan."]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							"Menampilkan ",
							requests.from || 0,
							"–",
							requests.to || 0,
							" dari",
							" ",
							requests.total,
							" request"
						] }), /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-1",
							children: requests.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(Link, {
								href: link.url,
								preserveScroll: true,
								className: `rounded-lg px-3 py-2 font-semibold ${link.active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
								dangerouslySetInnerHTML: { __html: link.label }
							}, index) : /* @__PURE__ */ jsx("span", {
								className: "rounded-lg bg-slate-50 px-3 py-2 text-slate-300",
								dangerouslySetInnerHTML: { __html: link.label }
							}, index))
						})]
					})
				]
			})
		]
	});
}
function FilterSelect({ value, onChange, children }) {
	return /* @__PURE__ */ jsx("select", {
		value,
		onChange: (event) => onChange(event.target.value),
		className: "h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-emerald-400",
		children
	});
}
function RequestItemList({ details }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "overflow-hidden rounded-xl border border-slate-200 bg-white",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-3",
			children: [/* @__PURE__ */ jsx("span", {
				className: "grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600",
				children: /* @__PURE__ */ jsx(Package, { size: 15 })
			}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-xs font-semibold text-slate-800",
				children: "Daftar item request"
			}), /* @__PURE__ */ jsxs("p", {
				className: "mt-0.5 text-[11px] text-slate-400",
				children: [details.length, " item dalam pengajuan ini"]
			})] })]
		}), /* @__PURE__ */ jsx("div", {
			className: "grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3",
			children: details.map((detail) => /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-4 bg-white px-4 py-3.5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate text-xs font-semibold text-slate-800",
						children: detail.item?.name
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-[11px] text-slate-400",
						children: [
							detail.item?.code,
							" ·",
							" ",
							detail.uom?.code || detail.item?.base_uom
						]
					})]
				}), /* @__PURE__ */ jsx("span", {
					className: "shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700",
					children: Number(detail.qty_requested).toLocaleString("id-ID")
				})]
			}, detail.id))
		})]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DYH_DNA6.js.map