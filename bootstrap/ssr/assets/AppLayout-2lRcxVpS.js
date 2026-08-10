import { n as DropdownMenuContent, s as DropdownMenuTrigger, t as DropdownMenu } from "./dropdown-menu-Dez2j4dN.js";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BRHxsiws.js";
import { Link, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import "clsx";
import { AlertTriangle, Bell, Building2, ChartNoAxesCombined, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, ClipboardCheck, History, KeyRound, LayoutDashboard, LoaderCircle, LogOut, MapPin, Menu, PackageMinus, PackagePlus, PackageSearch, Ruler, Settings, ShieldCheck, SlidersHorizontal, Truck, UsersRound, Warehouse, Wifi, WifiOff, X, XCircle } from "lucide-react";
//#region resources/js/components/confirm-action-dialog.tsx
function ConfirmActionDialog({ open, onOpenChange, onConfirm, title, description, confirmLabel = "Ya, lanjutkan", processing = false, tone = "emerald", cancelLabel = "Batal" }) {
	const styles = {
		emerald: {
			Icon: CheckCircle2,
			icon: "bg-emerald-50 text-emerald-600",
			button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100",
			label: "Konfirmasi tindakan"
		},
		amber: {
			Icon: AlertTriangle,
			icon: "bg-amber-50 text-amber-600",
			button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-100",
			label: "Perlu konfirmasi"
		},
		rose: {
			Icon: ShieldCheck,
			icon: "bg-rose-50 text-rose-600",
			button: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-100",
			label: "Tindakan penting"
		}
	}[tone];
	const Icon = styles.Icon;
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[440px]",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "px-6 pb-6 pt-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-5 flex items-start gap-3.5",
					children: [/* @__PURE__ */ jsx("span", {
						className: `grid size-10 shrink-0 place-items-center rounded-xl ${styles.icon}`,
						children: /* @__PURE__ */ jsx(Icon, {
							size: 19,
							strokeWidth: 2
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 pr-6",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400",
							children: styles.label
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs leading-5 text-slate-500",
							children: "Pastikan informasi sudah sesuai sebelum melanjutkan."
						})]
					})]
				}), /* @__PURE__ */ jsxs(DialogHeader, {
					className: "gap-2 text-left",
					children: [/* @__PURE__ */ jsx(DialogTitle, {
						className: "pr-6 text-lg leading-6 tracking-tight text-slate-950",
						children: title
					}), /* @__PURE__ */ jsx(DialogDescription, {
						className: "text-sm leading-6 text-slate-500",
						children: description
					})]
				})]
			}), /* @__PURE__ */ jsxs(DialogFooter, {
				className: "gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: processing,
					onClick: () => onOpenChange(false),
					className: "inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:min-w-24",
					children: cancelLabel
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					disabled: processing,
					onClick: onConfirm,
					className: `inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-wait disabled:opacity-60 sm:min-w-32 ${styles.button}`,
					children: [processing && /* @__PURE__ */ jsx(LoaderCircle, {
						size: 16,
						className: "animate-spin"
					}), processing ? "Sedang memproses..." : confirmLabel]
				})]
			})]
		})
	});
}
//#endregion
//#region resources/js/components/notification-menu.jsx
var eventStyle = {
	approval_required: [ClipboardCheck, "bg-amber-50 text-amber-600"],
	request_fully_approved: [CheckCheck, "bg-emerald-50 text-emerald-600"],
	request_rejected: [XCircle, "bg-rose-50 text-rose-600"]
};
function NotificationMenu({ notifications, role, mainWarehouses = [] }) {
	const [feed, setFeed] = useState(notifications || {
		unread_count: 0,
		items: []
	});
	const requestRef = useRef(null);
	const unreadCount = Number(feed?.unread_count || 0);
	const items = feed?.items || [];
	const [activeWarehouse, setActiveWarehouse] = useState("all");
	const showWarehouseTabs = role === "warehouse_manager" && mainWarehouses.length > 0;
	const visibleItems = activeWarehouse === "all" ? items : items.filter((notification) => String(notification.data?.main_warehouse_id) === activeWarehouse);
	const warehouseCount = (warehouseId) => items.filter((notification) => String(notification.data?.main_warehouse_id) === String(warehouseId)).length;
	const refreshNotifications = useCallback(async () => {
		if (document.visibilityState !== "visible" || !navigator.onLine || requestRef.current) return;
		const controller = new AbortController();
		requestRef.current = controller;
		try {
			const response = await fetch("/notifications", {
				headers: { Accept: "application/json" },
				credentials: "same-origin",
				signal: controller.signal
			});
			if (response.ok) setFeed(await response.json());
		} catch (error) {
			if (error.name !== "AbortError") console.warn("Notifikasi belum dapat diperbarui.", error);
		} finally {
			if (requestRef.current === controller) requestRef.current = null;
		}
	}, []);
	useEffect(() => {
		setFeed(notifications || {
			unread_count: 0,
			items: []
		});
	}, [notifications]);
	useEffect(() => {
		const interval = window.setInterval(refreshNotifications, 3e4);
		const refreshWhenVisible = () => {
			if (document.visibilityState === "visible") refreshNotifications();
		};
		document.addEventListener("visibilitychange", refreshWhenVisible);
		window.addEventListener("online", refreshNotifications);
		return () => {
			window.clearInterval(interval);
			document.removeEventListener("visibilitychange", refreshWhenVisible);
			window.removeEventListener("online", refreshNotifications);
			requestRef.current?.abort();
		};
	}, [refreshNotifications]);
	const openNotification = (notification) => {
		const actionUrl = notification.data?.action_url || "/stock-requests";
		if (notification.read_at) {
			router.visit(actionUrl);
			return;
		}
		router.patch(`/notifications/${notification.id}/read`, {}, {
			preserveScroll: true,
			onSuccess: () => router.visit(actionUrl)
		});
	};
	return /* @__PURE__ */ jsxs(DropdownMenu, {
		onOpenChange: (isOpen) => isOpen && refreshNotifications(),
		children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsxs("button", {
				type: "button",
				"aria-label": `Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ""}`,
				className: "relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600",
				children: [/* @__PURE__ */ jsx(Bell, { size: 18 }), unreadCount > 0 && /* @__PURE__ */ jsx("span", {
					className: "absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white",
					children: unreadCount > 99 ? "99+" : unreadCount
				})]
			})
		}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
			align: "end",
			sideOffset: 10,
			className: "w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:w-[390px]",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between border-b border-slate-100 px-4 py-3.5",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-semibold text-slate-900",
						children: "Notifikasi"
					}), /* @__PURE__ */ jsxs("p", {
						className: "mt-0.5 text-[11px] text-slate-500",
						children: [unreadCount, " notifikasi belum dibaca"]
					})] }), unreadCount > 0 && /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => router.patch("/notifications/read-all", {}, {
							preserveScroll: true,
							onSuccess: refreshNotifications
						}),
						className: "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50",
						children: [/* @__PURE__ */ jsx(CheckCheck, { size: 14 }), " Tandai semua dibaca"]
					})]
				}),
				showWarehouseTabs && /* @__PURE__ */ jsx("div", {
					className: "border-b border-slate-100 bg-slate-50/70 px-3 py-2.5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm",
						children: [/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setActiveWarehouse("all"),
							className: `flex-1 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${activeWarehouse === "all" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`,
							children: ["Semua ", /* @__PURE__ */ jsx("span", {
								className: "ml-1 opacity-75",
								children: items.length
							})]
						}), mainWarehouses.map((warehouse) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setActiveWarehouse(String(warehouse.id)),
							className: `flex-1 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${activeWarehouse === String(warehouse.id) ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`,
							children: [
								warehouse.name.replace("Gudang Utama ", ""),
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "ml-1 opacity-75",
									children: warehouseCount(warehouse.id)
								})
							]
						}, warehouse.id))]
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "max-h-[420px] overflow-y-auto",
					children: visibleItems.length ? visibleItems.map((notification) => {
						const [Icon, tone] = eventStyle[notification.data?.event] || [Bell, "bg-blue-50 text-blue-600"];
						return /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => openNotification(notification),
							className: `flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-0 hover:bg-slate-50 ${notification.read_at ? "bg-white" : "bg-emerald-50/35"}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: `grid size-9 shrink-0 place-items-center rounded-xl ${tone}`,
								children: /* @__PURE__ */ jsx(Icon, { size: 16 })
							}), /* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ jsx("span", {
											className: "flex-1 text-xs font-semibold text-slate-800",
											children: notification.data?.title || "Notifikasi workflow"
										}), !notification.read_at && /* @__PURE__ */ jsx("span", { className: "mt-1 size-2 shrink-0 rounded-full bg-emerald-500" })]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "mt-1 block text-xs leading-5 text-slate-500",
										children: notification.data?.message
									}),
									/* @__PURE__ */ jsx("span", {
										className: "mt-1.5 block text-[10px] font-medium text-slate-400",
										children: notification.created_at ? new Date(notification.created_at).toLocaleString("id-ID", {
											dateStyle: "medium",
											timeStyle: "short"
										}) : ""
									})
								]
							})]
						}, notification.id);
					}) : /* @__PURE__ */ jsxs("div", {
						className: "px-6 py-12 text-center",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "mx-auto grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-400",
								children: /* @__PURE__ */ jsx(Bell, { size: 19 })
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-3 text-sm font-medium text-slate-700",
								children: activeWarehouse === "all" ? "Belum ada notifikasi" : "Belum ada notifikasi gudang ini"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-slate-400",
								children: "Update approval request akan tampil di sini."
							})
						]
					})
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/layouts/AppLayout.jsx
var subscribeOnlineStatus = (callback) => {
	window.addEventListener("online", callback);
	window.addEventListener("offline", callback);
	return () => {
		window.removeEventListener("online", callback);
		window.removeEventListener("offline", callback);
	};
};
var getOnlineStatus = () => navigator.onLine;
var getServerOnlineStatus = () => true;
var links = [
	[
		"Dashboard",
		"/dashboard",
		LayoutDashboard,
		(url) => url.startsWith("/dashboard")
	],
	[
		"Stok Gudang",
		"/warehouse-stocks",
		Warehouse,
		(url) => url.startsWith("/warehouse-stocks")
	],
	[
		"Stock In",
		"/stock-transactions?type=stock_in",
		PackagePlus,
		(url) => url.startsWith("/stock-transactions") && (!url.includes("type=") || url.includes("type=stock_in"))
	],
	[
		"Stock Out / Mutasi",
		"/stock-transactions?type=transfer",
		PackageMinus,
		(url) => url.startsWith("/stock-transactions") && !url.includes("type=stock_in")
	],
	[
		"Master Supplier",
		"/operations/master-data?master=supplier",
		Building2,
		(url) => url.startsWith("/operations/master-data") && (!url.includes("master=") || url.includes("master=supplier"))
	],
	[
		"Master Item",
		"/operations/master-data?master=item",
		PackageSearch,
		(url) => url.startsWith("/operations/master-data") && url.includes("master=item")
	],
	[
		"Master Gudang",
		"/warehouse-management",
		Warehouse,
		(url) => url.startsWith("/warehouse-management")
	],
	[
		"Master Lokasi",
		"/operations/master-data?master=location",
		MapPin,
		(url) => url.startsWith("/operations/master-data") && url.includes("master=location")
	],
	[
		"Master Satuan",
		"/operations/master-data?master=uom",
		Ruler,
		(url) => url.startsWith("/operations/master-data") && url.includes("master=uom")
	],
	[
		"Request Stok Unit",
		"/operations/fulfillment",
		Truck,
		(url) => url.startsWith("/operations/fulfillment")
	],
	[
		"Opname & Adjustment",
		"/operations/inventory-control",
		SlidersHorizontal,
		(url) => url.startsWith("/operations/inventory-control")
	],
	[
		"Approval",
		"/approvals",
		ClipboardCheck,
		(url) => url.startsWith("/approvals")
	],
	[
		"Manajemen User",
		"/user-management",
		UsersRound,
		(url) => url.startsWith("/user-management")
	],
	[
		"Manajemen Akses",
		"/access-management",
		KeyRound,
		(url) => url.startsWith("/access-management") || url.startsWith("/role-management") || url.startsWith("/permission-management")
	],
	[
		"Laporan Persediaan",
		"/reports",
		ChartNoAxesCombined,
		(url) => url.startsWith("/reports")
	],
	[
		"Riwayat Aktivitas",
		"/transaction-activities",
		History,
		(url) => url.startsWith("/transaction-activities")
	],
	[
		"Pengaturan Valuasi",
		"/settings/inventory-valuation",
		Settings,
		(url) => url.startsWith("/settings/inventory-valuation")
	]
];
function AppLayout({ children, title, fullWidth = false }) {
	const [open, setOpen] = useState(false);
	const [logoutOpen, setLogoutOpen] = useState(false);
	const [loggingOut, setLoggingOut] = useState(false);
	const [accessOpen, setAccessOpen] = useState(null);
	const online = useSyncExternalStore(subscribeOnlineStatus, getOnlineStatus, getServerOnlineStatus);
	const { url, props } = usePage();
	const user = props.auth?.user;
	const role = user?.role || "superadmin";
	const permissions = props.auth?.permissions || [];
	const hasPermission = (permission) => role === "superadmin" || permissions.includes(permission);
	const approvalScope = props.approvalScope || {
		main: [],
		counts: {}
	};
	const canManageWarehouse = [
		"superadmin",
		"warehouse_admin_dry",
		"warehouse_admin_wet"
	].includes(role);
	const canCreateStockTransaction = [
		"superadmin",
		"warehouse_admin_dry",
		"warehouse_admin_wet"
	].includes(role);
	const canCreateStockOut = canCreateStockTransaction || role === "unit_user";
	const canApprove = [
		"superadmin",
		"unit_manager",
		"warehouse_manager",
		"warehouse_admin_dry",
		"warehouse_admin_wet"
	].includes(role);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#f6f8fb] text-slate-900",
		children: [
			/* @__PURE__ */ jsxs("aside", {
				className: `fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden bg-[#0b1526] text-white shadow-2xl shadow-slate-950/10 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`,
				children: [
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_65%)]" }),
					/* @__PURE__ */ jsxs("div", {
						className: "relative flex h-20 items-center justify-between border-b border-white/[0.07] px-6",
						children: [/* @__PURE__ */ jsxs(Link, {
							href: "/dashboard",
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("img", {
								src: "/brand/bas-stockflow-mark.png",
								alt: "",
								className: "size-11 rounded-xl object-cover shadow-lg shadow-slate-950/30"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "font-semibold tracking-tight",
								children: "BAS StockFlow"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500",
								children: "Inventory Workflow"
							})] })]
						}), /* @__PURE__ */ jsx("button", {
							"aria-label": "Tutup menu",
							className: "rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden",
							onClick: () => setOpen(false),
							children: /* @__PURE__ */ jsx(X, { size: 20 })
						})]
					}),
					/* @__PURE__ */ jsxs("nav", {
						className: "relative min-h-0 flex-1 overflow-y-auto px-4 py-6 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.18)_transparent]",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600",
							children: "Workspace"
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-1",
							children: links.filter(([label]) => label.startsWith("Master ") ? role === "superadmin" && hasPermission("master.manage") : label === "Manajemen User" ? role === "superadmin" : label === "Pengaturan Valuasi" ? role === "superadmin" : label === "Manajemen Akses" ? role === "superadmin" : label === "Stock In" ? canCreateStockTransaction && hasPermission("stock.in") : label === "Stock Out / Mutasi" ? canCreateStockOut && hasPermission("stock.out") : label === "Opname & Adjustment" ? canManageWarehouse && hasPermission("stock.adjust") : label === "Approval" ? canApprove && hasPermission("approval.act") : label === "Riwayat Aktivitas" ? (canApprove || role === "finance") && hasPermission("activity.view") : label === "Laporan Persediaan" ? hasPermission("report.view") : label === "Stok Gudang" ? hasPermission("stock.view") : label === "Request Stok Unit" ? hasPermission("stock.request") || hasPermission("stock.ship") || hasPermission("stock.receive") : true).map(([label, href, Icon, isActive]) => {
								const active = isActive(url);
								if (label === "Manajemen Akses") {
									const accessExpanded = accessOpen ?? active;
									return /* @__PURE__ */ jsxs("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setAccessOpen(!accessExpanded),
											"aria-expanded": accessExpanded,
											className: `group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/25" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`,
											children: [
												/* @__PURE__ */ jsx(Icon, {
													size: 19,
													strokeWidth: active ? 2.2 : 1.8
												}),
												/* @__PURE__ */ jsx("span", {
													className: "flex-1 text-left",
													children: label
												}),
												/* @__PURE__ */ jsx(ChevronDown, {
													size: 15,
													className: `transition-transform ${accessExpanded ? "rotate-180" : ""}`
												})
											]
										}), accessExpanded && /* @__PURE__ */ jsx("div", {
											className: "relative ml-[1.6rem] space-y-0.5 border-l border-white/10 py-1 pl-3.5",
											children: [
												[
													"Hak Akses",
													"/access-management",
													ShieldCheck
												],
												[
													"Role",
													"/role-management",
													UsersRound
												],
												[
													"Permission",
													"/permission-management",
													KeyRound
												]
											].map(([childLabel, childHref, ChildIcon]) => /* @__PURE__ */ jsxs(Link, {
												href: childHref,
												onClick: () => setOpen(false),
												className: `relative flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${url.startsWith(childHref) ? "bg-white/[0.07] text-emerald-300" : "text-slate-500 hover:bg-white/[0.06] hover:text-emerald-300"}`,
												children: [
													url.startsWith(childHref) && /* @__PURE__ */ jsx("span", { className: "absolute -left-[17px] size-1.5 rounded-full bg-emerald-400 ring-4 ring-[#0b1526]" }),
													/* @__PURE__ */ jsx(ChildIcon, {
														size: 14,
														className: "shrink-0"
													}),
													/* @__PURE__ */ jsx("span", {
														className: "truncate",
														children: childLabel
													})
												]
											}, childHref))
										})]
									}, label);
								}
								return /* @__PURE__ */ jsxs(Link, {
									href,
									onClick: () => setOpen(false),
									className: `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/25" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`,
									children: [
										/* @__PURE__ */ jsx(Icon, {
											size: 19,
											strokeWidth: active ? 2.2 : 1.8
										}),
										/* @__PURE__ */ jsx("span", {
											className: "flex-1",
											children: label
										}),
										label === "Approval" && role === "warehouse_manager" && approvalScope.main?.length > 0 && approvalScope.counts && /* @__PURE__ */ jsx("span", {
											className: "flex shrink-0 items-center gap-1",
											children: approvalScope.main.map((warehouse) => {
												const count = approvalScope.counts[warehouse.id] || 0;
												return /* @__PURE__ */ jsxs("span", {
													title: `${warehouse.name}: ${count} menunggu approval`,
													className: `rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-white/20 text-white" : "bg-emerald-400/15 text-emerald-300"}`,
													children: [
														warehouse.name.replace("Gudang Utama ", ""),
														" ",
														count
													]
												}, warehouse.id);
											})
										}),
										active && /* @__PURE__ */ jsx(ChevronRight, {
											size: 15,
											className: "opacity-75"
										})
									]
								}, label);
							})
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative m-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-9 place-items-center rounded-full bg-slate-700 text-xs font-semibold text-white",
								children: (user?.name || "WM").slice(0, 2).toUpperCase()
							}), /* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("p", {
									className: "truncate text-sm font-medium text-slate-200",
									children: user?.name || "Warehouse Manager"
								}), /* @__PURE__ */ jsx("p", {
									className: "truncate text-xs text-slate-500",
									children: user?.email || "WMS Workspace"
								})]
							})]
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setLogoutOpen(true),
							className: "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300",
							children: [/* @__PURE__ */ jsx(LogOut, { size: 15 }), " Keluar dari aplikasi"]
						})]
					})
				]
			}),
			open && /* @__PURE__ */ jsx("button", {
				"aria-label": "Tutup menu",
				className: "fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden",
				onClick: () => setOpen(false)
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "min-h-screen min-w-0 w-full overflow-x-hidden lg:ml-64 lg:w-[calc(100%-16rem)]",
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8",
						children: [
							/* @__PURE__ */ jsx("button", {
								"aria-label": "Buka menu",
								className: "rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden",
								onClick: () => setOpen(true),
								children: /* @__PURE__ */ jsx(Menu, { size: 20 })
							}),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600",
								children: "BAS StockFlow"
							}), /* @__PURE__ */ jsx("h1", {
								className: "mt-0.5 text-xl font-semibold tracking-tight text-slate-950",
								children: title
							})] }),
							/* @__PURE__ */ jsxs("div", {
								className: "ml-auto flex items-center gap-3",
								children: [/* @__PURE__ */ jsxs("span", {
									className: `hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex ${online ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`,
									role: "status",
									children: [online ? /* @__PURE__ */ jsx(Wifi, { size: 14 }) : /* @__PURE__ */ jsx(WifiOff, { size: 14 }), online ? "Online" : "Offline"]
								}), /* @__PURE__ */ jsx(NotificationMenu, {
									notifications: props.auth?.notifications,
									role,
									mainWarehouses: approvalScope.main || []
								})]
							})
						]
					}),
					!online && /* @__PURE__ */ jsx("div", {
						className: "border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 sm:text-sm",
						children: "Koneksi terputus. Data hanya dapat dilihat kembali setelah internet tersedia dan transaksi sementara tidak dapat diproses."
					}),
					/* @__PURE__ */ jsx("div", {
						className: `w-full p-4 sm:p-6 ${fullWidth ? "" : "max-w-[1440px]"}`,
						children
					})
				]
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: logoutOpen,
				onOpenChange: setLogoutOpen,
				onConfirm: () => {
					setLoggingOut(true);
					router.post("/logout", {}, { onFinish: () => setLoggingOut(false) });
				},
				processing: loggingOut,
				tone: "amber",
				title: "Keluar dari aplikasi?",
				description: "Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk mengakses BAS StockFlow.",
				confirmLabel: "Ya, keluar"
			})
		]
	});
}
//#endregion
export { ConfirmActionDialog as n, AppLayout as t };

//# sourceMappingURL=AppLayout-2lRcxVpS.js.map