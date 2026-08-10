import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as formatDateTime } from "./date-TP9tjpoO.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { ArrowDownToLine, ArrowUpFromLine, Banknote, History, Search, SlidersHorizontal } from "lucide-react";
//#region resources/js/pages/TransactionActivity/Index.tsx
var number = (value) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value);
var money = (value) => new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0
}).format(value);
var input = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50";
var referenceLabel = {
	opening: "Saldo Awal",
	goods_receipt: "Goods Receipt",
	delivery: "Pengiriman",
	receipt: "Penerimaan Unit",
	adjustment: "Pemakaian / Adjustment",
	stock_in: "Stok Masuk",
	stock_out: "Stok Keluar"
};
function Index({ activities, warehouses, canFilterWarehouse, activeWarehouse, filters, summary }) {
	const [form, setForm] = useState({
		warehouse_id: filters.warehouse_id || "",
		direction: filters.direction || "",
		reference_type: filters.reference_type || "",
		date_from: filters.date_from || "",
		date_to: filters.date_to || "",
		search: filters.search || ""
	});
	const submit = (event) => {
		event.preventDefault();
		router.get("/transaction-activities", Object.fromEntries(Object.entries(form).filter(([, value]) => value)), {
			preserveState: true,
			replace: true
		});
	};
	const reset = () => {
		setForm({
			warehouse_id: "",
			direction: "",
			reference_type: "",
			date_from: "",
			date_to: "",
			search: ""
		});
		router.get("/transaction-activities");
	};
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Riwayat Aktivitas",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Riwayat Aktivitas" }),
			/* @__PURE__ */ jsx("section", {
				className: "mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white sm:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col justify-between gap-5 lg:flex-row lg:items-end",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2 rounded-full bg-white/[.08] px-3 py-1.5 text-xs text-emerald-300",
							children: [/* @__PURE__ */ jsx(History, { size: 14 }), " Audit pergerakan persediaan"]
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-4 text-2xl font-semibold",
							children: "Riwayat aktivitas transaksi"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 max-w-2xl text-sm text-slate-400",
							children: "Setiap stok masuk dan keluar tercatat beserta gudang, item, pengguna, referensi, saldo akhir, dan waktu aktivitas."
						})
					] }), !canFilterWarehouse && activeWarehouse && /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-xs text-slate-400",
							children: "Ruang lingkup manajer"
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm font-semibold",
							children: activeWarehouse.name
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					[
						"Total aktivitas",
						number(summary.count),
						History,
						"bg-blue-50 text-blue-600"
					],
					[
						"Stok masuk",
						number(summary.qtyIn),
						ArrowDownToLine,
						"bg-emerald-50 text-emerald-600"
					],
					[
						"Stok keluar",
						number(summary.qtyOut),
						ArrowUpFromLine,
						"bg-rose-50 text-rose-600"
					],
					[
						"Nilai pergerakan",
						money(summary.value),
						Banknote,
						"bg-amber-50 text-amber-600"
					]
				].map(([label, value, Icon, tone]) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: `grid size-10 place-items-center rounded-xl ${tone}`,
							children: /* @__PURE__ */ jsx(Icon, { size: 19 })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-xs font-semibold uppercase tracking-[.12em] text-slate-400",
							children: label
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xl font-semibold text-slate-950",
							children: value
						})
					]
				}, label))
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(SlidersHorizontal, {
						size: 18,
						className: "text-emerald-600"
					}), /* @__PURE__ */ jsx("h3", {
						className: "font-semibold text-slate-900",
						children: "Filter aktivitas"
					})]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: submit,
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
					children: [
						canFilterWarehouse && /* @__PURE__ */ jsxs("select", {
							className: input,
							value: form.warehouse_id,
							onChange: (e) => setForm({
								...form,
								warehouse_id: e.target.value
							}),
							children: [/* @__PURE__ */ jsx("option", {
								value: "",
								children: "Semua gudang / unit"
							}), warehouses.map((x) => /* @__PURE__ */ jsx("option", {
								value: x.id,
								children: x.name
							}, x.id))]
						}),
						/* @__PURE__ */ jsxs("select", {
							className: input,
							value: form.direction,
							onChange: (e) => setForm({
								...form,
								direction: e.target.value
							}),
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua arah"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "in",
									children: "Stok masuk"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "out",
									children: "Stok keluar"
								})
							]
						}),
						/* @__PURE__ */ jsxs("select", {
							className: input,
							value: form.reference_type,
							onChange: (e) => setForm({
								...form,
								reference_type: e.target.value
							}),
							children: [
								/* @__PURE__ */ jsx("option", {
									value: "",
									children: "Semua aktivitas"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "goods_receipt",
									children: "Goods Receipt"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "delivery",
									children: "Pengiriman"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "receipt",
									children: "Penerimaan Unit"
								}),
								/* @__PURE__ */ jsx("option", {
									value: "adjustment",
									children: "Adjustment"
								})
							]
						}),
						/* @__PURE__ */ jsx("input", {
							type: "date",
							className: input,
							value: form.date_from,
							onChange: (e) => setForm({
								...form,
								date_from: e.target.value
							})
						}),
						/* @__PURE__ */ jsx("input", {
							type: "date",
							className: input,
							value: form.date_to,
							onChange: (e) => setForm({
								...form,
								date_to: e.target.value
							})
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Search, {
								size: 15,
								className: "absolute left-3 top-3 text-slate-400"
							}), /* @__PURE__ */ jsx("input", {
								className: `${input} pl-9`,
								placeholder: "Item, batch, nomor...",
								value: form.search,
								onChange: (e) => setForm({
									...form,
									search: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex gap-2 xl:col-span-6",
							children: [/* @__PURE__ */ jsx("button", {
								className: "rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white",
								children: "Terapkan filter"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: reset,
								className: "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600",
								children: "Reset"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: activities.data.length ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "min-w-full text-sm",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50 text-left text-[11px] uppercase tracking-[.1em] text-slate-500",
							children: /* @__PURE__ */ jsx("tr", { children: [
								"Waktu",
								"Gudang / unit",
								"Aktivitas",
								"Item / batch",
								"Stok awal",
								"Perubahan",
								"HPP",
								"Nilai transaksi",
								"Saldo akhir",
								"Pelaksana"
							].map((x) => /* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-5 py-3.5",
								children: x
							}, x)) })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100",
							children: activities.data.map((row) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50/70",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 text-slate-500",
										children: formatDateTime(row.created_at)
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "px-5 py-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold text-slate-800",
											children: row.warehouse?.name
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-1 text-xs text-slate-400",
											children: row.warehouse?.code
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "px-5 py-4",
										children: [/* @__PURE__ */ jsxs("span", {
											className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${row.direction === "in" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`,
											children: [
												row.direction === "in" ? /* @__PURE__ */ jsx(ArrowDownToLine, { size: 13 }) : /* @__PURE__ */ jsx(ArrowUpFromLine, { size: 13 }),
												" ",
												referenceLabel[row.reference_type || row.stock_transaction?.type] || "Transaksi stok"
											]
										}), /* @__PURE__ */ jsxs("p", {
											className: "mt-1 text-xs text-slate-400",
											children: [row.stock_transaction?.number || `Referensi #${row.reference_id || "-"}`, row.stock_transaction?.status === "cancelled" && " · Dibatalkan"]
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "px-5 py-4",
										children: [/* @__PURE__ */ jsx("p", {
											className: "font-semibold text-slate-800",
											children: row.item?.name
										}), /* @__PURE__ */ jsxs("p", {
											className: "mt-1 text-xs text-slate-400",
											children: [
												row.item?.code,
												" · ",
												row.batch_no || "Tanpa batch"
											]
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-5 py-4 font-semibold text-slate-700",
										children: number(row.direction === "in" ? Number(row.balance_qty) - Number(row.qty) : Number(row.balance_qty) + Number(row.qty))
									}),
									/* @__PURE__ */ jsxs("td", {
										className: `px-5 py-4 font-semibold ${row.direction === "in" ? "text-emerald-600" : "text-rose-600"}`,
										children: [row.direction === "in" ? "+" : "-", number(Number(row.qty))]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4",
										children: money(Number(row.unit_cost))
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 font-semibold text-slate-700",
										children: money(Number(row.qty) * Number(row.unit_cost))
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-5 py-4 font-semibold",
										children: number(Number(row.balance_qty))
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-5 py-4 text-slate-600",
										children: row.creator?.name || "-"
									})
								]
							}, row.id))
						})]
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4",
					children: activities.links.map((link, index) => /* @__PURE__ */ jsx(Link, {
						href: link.url || "#",
						preserveScroll: true,
						className: `rounded-lg px-3 py-1.5 text-xs font-semibold ${link.active ? "bg-emerald-500 text-white" : link.url ? "border border-slate-200 text-slate-600" : "text-slate-300"}`,
						dangerouslySetInnerHTML: { __html: link.label }
					}, index))
				})] }) : /* @__PURE__ */ jsxs("div", {
					className: "px-6 py-16 text-center",
					children: [
						/* @__PURE__ */ jsx(History, { className: "mx-auto text-slate-300" }),
						/* @__PURE__ */ jsx("p", {
							className: "mt-3 font-medium text-slate-600",
							children: "Belum ada aktivitas"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-slate-400",
							children: "Aktivitas stok yang sudah diposting akan muncul di sini."
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DnZS-cCZ.js.map