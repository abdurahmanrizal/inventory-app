import { t as cn } from "./utils-DAgvUY2L.js";
import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as SearchableItemSelect } from "./searchable-item-select-3UmoD7Bb.js";
import { Head, router } from "@inertiajs/react";
import { useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { AlertTriangle, ArchiveX, ArrowDownToLine, ArrowUpFromLine, Banknote, BookOpenText, Boxes, CalendarDays, ChartNoAxesCombined, ChevronLeft, ChevronRight, ClipboardCheck, Download, Filter, Layers3, PackageSearch, ReceiptText, Scale, ShieldCheck, TrendingUp, Warehouse } from "lucide-react";
//#region resources/js/components/ui/badge.tsx
var badgeVariants = cva("inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden", {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
		secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
		destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
		outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot : "span", {
		"data-slot": "badge",
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
//#region resources/js/pages/Reports/Index.tsx
var number = (value) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value || 0);
var money = (value) => new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0
}).format(value || 0);
var reports = [
	{
		id: "ledger",
		label: "Kartu Stok",
		hint: "Riwayat masuk dan keluar",
		icon: BookOpenText
	},
	{
		id: "purchase-history",
		label: "Pembelian Persediaan",
		hint: "PO, penerimaan, dan layer biaya",
		icon: ReceiptText
	},
	{
		id: "slow-moving",
		label: "Slow & Dead Stock",
		hint: "Stok tidak bergerak",
		icon: ArchiveX
	},
	{
		id: "opname",
		label: "Hasil Opname",
		hint: "Selisih sistem dan fisik",
		icon: ClipboardCheck
	},
	{
		id: "valuation",
		label: "Nilai Persediaan",
		hint: "Nilai stok dan tren",
		icon: ChartNoAxesCombined
	},
	{
		id: "cost-history",
		label: "Riwayat HPP",
		hint: "Perubahan biaya per item",
		icon: TrendingUp
	},
	{
		id: "financial-movement",
		label: "Mutasi Nilai",
		hint: "Rekonsiliasi nilai stok",
		icon: Scale
	},
	{
		id: "issue-cost",
		label: "Biaya Pengeluaran",
		hint: "HPP dan draft jurnal",
		icon: ReceiptText
	},
	{
		id: "valuation-audit",
		label: "Audit Valuasi",
		hint: "Layer atau average cost",
		icon: Layers3
	},
	{
		id: "anomalies",
		label: "Anomali",
		hint: "Kontrol integritas stok",
		icon: AlertTriangle
	}
];
function SummaryCard({ label, value, icon: Icon, tone = "emerald" }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm",
		children: [/* @__PURE__ */ jsx("div", {
			className: `grid size-11 shrink-0 place-items-center rounded-xl ${{
				emerald: "bg-emerald-50 text-emerald-700",
				blue: "bg-blue-50 text-blue-700",
				amber: "bg-amber-50 text-amber-700",
				rose: "bg-rose-50 text-rose-700"
			}[tone]}`,
			children: /* @__PURE__ */ jsx(Icon, { size: 19 })
		}), /* @__PURE__ */ jsxs("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ jsx("p", {
				className: "truncate text-[11px] font-semibold uppercase tracking-[.1em] text-slate-400",
				children: label
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 truncate text-xl font-semibold text-slate-950",
				children: value
			})]
		})]
	});
}
function Empty({ message = "Belum ada data untuk filter ini." }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ jsx(PackageSearch, { className: "mx-auto text-slate-300" }),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 font-medium text-slate-600",
				children: message
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-slate-400",
				children: "Coba ubah gudang atau periode laporan."
			})
		]
	});
}
function Index({ report, data, filters, warehouses, items, canFilterWarehouse, accessLabel, valuationMethod }) {
	const [form, setForm] = useState({
		...filters,
		report
	});
	const filteredItems = useMemo(() => {
		if (!form.warehouse_id) return items;
		return items.filter((item) => item.warehouse_ids?.some((warehouseId) => String(warehouseId) === String(form.warehouse_id)));
	}, [form.warehouse_id, items]);
	const update = (key, value) => setForm((current) => ({
		...current,
		[key]: value
	}));
	const updateWarehouse = (warehouseId) => setForm((current) => ({
		...current,
		warehouse_id: warehouseId,
		item_id: ""
	}));
	const submit = (event) => {
		event.preventDefault();
		router.get("/reports", form, {
			preserveState: true,
			replace: true
		});
	};
	const switchReport = (id) => {
		const next = {
			...form,
			report: id
		};
		setForm(next);
		router.get("/reports", next, {
			preserveState: true,
			replace: true
		});
	};
	const exportUrl = (format) => {
		const query = new URLSearchParams();
		Object.entries(form).forEach(([key, value]) => {
			if (value !== null && value !== void 0 && value !== "") query.set(key, String(value));
		});
		return `/reports/export/${format}?${query.toString()}`;
	};
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Laporan Persediaan",
		fullWidth: true,
		children: [/* @__PURE__ */ jsx(Head, { title: "Laporan Persediaan" }), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto w-full max-w-[1360px]",
			children: [
				/* @__PURE__ */ jsxs("section", {
					className: "relative overflow-hidden rounded-3xl bg-[#10233f] px-6 py-6 text-white shadow-xl shadow-slate-200 sm:px-8",
					children: [/* @__PURE__ */ jsx("div", { className: "absolute -right-16 -top-24 size-64 rounded-full bg-emerald-400/15 blur-3xl" }), /* @__PURE__ */ jsxs("div", {
						className: "relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs("span", {
								className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs text-emerald-300",
								children: [/* @__PURE__ */ jsx(ShieldCheck, { size: 14 }), accessLabel]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-xs text-slate-300",
								children: [/* @__PURE__ */ jsx(Layers3, { size: 14 }), valuationMethod === "fifo" ? "FIFO" : "Moving Average"]
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "mt-3 text-2xl font-semibold",
								children: "Pusat laporan persediaan"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 max-w-2xl text-sm leading-6 text-slate-400",
								children: "Pilih jenis laporan, tentukan periode, lalu baca ringkasan dan detailnya dalam satu tempat."
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.06] px-4 py-3",
							children: [/* @__PURE__ */ jsx(CalendarDays, {
								size: 20,
								className: "text-emerald-300"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-[10px] uppercase tracking-wider text-slate-400",
								children: ["valuation", "anomalies"].includes(report) || report === "valuation-audit" && valuationMethod === "fifo" ? "Posisi laporan" : "Periode aktif"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm font-medium",
								children: ["valuation", "anomalies"].includes(report) || report === "valuation-audit" && valuationMethod === "fifo" ? "Saat ini" : `${filters.date_from} s/d ${filters.date_to}`
							})] })]
						})]
					})]
				}),
				/* @__PURE__ */ jsx("section", {
					className: "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5",
					children: reports.map((item) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => switchReport(item.id),
						className: `flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${report === item.id ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: `grid size-11 shrink-0 place-items-center rounded-xl ${report === item.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`,
							children: /* @__PURE__ */ jsx(item.icon, { size: 20 })
						}), /* @__PURE__ */ jsxs("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("b", {
								className: "block truncate text-sm text-slate-900",
								children: item.id === "cost-history" && valuationMethod === "fifo" ? "Riwayat HPP FIFO" : item.label
							}), /* @__PURE__ */ jsx("small", {
								className: "mt-0.5 block truncate text-slate-500",
								children: item.id === "cost-history" && valuationMethod === "fifo" ? "Konsumsi layer biaya" : item.hint
							})]
						})]
					}, item.id))
				}),
				/* @__PURE__ */ jsxs("form", {
					onSubmit: submit,
					className: "mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800",
						children: [/* @__PURE__ */ jsx(Filter, {
							size: 17,
							className: "text-emerald-600"
						}), "Filter laporan"]
					}), /* @__PURE__ */ jsxs("div", {
						className: `grid items-end gap-3 md:grid-cols-2 xl:grid-cols-3 ${report === "ledger" || report === "cost-history" ? "2xl:grid-cols-[1.05fr_1.25fr_.9fr_.9fr_.9fr_auto]" : "2xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]"}`,
						children: [
							canFilterWarehouse && /* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Gudang", /* @__PURE__ */ jsx("div", {
									className: "mt-2",
									children: /* @__PURE__ */ jsx(SearchableItemSelect, {
										value: form.warehouse_id || "",
										items: warehouses,
										onChange: updateWarehouse,
										placeholder: "Cari kode atau nama gudang",
										emptyOptionLabel: "Semua gudang",
										entityLabel: "gudang"
									})
								})]
							}),
							[
								"ledger",
								"cost-history",
								"financial-movement",
								"issue-cost",
								"valuation-audit",
								"purchase-history"
							].includes(report) && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Item", /* @__PURE__ */ jsx("div", {
									className: "mt-2",
									children: /* @__PURE__ */ jsx(SearchableItemSelect, {
										value: form.item_id || "",
										items: filteredItems,
										onChange: (value) => update("item_id", value),
										placeholder: form.warehouse_id ? "Cari item di gudang ini" : "Cari item dalam cakupan gudang",
										emptyOptionLabel: "Semua item"
									})
								})]
							}), /* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Batch", /* @__PURE__ */ jsx("input", {
									value: form.batch_no || "",
									onChange: (e) => update("batch_no", e.target.value),
									placeholder: "Semua batch",
									className: "mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
								})]
							})] }),
							report === "purchase-history" && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Supplier", /* @__PURE__ */ jsx("input", {
									value: form.supplier_name || "",
									onChange: (e) => update("supplier_name", e.target.value),
									placeholder: "Cari nama supplier",
									className: "mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
								})]
							}), /* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Nomor / item", /* @__PURE__ */ jsx("input", {
									value: form.search || "",
									onChange: (e) => update("search", e.target.value),
									placeholder: "Stock In, supplier, kode atau item",
									className: "mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
								})]
							})] }),
							report === "slow-moving" ? /* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Tidak bergerak selama", /* @__PURE__ */ jsx("select", {
									value: form.days,
									onChange: (e) => update("days", e.target.value),
									className: "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-emerald-400",
									children: [
										30,
										60,
										90,
										180,
										365
									].map((day) => /* @__PURE__ */ jsxs("option", {
										value: day,
										children: [day, " hari"]
									}, day))
								})]
							}) : !["valuation", "anomalies"].includes(report) && !(report === "valuation-audit" && valuationMethod === "fifo") && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Dari tanggal", /* @__PURE__ */ jsx("input", {
									type: "date",
									value: form.date_from,
									onChange: (e) => update("date_from", e.target.value),
									className: "mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
								})]
							}), /* @__PURE__ */ jsxs("label", {
								className: "text-xs font-semibold text-slate-600",
								children: ["Sampai tanggal", /* @__PURE__ */ jsx("input", {
									type: "date",
									value: form.date_to,
									onChange: (e) => update("date_to", e.target.value),
									className: "mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal outline-none focus:border-emerald-400"
								})]
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "flex flex-wrap items-end gap-2",
								children: [
									/* @__PURE__ */ jsx("button", {
										className: "h-11 whitespace-nowrap rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700",
										children: "Terapkan filter"
									}),
									/* @__PURE__ */ jsxs("a", {
										href: exportUrl("pdf"),
										className: "inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50",
										children: [/* @__PURE__ */ jsx(Download, { size: 16 }), " PDF"]
									}),
									/* @__PURE__ */ jsxs("a", {
										href: exportUrl("xlsx"),
										className: "inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50",
										children: [/* @__PURE__ */ jsx(Download, { size: 16 }), " Excel"]
									})
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6",
					children: [
						report === "ledger" && /* @__PURE__ */ jsx(Ledger, {
							data,
							filters
						}),
						report === "purchase-history" && /* @__PURE__ */ jsx(PurchaseHistory, { data }),
						report === "slow-moving" && /* @__PURE__ */ jsx(SlowMoving, {
							data,
							days: filters.days
						}),
						report === "opname" && /* @__PURE__ */ jsx(Opname, { data }),
						report === "valuation" && /* @__PURE__ */ jsx(Valuation, { data }),
						report === "cost-history" && /* @__PURE__ */ jsx(CostHistory, { data }),
						report === "financial-movement" && /* @__PURE__ */ jsx(FinancialMovement, { data }),
						report === "issue-cost" && /* @__PURE__ */ jsx(IssueCost, { data }),
						report === "valuation-audit" && /* @__PURE__ */ jsx(ValuationAudit, { data }),
						report === "anomalies" && /* @__PURE__ */ jsx(Anomalies, { data })
					]
				})
			]
		})]
	});
}
function PurchaseHistory({ data }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai pembelian diposting",
				value: money(data.summary.totalValue),
				icon: ReceiptText,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Kuantitas diterima",
				value: number(data.summary.qty),
				icon: ArrowDownToLine
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Transaksi Stock In",
				value: number(data.summary.transactions),
				icon: ClipboardCheck,
				tone: "amber"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Supplier",
				value: number(data.summary.suppliers),
				icon: Boxes
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Laporan pembelian persediaan",
		note: data.limited ? "Menampilkan maksimal 1.000 detail; grand total tetap menghitung seluruh data sesuai filter." : `${data.rows.length} detail Stock In ditemukan.`,
		headers: [
			"Stock In / tanggal",
			"Supplier / gudang",
			"Item / batch",
			"Kuantitas",
			"Biaya / nilai",
			"Approval manajer",
			"Waktu posting",
			"Layer FIFO"
		],
		children: data.rows.length ? /* @__PURE__ */ jsxs(Fragment$1, { children: [data.rows.map((row, index) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.transaction_number }), /* @__PURE__ */ jsx("small", { children: row.document_date })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.supplier_name }), /* @__PURE__ */ jsx("small", { children: row.warehouse_name })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item_name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item_code,
					" · ",
					row.batch_no || "Tanpa batch"
				] })] }),
				/* @__PURE__ */ jsxs(Cell, {
					strong: true,
					children: [
						number(row.qty),
						" ",
						row.base_uom
					]
				}),
				/* @__PURE__ */ jsxs(Cell, {
					strong: true,
					children: [/* @__PURE__ */ jsxs("span", { children: [money(row.unit_cost), " / unit"] }), /* @__PURE__ */ jsx("small", { children: money(row.total_value) })]
				}),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.approved_by_name }), /* @__PURE__ */ jsx("small", { children: row.approved_at })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.posted_at }), /* @__PURE__ */ jsxs("small", { children: ["Dibuat oleh ", row.created_by_name] })] }),
				/* @__PURE__ */ jsx(Cell, { children: row.valuation_method === "fifo" ? row.fifo_layer_ids.length ? row.fifo_layer_ids.map((id) => `#${id}`).join(", ") : "Belum terbentuk" : "Tidak berlaku (Moving Average)" })
			]
		}, `${row.detail_id}-${index}`)), /* @__PURE__ */ jsxs("tr", {
			className: "border-t-2 border-emerald-200 bg-emerald-50/70",
			children: [
				/* @__PURE__ */ jsx("td", {
					colSpan: 3,
					className: "px-4 py-4 text-sm font-bold uppercase tracking-[.08em] text-emerald-800",
					children: "Grand Total"
				}),
				/* @__PURE__ */ jsx("td", {
					className: "whitespace-nowrap px-4 py-4 font-bold text-emerald-800",
					children: number(data.summary.qty)
				}),
				/* @__PURE__ */ jsx("td", {
					className: "whitespace-nowrap px-4 py-4 font-bold text-emerald-800",
					children: money(data.summary.totalValue)
				}),
				/* @__PURE__ */ jsx("td", {
					colSpan: 3,
					className: "px-4 py-4 text-right text-xs font-semibold text-emerald-700",
					children: "Seluruh item sesuai filter aktif"
				})
			]
		})] }) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 8 })
	})] });
}
function Ledger({ data, filters }) {
	const [search, setSearch] = useState(filters.search || "");
	const [openIndex, setOpenIndex] = useState(0);
	const debounceRef = useRef(null);
	const pagination = data.pagination || {
		page: 1,
		per_page: 10,
		total: 0,
		last_page: 1
	};
	const goToPage = (page) => {
		router.get("/reports", {
			...filters,
			report: "ledger",
			page
		}, {
			preserveState: true,
			replace: true
		});
	};
	const onSearchChange = (value) => {
		setSearch(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			router.get("/reports", {
				...filters,
				report: "ledger",
				search: value,
				page: 1
			}, {
				preserveState: true,
				replace: true
			});
		}, 400);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Saldo awal",
					value: number(data.summary.opening),
					icon: Boxes,
					tone: "blue"
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Mutasi masuk",
					value: number(data.summary.in),
					icon: ArrowDownToLine
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Mutasi keluar",
					value: number(data.summary.out),
					icon: ArrowUpFromLine,
					tone: "rose"
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Saldo akhir",
					value: number(data.summary.closing),
					icon: Scale,
					tone: "amber"
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-5 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
				className: "font-semibold text-slate-950",
				children: "Kartu Stok"
			}), /* @__PURE__ */ jsxs("p", {
				className: "mt-1 text-sm text-slate-500",
				children: [
					pagination.total,
					" kartu stok ditemukan · hal. ",
					pagination.page,
					" dari ",
					pagination.last_page
				]
			})] }), /* @__PURE__ */ jsxs("div", {
				className: "relative",
				children: [/* @__PURE__ */ jsx(Filter, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" }), /* @__PURE__ */ jsx("input", {
					type: "text",
					value: search,
					onChange: (e) => onSearchChange(e.target.value),
					placeholder: "Cari item atau gudang…",
					className: "w-64 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
				})]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-4 space-y-3",
			children: data.groups.length ? data.groups.map((group, gi) => /* @__PURE__ */ jsx(StockCard, {
				group,
				open: openIndex === gi,
				onToggle: () => setOpenIndex(openIndex === gi ? null : gi)
			}, gi)) : /* @__PURE__ */ jsx("div", {
				className: "rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: /* @__PURE__ */ jsx(Empty, { message: search.trim() ? "Tidak ada kartu stok yang cocok." : void 0 })
			})
		}),
		pagination.last_page > 1 && /* @__PURE__ */ jsxs("div", {
			className: "mt-5 flex items-center justify-center gap-2",
			children: [
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					disabled: pagination.page <= 1,
					onClick: () => goToPage(pagination.page - 1),
					className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40",
					children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "size-4" }), "Sebelumnya"]
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "px-3 text-sm font-medium text-slate-600",
					children: [
						pagination.page,
						" / ",
						pagination.last_page
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					disabled: pagination.page >= pagination.last_page,
					onClick: () => goToPage(pagination.page + 1),
					className: "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40",
					children: ["Berikutnya", /* @__PURE__ */ jsx(ChevronRight, { className: "size-4" })]
				})
			]
		})
	] });
}
function StockCard({ group, open, onToggle }) {
	const uom = group.item.base_uom;
	const rowCount = group.rows.length;
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: onToggle,
			className: "flex w-full flex-wrap items-center justify-between gap-4 bg-slate-50/50 px-5 py-4 text-left transition hover:bg-slate-50",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-x-2.5 gap-y-1",
				children: [
					/* @__PURE__ */ jsx(ChevronRight, { className: `size-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-90" : ""}` }),
					/* @__PURE__ */ jsx(Warehouse, { className: "size-4 text-slate-400" }),
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-slate-900",
						children: group.warehouse.name
					}),
					/* @__PURE__ */ jsx(Badge, {
						variant: "secondary",
						className: "bg-slate-200/70 text-slate-700",
						children: group.warehouse.code
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-slate-300",
						children: "·"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-slate-900",
						children: group.item.name
					}),
					/* @__PURE__ */ jsx(Badge, {
						variant: "outline",
						className: "border-slate-300 bg-slate-100 text-slate-600",
						children: group.item.code
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "text-xs text-slate-400",
						children: [rowCount, " mutasi"]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-4 text-sm",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "text-right",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs text-slate-500",
							children: "Saldo awal"
						}), /* @__PURE__ */ jsxs("div", {
							className: "font-semibold text-slate-700",
							children: [
								number(group.opening_qty),
								" ",
								uom
							]
						})]
					}),
					/* @__PURE__ */ jsx("div", { className: "h-8 w-px bg-slate-200" }),
					/* @__PURE__ */ jsxs("div", {
						className: "text-right",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-xs text-slate-500",
							children: "Saldo akhir"
						}), /* @__PURE__ */ jsxs("div", {
							className: "font-semibold text-slate-700",
							children: [
								number(group.subtotal.closing_qty),
								" ",
								uom
							]
						})]
					})
				]
			})]
		}), open && /* @__PURE__ */ jsx("div", {
			className: "max-w-full overflow-x-auto border-t border-slate-100",
			children: /* @__PURE__ */ jsxs("table", {
				className: "w-full min-w-[860px] table-auto text-sm",
				children: [
					/* @__PURE__ */ jsx("thead", {
						className: "border-b border-slate-100 text-left text-[11px] uppercase tracking-[.1em] text-slate-500",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-5 py-2.5 font-medium",
								children: "Tanggal"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 font-medium",
								children: "Referensi"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 font-medium",
								children: "Keterangan"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 font-medium",
								children: "Batch"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 text-right font-medium",
								children: "Masuk"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 text-right font-medium",
								children: "Keluar"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 text-right font-medium",
								children: "Saldo"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-4 py-2.5 font-medium",
								children: "Petugas"
							})
						] })
					}),
					/* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-50",
						children: rowCount ? group.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
							className: "hover:bg-slate-50/70",
							children: [
								/* @__PURE__ */ jsxs("td", {
									className: "whitespace-nowrap px-5 py-3 text-slate-600",
									children: [/* @__PURE__ */ jsx("div", {
										className: "font-medium text-slate-800",
										children: row.date?.slice(0, 10)
									}), /* @__PURE__ */ jsx("div", {
										className: "text-xs text-slate-400",
										children: row.date?.slice(11)
									})]
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 font-medium text-slate-700",
									children: row.reference
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 text-slate-500",
									children: row.movement_note || "—"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 text-slate-500",
									children: row.batch_no || /* @__PURE__ */ jsx("span", {
										className: "text-slate-400",
										children: "—"
									})
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-emerald-600",
									children: row.qty_in ? number(row.qty_in) : "—"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-rose-600",
									children: row.qty_out ? number(row.qty_out) : "—"
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-slate-800",
									children: number(row.balance_qty)
								}),
								/* @__PURE__ */ jsx("td", {
									className: "whitespace-nowrap px-4 py-3 text-slate-500",
									children: row.creator || "—"
								})
							]
						}, row.id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 8,
							className: "px-5 py-8 text-center text-slate-400",
							children: "Tidak ada mutasi pada periode ini."
						}) })
					}),
					/* @__PURE__ */ jsx("tfoot", {
						className: "border-t-2 border-slate-100 bg-slate-50/80",
						children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsxs("td", {
								colSpan: 4,
								className: "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
								children: ["Subtotal ", group.item.name]
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-right font-semibold tabular-nums text-emerald-700",
								children: number(group.subtotal.in)
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-right font-semibold tabular-nums text-rose-700",
								children: number(group.subtotal.out)
							}),
							/* @__PURE__ */ jsx("td", {
								className: "px-4 py-3 text-right font-bold tabular-nums text-slate-900",
								children: number(group.subtotal.closing_qty)
							}),
							/* @__PURE__ */ jsx("td", {})
						] })
					})
				]
			})
		})]
	});
}
function SlowMoving({ data, days }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Item terpantau",
				value: number(data.summary.items),
				icon: Boxes,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Slow moving",
				value: number(data.summary.slow),
				icon: PackageSearch,
				tone: "amber"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: `Dead stock ≥ ${days} hari`,
				value: number(data.summary.dead),
				icon: ArchiveX,
				tone: "rose"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai stok tertahan",
				value: money(data.summary.value),
				icon: Banknote
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Item yang jarang bergerak",
		note: "Urutan dimulai dari item yang paling lama tidak bergerak.",
		headers: [
			"Gudang",
			"Item",
			"Stok",
			"Mutasi terakhir",
			"Tidak bergerak",
			"Status",
			"Nilai stok"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.warehouse.name }), /* @__PURE__ */ jsx("small", { children: row.warehouse.code })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item.code,
					" · ",
					row.item.base_uom
				] })] }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.qty)
				}),
				/* @__PURE__ */ jsx(Cell, { children: row.last_movement_at || "Belum pernah bergerak" }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: row.inactive_days === null ? "Belum pernah" : `${number(row.inactive_days)} hari`
				}),
				/* @__PURE__ */ jsx(Cell, { children: /* @__PURE__ */ jsx("span", {
					className: `rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "dead" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`,
					children: row.status === "dead" ? "Dead stock" : "Slow moving"
				}) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: money(row.value)
				})
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 7 })
	})] });
}
function Opname({ data }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Sesi opname",
				value: number(data.summary.sessions),
				icon: ClipboardCheck,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Item dihitung",
				value: number(data.summary.counted),
				icon: Boxes
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Item berselisih",
				value: number(data.summary.different),
				icon: Scale,
				tone: "rose"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai selisih bersih",
				value: money(data.summary.differenceValue),
				icon: Banknote,
				tone: "amber"
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Hasil stok opname",
		note: `${data.rows.length} detail perhitungan fisik ditemukan.`,
		headers: [
			"Tanggal / nomor",
			"Gudang",
			"Item / batch",
			"Sistem",
			"Fisik",
			"Selisih",
			"Metode / biaya",
			"Nilai selisih",
			"Dilakukan oleh"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.opname_date }), /* @__PURE__ */ jsx("small", { children: row.number })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.warehouse_name }), /* @__PURE__ */ jsx("small", { children: row.warehouse_code })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item_name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item_code,
					" · ",
					row.batch_no || "Tanpa batch"
				] })] }),
				/* @__PURE__ */ jsx(Cell, { children: number(row.system_qty) }),
				/* @__PURE__ */ jsx(Cell, { children: number(row.count_qty) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					tone: row.diff_qty < 0 ? "rose" : row.diff_qty > 0 ? "emerald" : void 0,
					children: number(row.diff_qty)
				}),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.valuation_method === "fifo" ? "FIFO" : "Moving Average" }), /* @__PURE__ */ jsxs("small", { children: [money(row.valuation_cost), " / unit"] })] }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: money(row.difference_value)
				}),
				/* @__PURE__ */ jsx(Cell, { children: row.creator_name })
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 9 })
	})] });
}
function Valuation({ data }) {
	const maxTrend = Math.max(...data.trend.map((row) => row.value), 1);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Total nilai stok",
					value: money(data.summary.value),
					icon: Banknote
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Total kuantitas",
					value: number(data.summary.qty),
					icon: Boxes,
					tone: "blue"
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Gudang tercakup",
					value: number(data.summary.warehouses),
					icon: Warehouse,
					tone: "amber"
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Kategori aktif",
					value: number(data.summary.categories),
					icon: PackageSearch,
					tone: "rose"
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-6 grid gap-6 xl:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
				children: [
					/* @__PURE__ */ jsx("h3", {
						className: "font-semibold text-slate-950",
						children: "Tren nilai persediaan"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-slate-500",
						children: "Posisi nilai pada akhir setiap bulan dari kartu stok."
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-8 flex h-56 items-end gap-3",
						children: data.trend.map((row) => /* @__PURE__ */ jsxs("div", {
							className: "flex h-full flex-1 flex-col justify-end text-center",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "mb-2 hidden text-[10px] font-semibold text-slate-500 sm:block",
									children: money(row.value)
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mx-auto w-full max-w-14 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-300",
									style: { height: `${Math.max(row.value / maxTrend * 100, 3)}%` }
								}),
								/* @__PURE__ */ jsx("span", {
									className: "mt-2 text-[10px] text-slate-500",
									children: row.label
								})
							]
						}, row.label))
					})
				]
			}), /* @__PURE__ */ jsx(Breakdown, {
				title: "Nilai per gudang",
				rows: data.warehouses
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-6",
			children: /* @__PURE__ */ jsx(Breakdown, {
				title: "Nilai per kategori item",
				rows: data.categories
			})
		})
	] });
}
function CostHistory({ data }) {
	if (data.method === "fifo") return /* @__PURE__ */ jsx(FifoCostHistory, { data });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Penerimaan tercatat",
				value: number(data.summary.events),
				icon: ArrowDownToLine,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "HPP berubah",
				value: number(data.summary.changes),
				icon: TrendingUp
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "HPP terbaru",
				value: money(data.summary.latestCost),
				icon: Banknote,
				tone: "amber"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Rata-rata perubahan",
				value: money(data.summary.averageChange),
				icon: Scale,
				tone: data.summary.averageChange < 0 ? "rose" : "emerald"
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Riwayat perubahan HPP",
		note: data.limited ? "Menampilkan maksimal 500 penerimaan pertama." : `${data.rows.length} penerimaan stok ditemukan.`,
		headers: [
			"Tanggal",
			"Gudang",
			"Item / batch",
			"Referensi",
			"Qty masuk",
			"Harga masuk",
			"Harga sebelum",
			"Harga setelah",
			"Perubahan",
			"Petugas"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsx(Cell, { children: row.date }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.warehouse.name }), /* @__PURE__ */ jsx("small", { children: row.warehouse.code })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item.code,
					" · ",
					row.batch_no || "Tanpa batch"
				] })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.reference }), /* @__PURE__ */ jsx("small", { children: row.supplier || "Tanpa supplier" })] }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.incoming_qty)
				}),
				/* @__PURE__ */ jsx(Cell, { children: money(row.incoming_cost) }),
				/* @__PURE__ */ jsx(Cell, { children: money(row.cost_before) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: money(row.cost_after)
				}),
				/* @__PURE__ */ jsxs(Cell, {
					strong: true,
					tone: row.difference > 0 ? "rose" : row.difference < 0 ? "emerald" : void 0,
					children: [/* @__PURE__ */ jsxs("span", { children: [row.difference > 0 ? "+" : "", money(row.difference)] }), /* @__PURE__ */ jsx("small", { children: row.percentage === null ? "Harga awal" : `${row.percentage > 0 ? "+" : ""}${number(row.percentage)}%` })]
				}),
				/* @__PURE__ */ jsx(Cell, { children: row.creator || "-" })
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 10 })
	})] });
}
function FifoCostHistory({ data }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Dokumen keluar",
				value: number(data.summary.issues),
				icon: ReceiptText,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Alokasi layer",
				value: number(data.summary.allocations),
				icon: Layers3
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Qty dikonsumsi",
				value: number(data.summary.qty),
				icon: Boxes,
				tone: "amber"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Total biaya FIFO",
				value: money(data.summary.totalCost),
				icon: Banknote,
				tone: "rose"
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Riwayat konsumsi layer FIFO",
		note: data.limited ? "Menampilkan maksimal 1.000 alokasi layer pertama." : "Setiap baris menunjukkan layer biaya yang dikonsumsi oleh transaksi keluar.",
		headers: [
			"Tanggal keluar",
			"Gudang",
			"Item / batch",
			"Referensi keluar",
			"Layer sumber",
			"Qty awal layer",
			"Qty dipakai",
			"Sisa layer",
			"Biaya unit",
			"Total biaya",
			"Petugas"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsx(Cell, { children: row.date }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.warehouse.name }), /* @__PURE__ */ jsx("small", { children: row.warehouse.code })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item.code,
					" · ",
					row.batch_no || "Tanpa batch"
				] })] }),
				/* @__PURE__ */ jsx(Cell, { children: row.issue_reference }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.layer_id ? `Layer #${row.layer_id}` : "Layer lama" }), /* @__PURE__ */ jsxs("small", { children: [
					row.layer_received_at || "Tanggal tidak tersedia",
					" · ",
					row.layer_reference
				] })] }),
				/* @__PURE__ */ jsx(Cell, { children: number(row.layer_original_qty) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.consumed_qty)
				}),
				/* @__PURE__ */ jsx(Cell, { children: row.layer_balance_qty === null ? "-" : number(row.layer_balance_qty) }),
				/* @__PURE__ */ jsx(Cell, { children: money(row.unit_cost) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: money(row.total_cost)
				}),
				/* @__PURE__ */ jsx(Cell, { children: row.creator || "-" })
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 11 })
	})] });
}
function FinancialMovement({ data }) {
	const difference = data.summary.difference;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-5",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai awal",
				value: money(data.summary.openingValue),
				icon: Banknote,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai masuk",
				value: money(data.summary.incomingValue),
				icon: ArrowDownToLine
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai keluar",
				value: money(data.summary.outgoingValue),
				icon: ArrowUpFromLine,
				tone: "rose"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai akhir ledger",
				value: money(data.summary.closingValue),
				icon: Scale,
				tone: "amber"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Selisih rekonsiliasi",
				value: difference === null ? "Hanya posisi hari ini" : money(difference),
				icon: difference !== null && Math.abs(difference) >= 1 ? AlertTriangle : ShieldCheck,
				tone: difference !== null && Math.abs(difference) >= 1 ? "rose" : "emerald"
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Mutasi nilai persediaan",
		note: `Metode ${data.valuation_method === "fifo" ? "FIFO" : "Moving Average"}. Nilai akhir = nilai awal + masuk - keluar berdasarkan waktu posting ledger.`,
		headers: [
			"Gudang",
			"Item",
			"Qty masuk",
			"Nilai masuk",
			"Qty keluar",
			"Nilai keluar",
			"Perubahan bersih"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.warehouse.name }), /* @__PURE__ */ jsx("small", { children: row.warehouse.code })] }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item.code,
					" · ",
					row.item.base_uom
				] })] }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.qty_in)
				}),
				/* @__PURE__ */ jsx(Cell, { children: money(row.value_in) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.qty_out)
				}),
				/* @__PURE__ */ jsx(Cell, { children: money(row.value_out) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					tone: row.net_value < 0 ? "rose" : "emerald",
					children: money(row.net_value)
				})
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 7 })
	})] });
}
function IssueCost({ data }) {
	const classificationLabel = {
		internal_transfer: "Transfer internal",
		adjustment: "Adjustment",
		expense: "HPP / pemakaian"
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Dokumen",
					value: number(data.summary.transactions),
					icon: ReceiptText,
					tone: "blue"
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Total biaya keluar",
					value: money(data.summary.totalCost),
					icon: Banknote
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Transfer internal",
					value: money(data.summary.internalCost),
					icon: Warehouse,
					tone: "amber"
				}),
				/* @__PURE__ */ jsx(SummaryCard, {
					label: "Potensi HPP / beban",
					value: money(data.summary.expenseCost),
					icon: ArrowUpFromLine,
					tone: "rose"
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800",
			children: "Draft jurnal adalah usulan klasifikasi. Transfer internal tidak dibebankan ke HPP; akun final tetap harus dipetakan oleh finance."
		}),
		/* @__PURE__ */ jsx(ReportTable, {
			title: "Biaya pengeluaran dan draft jurnal",
			note: data.limited ? "Menampilkan maksimal 1.000 baris." : `${data.rows.length} alokasi biaya ditemukan.`,
			headers: [
				"Tanggal",
				"Gudang",
				"Referensi",
				"Item / batch",
				"Qty",
				"Biaya unit",
				"Total",
				"Klasifikasi",
				"Draft jurnal"
			],
			children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
				className: "hover:bg-slate-50/70",
				children: [
					/* @__PURE__ */ jsx(Cell, { children: row.date }),
					/* @__PURE__ */ jsx(Cell, { children: row.warehouse.name }),
					/* @__PURE__ */ jsx(Cell, { children: row.reference }),
					/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", { children: [
						row.item.code,
						" · ",
						row.batch_no || "Tanpa batch"
					] })] }),
					/* @__PURE__ */ jsx(Cell, {
						strong: true,
						children: number(row.qty)
					}),
					/* @__PURE__ */ jsx(Cell, { children: money(row.unit_cost) }),
					/* @__PURE__ */ jsx(Cell, {
						strong: true,
						children: money(row.total_cost)
					}),
					/* @__PURE__ */ jsx(Cell, { children: /* @__PURE__ */ jsx("span", {
						className: "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600",
						children: classificationLabel[row.classification]
					}) }),
					/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsxs("b", { children: ["Db ", row.journal_debit] }), /* @__PURE__ */ jsxs("small", { children: ["Cr ", row.journal_credit] })] })
				]
			}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 9 })
		})
	] });
}
function ValuationAudit({ data }) {
	if (data.method !== "fifo") return /* @__PURE__ */ jsx(CostHistory, { data });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Layer aktif",
				value: number(data.summary.layers),
				icon: Layers3,
				tone: "blue"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Qty tersisa",
				value: number(data.summary.qty),
				icon: Boxes
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Nilai layer",
				value: money(data.summary.value),
				icon: Banknote,
				tone: "amber"
			}),
			/* @__PURE__ */ jsx(SummaryCard, {
				label: "Layer > 90 hari",
				value: number(data.summary.oldLayers),
				icon: ArchiveX,
				tone: "rose"
			})
		]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Audit layer FIFO tersisa",
		note: "Urutan layer mengikuti tanggal penerimaan paling lama. Nilai layer adalah qty tersisa × biaya unit.",
		headers: [
			"Tanggal masuk",
			"Gudang",
			"Item / batch",
			"Referensi",
			"Qty awal",
			"Qty tersisa",
			"Biaya unit",
			"Nilai tersisa",
			"Umur"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-slate-50/70",
			children: [
				/* @__PURE__ */ jsx(Cell, { children: row.date }),
				/* @__PURE__ */ jsx(Cell, { children: row.warehouse.name }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", { children: [
					row.item.code,
					" · ",
					row.batch_no || "Tanpa batch"
				] })] }),
				/* @__PURE__ */ jsx(Cell, { children: row.reference }),
				/* @__PURE__ */ jsx(Cell, { children: number(row.original_qty) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.remaining_qty)
				}),
				/* @__PURE__ */ jsx(Cell, { children: money(row.unit_cost) }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: money(row.remaining_value)
				}),
				/* @__PURE__ */ jsxs(Cell, { children: [number(row.age_days), " hari"] })
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 9 })
	})] });
}
function Anomalies({ data }) {
	const labels = {
		negative_stock: "Stok negatif",
		zero_cost_stock: "Biaya nol",
		fifo_mismatch: "Selisih layer FIFO",
		zero_cost_movement: "Mutasi biaya nol"
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
		children: [/* @__PURE__ */ jsx(SummaryCard, {
			label: "Total anomali",
			value: number(data.summary.issues),
			icon: AlertTriangle,
			tone: data.summary.issues ? "rose" : "emerald"
		}), /* @__PURE__ */ jsx(SummaryCard, {
			label: "Prioritas tinggi",
			value: number(data.summary.high),
			icon: ShieldCheck,
			tone: data.summary.high ? "rose" : "emerald"
		})]
	}), /* @__PURE__ */ jsx(ReportTable, {
		title: "Kontrol integritas persediaan",
		note: data.summary.issues ? "Anomali harus ditinjau sebelum periode ditutup." : "Tidak ditemukan anomali pada saldo persediaan saat ini.",
		headers: [
			"Jenis",
			"Gudang",
			"Item / batch",
			"Qty",
			"Nilai",
			"Keterangan"
		],
		children: data.rows.length ? data.rows.map((row) => /* @__PURE__ */ jsxs("tr", {
			className: "hover:bg-rose-50/30",
			children: [
				/* @__PURE__ */ jsx(Cell, { children: /* @__PURE__ */ jsx("span", {
					className: "rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700",
					children: labels[row.type] || row.type
				}) }),
				/* @__PURE__ */ jsx(Cell, { children: row.warehouse?.name || "-" }),
				/* @__PURE__ */ jsxs(Cell, { children: [/* @__PURE__ */ jsx("b", { children: row.item?.name || "-" }), /* @__PURE__ */ jsxs("small", { children: [
					row.item?.code || "-",
					" · ",
					row.batch_no || "Tanpa batch"
				] })] }),
				/* @__PURE__ */ jsx(Cell, {
					strong: true,
					children: number(row.qty)
				}),
				/* @__PURE__ */ jsx(Cell, { children: money(row.value) }),
				/* @__PURE__ */ jsx(Cell, { children: row.message })
			]
		}, row.id)) : /* @__PURE__ */ jsx(EmptyRow, { colSpan: 6 })
	})] });
}
function Breakdown({ title, rows }) {
	const maximum = Math.max(...rows.map((row) => row.value), 1);
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "font-semibold text-slate-950",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-5 space-y-5",
			children: rows.length ? rows.map((row) => /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-2 flex items-center justify-between gap-4 text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-medium text-slate-700",
						children: row.name
					}), /* @__PURE__ */ jsx("span", {
						className: "whitespace-nowrap font-semibold text-slate-950",
						children: money(row.value)
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "h-2 overflow-hidden rounded-full bg-slate-100",
					children: /* @__PURE__ */ jsx("div", {
						className: "h-full rounded-full bg-emerald-500",
						style: { width: `${row.value / maximum * 100}%` }
					})
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-1 text-xs text-slate-400",
					children: [number(row.qty), " unit"]
				})
			] }, row.name)) : /* @__PURE__ */ jsx(Empty, {})
		})]
	});
}
function ReportTable({ title, note, headers, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-5 min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "border-b border-slate-100 px-5 py-4",
			children: [/* @__PURE__ */ jsx("h3", {
				className: "font-semibold text-slate-950",
				children: title
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-slate-500",
				children: note
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "max-w-full overflow-x-auto",
			children: /* @__PURE__ */ jsxs("table", {
				className: "w-full min-w-[1080px] table-auto text-sm",
				children: [/* @__PURE__ */ jsx("thead", {
					className: "bg-slate-50/80 text-left text-[11px] uppercase tracking-[.1em] text-slate-500",
					children: /* @__PURE__ */ jsx("tr", { children: headers.map((header) => /* @__PURE__ */ jsx("th", {
						className: "whitespace-nowrap px-4 py-3",
						children: header
					}, header)) })
				}), /* @__PURE__ */ jsx("tbody", {
					className: "divide-y divide-slate-100",
					children
				})]
			})
		})]
	});
}
function Cell({ children, strong, tone, align }) {
	return /* @__PURE__ */ jsx("td", {
		className: `whitespace-nowrap px-4 py-3.5 [&_b]:block [&_b]:max-w-52 [&_b]:truncate [&_small]:mt-1 [&_small]:block [&_small]:max-w-52 [&_small]:truncate [&_small]:text-xs [&_small]:font-normal [&_small]:text-slate-400 ${align === "right" ? "text-right tabular-nums" : ""} ${strong ? `font-semibold ${tone === "rose" ? "text-rose-600" : tone === "emerald" ? "text-emerald-600" : "text-slate-700"}` : "text-slate-600"}`,
		children
	});
}
function EmptyRow({ colSpan }) {
	return /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
		colSpan,
		children: /* @__PURE__ */ jsx(Empty, {})
	}) });
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DXjGAOq9.js.map