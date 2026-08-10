import { i as DropdownMenuItem, n as DropdownMenuContent, s as DropdownMenuTrigger, t as DropdownMenu } from "./dropdown-menu-Dez2j4dN.js";
import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as formatDateTime } from "./date-TP9tjpoO.js";
import { Head, Link } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, Banknote, Boxes, ChevronDown, ClipboardCheck, PackageMinus, PackagePlus, Sparkles, TriangleAlert } from "lucide-react";
//#region resources/js/components/StatCard.jsx
function StatCard({ label, value, icon: Icon, helper, tone = "emerald" }) {
	const tones = {
		emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
		blue: "bg-blue-50 text-blue-700 ring-blue-100",
		amber: "bg-amber-50 text-amber-700 ring-amber-100",
		rose: "bg-rose-50 text-rose-700 ring-rose-100"
	};
	return /* @__PURE__ */ jsx("article", {
		className: "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between gap-4",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium text-slate-500",
						children: label
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 truncate text-2xl font-semibold tracking-tight text-slate-950",
						children: value
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-xs leading-5 text-slate-400",
						children: helper
					})
				]
			}), /* @__PURE__ */ jsx("span", {
				className: `rounded-xl p-3 ring-1 ${tones[tone] || tones.emerald}`,
				children: /* @__PURE__ */ jsx(Icon, {
					size: 21,
					strokeWidth: 1.8
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/pages/Dashboard/Index.tsx
var money = (value) => new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0
}).format(value);
var statusStyle = (status = "") => {
	const normalized = status.toLowerCase();
	if (normalized.includes("approved") || normalized.includes("posted")) return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
	if (normalized.includes("reject")) return "bg-rose-50 text-rose-700 ring-rose-600/10";
	if (normalized.includes("waiting_approval")) return "bg-amber-50 text-amber-700 ring-amber-600/10";
	return "bg-green-50 text-green-700 ring-green-600/10";
};
var referenceStatusLabel = {
	waiting_approval: "Menunggu Approval",
	rejected: "Ditolak",
	completed: "Selesai",
	approved: "Disetujui",
	received: "Diterima Unit",
	delivering: "Dalam Pengiriman",
	cancelled: "Dibatalkan"
};
var referenceLabel = {
	stock_in: "Stok Masuk",
	stock_out: "Stok Keluar",
	transfer: "Mutasi",
	stock_request: "Request Stok Unit"
};
function Index({ stats, recent, scopeLabel, quickActions, financeSummary }) {
	const today = new Intl.DateTimeFormat("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}).format(/* @__PURE__ */ new Date());
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Dashboard",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Dashboard" }),
			/* @__PURE__ */ jsxs("section", {
				className: "relative mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white shadow-[0_20px_55px_rgba(15,35,63,0.18)] sm:px-8 sm:py-8",
				children: [
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-16 -top-28 size-72 rounded-full bg-emerald-400/20 blur-3xl" }),
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute bottom-0 right-1/4 size-40 rounded-full bg-blue-400/10 blur-3xl" }),
					/* @__PURE__ */ jsxs("div", {
						className: "relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs("div", {
								className: "mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs text-slate-300",
								children: [/* @__PURE__ */ jsx(Sparkles, {
									size: 14,
									className: "text-emerald-400"
								}), scopeLabel]
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl",
								children: financeSummary ? "Pantau nilai dan rekonsiliasi persediaan." : "Pantau pergerakan stok dengan lebih cepat."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 max-w-xl text-sm leading-6 text-slate-400",
								children: financeSummary ? "Ringkasan keuangan persediaan seluruh gudang berdasarkan metode valuasi aktif." : "Ringkasan hanya menampilkan persediaan dan transaksi yang berkaitan dengan cakupan akun Anda."
							})
						] }), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col items-start gap-3 sm:flex-row sm:items-center",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-xs capitalize text-slate-400 sm:mr-2",
								children: today
							}), (quickActions.stockIn || quickActions.stockOut || quickActions.stockRequest) && /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ jsxs("button", {
									type: "button",
									className: "inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/25 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300",
									children: ["Buat Transaksi", /* @__PURE__ */ jsx(ChevronDown, { size: 16 })]
								})
							}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
								align: "end",
								className: "w-48 rounded-xl border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl",
								children: [
									quickActions.stockIn && /* @__PURE__ */ jsx(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ jsxs(Link, {
											href: "/stock-transactions?type=stock_in",
											className: "cursor-pointer rounded-lg px-3 py-2.5 focus:bg-emerald-50 focus:text-emerald-700",
											children: [/* @__PURE__ */ jsx(PackagePlus, { size: 16 }), "Buat Stock In"]
										})
									}),
									quickActions.stockOut && /* @__PURE__ */ jsx(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ jsxs(Link, {
											href: "/stock-transactions?type=stock_out",
											className: "cursor-pointer rounded-lg px-3 py-2.5 focus:bg-rose-50 focus:text-rose-700",
											children: [/* @__PURE__ */ jsx(PackageMinus, { size: 16 }), "Buat Stock Out"]
										})
									}),
									quickActions.stockRequest && /* @__PURE__ */ jsx(DropdownMenuItem, {
										asChild: true,
										children: /* @__PURE__ */ jsxs(Link, {
											href: "/operations/fulfillment",
											className: "cursor-pointer rounded-lg px-3 py-2.5 focus:bg-blue-50 focus:text-blue-700",
											children: [/* @__PURE__ */ jsx(Boxes, { size: 16 }), "Request Stok Unit"]
										})
									})
								]
							})] })]
						})]
					})
				]
			}),
			financeSummary ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("section", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						label: "Total Nilai Persediaan",
						value: money(financeSummary.inventoryValue),
						helper: `Metode ${financeSummary.valuationMethod === "fifo" ? "FIFO" : "Moving Average"}`,
						icon: Banknote,
						tone: "emerald"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Biaya Pengeluaran",
						value: money(financeSummary.outgoingCost),
						helper: `Periode ${financeSummary.periodLabel}`,
						icon: PackageMinus,
						tone: "blue"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Selisih Rekonsiliasi",
						value: money(financeSummary.reconciliationDifference),
						helper: "Nilai operasional dibanding ledger",
						icon: ClipboardCheck,
						tone: "amber"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Anomali Persediaan",
						value: financeSummary.anomalyCount,
						helper: "Perlu ditinjau oleh tim terkait",
						icon: TriangleAlert,
						tone: "rose"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Metode Valuasi Aktif",
						value: financeSummary.valuationMethod === "fifo" ? "FIFO" : "Moving Average",
						helper: "Berlaku untuk satu company",
						icon: Boxes,
						tone: "emerald"
					})
				]
			}), /* @__PURE__ */ jsxs("section", {
				className: "mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "font-semibold text-slate-950",
						children: "Nilai persediaan per gudang"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-slate-500",
						children: "Ringkasan seluruh gudang dan unit."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
					children: financeSummary.warehouseValues.map((warehouse) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-slate-100 bg-slate-50/70 p-4",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-sm font-semibold text-slate-800",
								children: warehouse.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-lg font-semibold text-emerald-700",
								children: money(warehouse.value)
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-xs text-slate-500",
								children: [Number(warehouse.qty).toLocaleString("id-ID"), " unit stok"]
							})
						]
					}, warehouse.name))
				})]
			})] }) : /* @__PURE__ */ jsxs("section", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						label: "Nilai Persediaan",
						value: money(stats.stockValue),
						helper: "Berdasarkan metode valuasi aktif",
						icon: Banknote,
						tone: "emerald"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Total Stok",
						value: Number(stats.stockQty).toLocaleString("id-ID"),
						helper: `Sesuai cakupan: ${scopeLabel}`,
						icon: Boxes,
						tone: "blue"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Menunggu Approval",
						value: stats.pendingApproval,
						helper: "Pengajuan terkait yang masih menunggu",
						icon: ClipboardCheck,
						tone: "amber"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Stok Tidak Tersedia",
						value: stats.lowStock,
						helper: "Saldo telah terpakai oleh reservasi",
						icon: TriangleAlert,
						tone: "rose"
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
						className: "font-semibold tracking-tight text-slate-950",
						children: "Transaksi terbaru"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-slate-500",
						children: "Aktivitas persediaan yang terakhir diperbarui."
					})] }), /* @__PURE__ */ jsxs(Link, {
						href: financeSummary ? "/transaction-activities" : quickActions.stockRequest ? "/operations/fulfillment" : "/stock-transactions",
						className: "inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition hover:text-emerald-600",
						children: ["Lihat semua ", /* @__PURE__ */ jsx(ArrowRight, { size: 16 })]
					})]
				}), recent.length ? /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "min-w-full text-sm",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", {
							className: "border-b border-slate-100 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500",
							children: [
								"Nomor transaksi",
								"Tipe",
								"Pergerakan gudang",
								"Status",
								"Tanggal"
							].map((heading) => /* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-5 py-3.5 first:pl-6 last:pr-6",
								children: heading
							}, heading))
						}) }), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100",
							children: recent.map((transaction) => /* @__PURE__ */ jsxs("tr", {
								className: "transition hover:bg-slate-50/70",
								children: [
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 pl-6 font-semibold text-slate-900",
										children: transaction.number
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 text-slate-600",
										children: referenceLabel[transaction.type] || "-"
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "whitespace-nowrap px-5 py-4 text-slate-600",
										children: [
											/* @__PURE__ */ jsx("span", { children: transaction.source_warehouse?.name || "-" }),
											/* @__PURE__ */ jsx(ArrowRight, {
												size: 14,
												className: "mx-2 inline text-slate-300"
											}),
											/* @__PURE__ */ jsx("span", { children: transaction.destination_warehouse?.name || "-" })
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4",
										children: /* @__PURE__ */ jsx("span", {
											className: `inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle(transaction.status)}`,
											children: referenceStatusLabel[transaction.status] || "-"
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 pr-6 text-slate-500",
										children: formatDateTime(transaction.date)
									})
								]
							}, transaction.id))
						})]
					})
				}) : /* @__PURE__ */ jsxs("div", {
					className: "px-6 py-14 text-center",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400",
							children: /* @__PURE__ */ jsx(Boxes, { size: 22 })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 font-medium text-slate-700",
							children: "Belum ada transaksi"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-slate-500",
							children: "Transaksi terbaru akan muncul di sini."
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-CcMJiST1.js.map