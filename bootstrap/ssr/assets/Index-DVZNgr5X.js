import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BRHxsiws.js";
import { t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as SearchableItemSelect } from "./searchable-item-select-3UmoD7Bb.js";
import { Head, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Banknote, Boxes, Layers3, PackageCheck, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Warehouse, X } from "lucide-react";
//#region resources/js/pages/WarehouseStock/Index.tsx
var number = (value) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value);
var money = (value) => new Intl.NumberFormat("id-ID", {
	style: "currency",
	currency: "IDR",
	maximumFractionDigits: 0
}).format(value);
function Index({ stocks, warehouses, selectedWarehouse, canFilterWarehouse, accessLabel, summary, valuationMethod }) {
	const [search, setSearch] = useState("");
	const [selectedItem, setSelectedItem] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdatedAt, setLastUpdatedAt] = useState(() => /* @__PURE__ */ new Date());
	const [layerStock, setLayerStock] = useState(null);
	const refreshInProgress = useRef(false);
	const refreshStocks = useCallback(() => {
		if (refreshInProgress.current || document.visibilityState !== "visible" || !navigator.onLine) return;
		refreshInProgress.current = true;
		setIsRefreshing(true);
		router.reload({
			only: ["stocks", "summary"],
			onSuccess: () => setLastUpdatedAt(/* @__PURE__ */ new Date()),
			onFinish: () => {
				refreshInProgress.current = false;
				setIsRefreshing(false);
			}
		});
	}, []);
	useEffect(() => {
		const interval = window.setInterval(refreshStocks, 3e4);
		const refreshWhenActive = () => {
			if (document.visibilityState === "visible") refreshStocks();
		};
		document.addEventListener("visibilitychange", refreshWhenActive);
		window.addEventListener("online", refreshStocks);
		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", refreshWhenActive);
			window.removeEventListener("online", refreshStocks);
		};
	}, [refreshStocks]);
	const itemOptions = useMemo(() => {
		const items = /* @__PURE__ */ new Map();
		stocks.forEach((row) => items.set(String(row.item.id), row.item));
		return Array.from(items.values()).sort((first, second) => first.name.localeCompare(second.name, "id"));
	}, [stocks]);
	const rows = useMemo(() => {
		const keyword = search.trim().toLowerCase();
		return stocks.filter((row) => {
			const matchesItem = !selectedItem || String(row.item.id) === selectedItem;
			const matchesSearch = !keyword || `${row.item.code} ${row.item.name} ${row.batch_no || ""} ${row.warehouse.name}`.toLowerCase().includes(keyword);
			return matchesItem && matchesSearch;
		});
	}, [
		stocks,
		search,
		selectedItem
	]);
	const hasActiveFilters = Boolean(search || selectedItem);
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Stok Gudang",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Stok Gudang" }),
			/* @__PURE__ */ jsxs("section", {
				className: "relative z-20 mb-6 rounded-3xl bg-[#10233f] px-6 py-7 text-white shadow-xl shadow-slate-200 sm:px-8",
				children: [/* @__PURE__ */ jsx("div", { className: "absolute -right-16 -top-24 size-64 rounded-full bg-emerald-400/15 blur-3xl" }), /* @__PURE__ */ jsxs("div", {
					className: "relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs text-emerald-300",
							children: [/* @__PURE__ */ jsx(ShieldCheck, { size: 14 }), accessLabel]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-xs text-slate-300",
							children: [
								/* @__PURE__ */ jsx(Layers3, { size: 14 }),
								"Valuasi: ",
								valuationMethod === "fifo" ? "FIFO" : "Moving Average"
							]
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-4 text-2xl font-semibold",
							children: "Saldo persediaan terkini"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 max-w-xl text-sm text-slate-400",
							children: "Pantau stok fisik, reservasi, saldo tersedia, batch, kedaluwarsa, dan nilai persediaan."
						})
					] }), canFilterWarehouse && /* @__PURE__ */ jsxs("div", {
						className: "w-full rounded-2xl border border-white/10 bg-white/[.06] p-3 backdrop-blur-sm lg:w-80",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-2 flex items-center justify-between gap-3 px-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-semibold uppercase tracking-[.12em] text-slate-300",
								children: "Cakupan gudang"
							}), /* @__PURE__ */ jsxs("span", {
								className: "rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300",
								children: [warehouses.length, " lokasi"]
							})]
						}), /* @__PURE__ */ jsx(SearchableItemSelect, {
							value: selectedWarehouse ? String(selectedWarehouse) : "",
							items: warehouses,
							onChange: (value) => router.get("/warehouse-stocks", value ? { warehouse_id: value } : {}, {
								preserveState: true,
								replace: true
							}),
							placeholder: "Cari gudang atau unit",
							emptyOptionLabel: "Semua gudang dalam cakupan",
							entityLabel: "gudang"
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					[
						"Baris stok",
						number(summary.items),
						Boxes,
						"bg-blue-50 text-blue-600"
					],
					[
						"Stok fisik",
						number(summary.onHand),
						Warehouse,
						"bg-emerald-50 text-emerald-600"
					],
					[
						"Tersedia",
						number(summary.available),
						PackageCheck,
						"bg-violet-50 text-violet-600"
					],
					[
						"Nilai persediaan",
						money(summary.value),
						Banknote,
						"bg-amber-50 text-amber-600"
					]
				].map(([label, value, Icon, tone]) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm",
					children: [
						/* @__PURE__ */ jsx("div", {
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
				className: "mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm",
				children: [/* @__PURE__ */ jsx("div", {
					className: "border-b border-slate-100 px-5 py-5 sm:px-6",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600",
									children: /* @__PURE__ */ jsx(SlidersHorizontal, { size: 16 })
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "font-semibold text-slate-950",
									children: "Detail stok per batch"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
									children: [/* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-emerald-500" }), "Update otomatis 30 detik"]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500",
							children: [
								/* @__PURE__ */ jsxs("span", { children: [
									"Menampilkan ",
									rows.length,
									" dari ",
									stocks.length,
									" baris persediaan."
								] }),
								/* @__PURE__ */ jsx("span", {
									className: "hidden text-slate-300 sm:inline",
									children: "•"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs",
									children: [
										"Diperbarui",
										" ",
										lastUpdatedAt.toLocaleTimeString("id-ID", {
											day: "2-digit",
											month: "2-digit",
											year: "2-digit",
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit"
										})
									]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									disabled: isRefreshing,
									onClick: refreshStocks,
									className: "inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-600 disabled:cursor-wait disabled:opacity-50",
									children: [/* @__PURE__ */ jsx(RefreshCw, {
										size: 13,
										className: isRefreshing ? "animate-spin" : ""
									}), isRefreshing ? "Memperbarui…" : "Refresh sekarang"]
								})
							]
						})] }), /* @__PURE__ */ jsxs("div", {
							className: "flex w-full flex-col gap-3 sm:flex-row xl:w-auto",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "block sm:min-w-72",
									children: [/* @__PURE__ */ jsx("span", {
										className: "mb-2 block text-xs font-semibold text-slate-600",
										children: "Filter berdasarkan item"
									}), /* @__PURE__ */ jsx(SearchableItemSelect, {
										value: selectedItem,
										items: itemOptions,
										onChange: setSelectedItem,
										placeholder: "Cari kode atau nama item",
										emptyOptionLabel: "Semua item"
									})]
								}),
								/* @__PURE__ */ jsxs("label", {
									className: "block sm:min-w-72",
									children: [/* @__PURE__ */ jsx("span", {
										className: "mb-2 block text-xs font-semibold text-slate-600",
										children: "Pencarian cepat"
									}), /* @__PURE__ */ jsxs("span", {
										className: "relative block",
										children: [/* @__PURE__ */ jsx(Search, {
											size: 17,
											className: "pointer-events-none absolute left-3.5 top-3 text-slate-400"
										}), /* @__PURE__ */ jsx("input", {
											value: search,
											onChange: (event) => setSearch(event.target.value),
											placeholder: "Cari batch atau gudang...",
											className: "h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
										})]
									})]
								}),
								hasActiveFilters && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => {
										setSearch("");
										setSelectedItem("");
									},
									className: "inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600",
									children: [/* @__PURE__ */ jsx(X, { size: 16 }), " Reset"]
								})
							]
						})]
					})
				}), rows.length ? /* @__PURE__ */ jsx("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ jsxs("table", {
						className: "min-w-full text-sm",
						children: [/* @__PURE__ */ jsx("thead", {
							className: "bg-slate-50/80 text-left text-[11px] uppercase tracking-[.1em] text-slate-500",
							children: /* @__PURE__ */ jsx("tr", { children: [
								"Gudang / lokasi",
								"Item",
								"Batch / kedaluwarsa",
								"Stok fisik",
								"Reservasi",
								"Tersedia",
								"Biaya / HPP",
								"Nilai"
							].map((header) => /* @__PURE__ */ jsx("th", {
								className: "whitespace-nowrap px-5 py-3.5",
								children: header
							}, header)) })
						}), /* @__PURE__ */ jsx("tbody", {
							className: "divide-y divide-slate-100",
							children: rows.map((row) => /* @__PURE__ */ jsxs("tr", {
								className: "hover:bg-slate-50/70",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "px-5 py-4",
										children: [/* @__PURE__ */ jsx("b", { children: row.warehouse.name }), /* @__PURE__ */ jsx("small", {
											className: "mt-1 block text-slate-400",
											children: row.location ? `${row.location.code} · ${row.location.name}` : "Lokasi belum ditentukan"
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "px-5 py-4",
										children: [/* @__PURE__ */ jsx("b", { children: row.item.name }), /* @__PURE__ */ jsxs("small", {
											className: "mt-1 block text-slate-400",
											children: [
												row.item.code,
												" · ",
												row.item.base_uom
											]
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "whitespace-nowrap px-5 py-4 text-slate-600",
										children: [row.batch_no || "-", /* @__PURE__ */ jsx("small", {
											className: "mt-1 block text-slate-400",
											children: row.expired_at || "Tanpa kedaluwarsa"
										})]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-5 py-4 font-semibold",
										children: number(row.qty_on_hand)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-5 py-4 text-amber-600",
										children: number(row.qty_reserved)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "px-5 py-4",
										children: /* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2.5 py-1 text-xs font-semibold ${row.qty_available <= 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`,
											children: number(row.qty_available)
										})
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "whitespace-nowrap px-5 py-4",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "block",
												children: money(row.average_cost)
											}),
											/* @__PURE__ */ jsx("small", {
												className: "mt-1 block text-slate-400",
												children: valuationMethod === "fifo" ? "Rata-rata layer tersisa" : "Rata-rata berjalan"
											}),
											valuationMethod === "fifo" && /* @__PURE__ */ jsxs("button", {
												type: "button",
												onClick: () => setLayerStock(row),
												className: "mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-800",
												children: [
													/* @__PURE__ */ jsx(Layers3, { size: 13 }),
													" Lihat ",
													row.cost_layers.length,
													" layer"
												]
											})
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 font-semibold",
										children: money(row.stock_value)
									})
								]
							}, row.id))
						})]
					})
				}) : /* @__PURE__ */ jsxs("div", {
					className: "px-6 py-16 text-center",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400",
							children: /* @__PURE__ */ jsx(Boxes, { size: 21 })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-3 font-medium text-slate-700",
							children: "Stok tidak ditemukan"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-slate-500",
							children: "Coba ubah pilihan item atau kata kunci pencarian."
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: Boolean(layerStock),
				onOpenChange: (open) => !open && setLayerStock(null),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-w-4xl overflow-hidden border-slate-200 bg-white p-0 shadow-xl",
					children: [/* @__PURE__ */ jsxs(DialogHeader, {
						className: "border-b border-slate-100 bg-slate-50/60 px-6 py-5",
						children: [/* @__PURE__ */ jsxs(DialogTitle, {
							className: "flex items-center gap-2 text-slate-800",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-8 place-items-center rounded-lg bg-slate-200/70 text-slate-600",
								children: /* @__PURE__ */ jsx(Layers3, { size: 16 })
							}), "Layer biaya FIFO"]
						}), /* @__PURE__ */ jsxs(DialogDescription, { children: [
							layerStock?.item.name,
							" · ",
							layerStock?.warehouse.name,
							" · Batch ",
							layerStock?.batch_no || "-"
						] })]
					}), /* @__PURE__ */ jsx("div", {
						className: "max-h-[60vh] overflow-auto",
						children: /* @__PURE__ */ jsxs("table", {
							className: "min-w-full text-sm",
							children: [
								/* @__PURE__ */ jsx("thead", {
									className: "sticky top-0 bg-slate-50 text-left text-[11px] uppercase tracking-[.1em] text-slate-500",
									children: /* @__PURE__ */ jsx("tr", { children: [
										"Tanggal masuk",
										"Referensi",
										"Qty awal",
										"Qty tersisa",
										"Biaya unit",
										"Nilai tersisa"
									].map((header) => /* @__PURE__ */ jsx("th", {
										className: "whitespace-nowrap px-5 py-3",
										children: header
									}, header)) })
								}),
								/* @__PURE__ */ jsx("tbody", {
									className: "divide-y divide-slate-100",
									children: layerStock?.cost_layers.map((layer) => /* @__PURE__ */ jsxs("tr", {
										className: "transition-colors hover:bg-slate-50/70",
										children: [
											/* @__PURE__ */ jsx("td", {
												className: "whitespace-nowrap px-5 py-4 text-slate-600",
												children: layer.received_at ? new Date(layer.received_at).toLocaleString("id-ID", {
													dateStyle: "medium",
													timeStyle: "short"
												}) : "-"
											}),
											/* @__PURE__ */ jsxs("td", {
												className: "whitespace-nowrap px-5 py-4 text-slate-600",
												children: [
													layer.reference_type || "-",
													" ",
													layer.reference_id ? `#${layer.reference_id}` : ""
												]
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-5 py-4",
												children: number(layer.original_qty)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "px-5 py-4 font-semibold text-slate-700",
												children: number(layer.remaining_qty)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "whitespace-nowrap px-5 py-4",
												children: money(layer.unit_cost)
											}),
											/* @__PURE__ */ jsx("td", {
												className: "whitespace-nowrap px-5 py-4 font-semibold",
												children: money(layer.value)
											})
										]
									}, layer.id))
								}),
								/* @__PURE__ */ jsx("tfoot", {
									className: "border-t border-slate-200 bg-slate-50 font-semibold",
									children: /* @__PURE__ */ jsxs("tr", { children: [
										/* @__PURE__ */ jsx("td", {
											colSpan: 3,
											className: "px-5 py-4 text-right",
											children: "Total layer tersisa"
										}),
										/* @__PURE__ */ jsx("td", {
											className: "px-5 py-4 text-slate-700",
											children: number(layerStock?.cost_layers.reduce((total, layer) => total + layer.remaining_qty, 0) || 0)
										}),
										/* @__PURE__ */ jsx("td", {}),
										/* @__PURE__ */ jsx("td", {
											className: "whitespace-nowrap px-5 py-4",
											children: money(layerStock?.cost_layers.reduce((total, layer) => total + layer.value, 0) || 0)
										})
									] })
								})
							]
						})
					})]
				})
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-DVZNgr5X.js.map