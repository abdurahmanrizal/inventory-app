import { Link, router, usePage } from "@inertiajs/react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Building2,
  MapPin,
  PackageSearch,
  Ruler,
  Truck,
  SlidersHorizontal,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageMinus,
  PackagePlus,
  ShieldCheck,
  Warehouse,
  History,
  ChartNoAxesCombined,
  UsersRound,
  KeyRound,
  Settings,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmActionDialog from "../components/confirm-action-dialog";
import NotificationMenu from "../components/notification-menu";
import clsx from "clsx";

const links = [
  [
    "Dashboard",
    "/dashboard",
    LayoutDashboard,
    (url) => url.startsWith("/dashboard"),
  ],
  [
    "Stok Gudang",
    "/warehouse-stocks",
    Warehouse,
    (url) => url.startsWith("/warehouse-stocks"),
  ],
  [
    "Stock In",
    "/stock-transactions?type=stock_in",
    PackagePlus,
    (url) =>
      url.startsWith("/stock-transactions") &&
      (!url.includes("type=") || url.includes("type=stock_in")),
  ],
  [
    "Stock Out / Mutasi",
    "/stock-transactions?type=transfer",
    PackageMinus,
    (url) =>
      url.startsWith("/stock-transactions") && !url.includes("type=stock_in"),
  ],
  [
    "Master Supplier",
    "/operations/master-data?master=supplier",
    Building2,
    (url) =>
      url.startsWith("/operations/master-data") &&
      (!url.includes("master=") || url.includes("master=supplier")),
  ],
  [
    "Master Item",
    "/operations/master-data?master=item",
    PackageSearch,
    (url) =>
      url.startsWith("/operations/master-data") && url.includes("master=item"),
  ],
  [
    "Master Lokasi",
    "/operations/master-data?master=location",
    MapPin,
    (url) =>
      url.startsWith("/operations/master-data") &&
      url.includes("master=location"),
  ],
  [
    "Master Satuan",
    "/operations/master-data?master=uom",
    Ruler,
    (url) =>
      url.startsWith("/operations/master-data") && url.includes("master=uom"),
  ],
  [
    "Request Stok Unit",
    "/operations/fulfillment",
    Truck,
    (url) => url.startsWith("/operations/fulfillment"),
  ],
  [
    "Opname & Adjustment",
    "/operations/inventory-control",
    SlidersHorizontal,
    (url) => url.startsWith("/operations/inventory-control"),
  ],
  [
    "Approval",
    "/approvals",
    ClipboardCheck,
    (url) => url.startsWith("/approvals"),
  ],
  [
    "Manajemen User",
    "/user-management",
    UsersRound,
    (url) => url.startsWith("/user-management"),
  ],
  [
    "Manajemen Akses",
    "/access-management",
    KeyRound,
    (url) =>
      url.startsWith("/access-management") ||
      url.startsWith("/role-management") ||
      url.startsWith("/permission-management"),
  ],
  [
    "Laporan Persediaan",
    "/reports",
    ChartNoAxesCombined,
    (url) => url.startsWith("/reports"),
  ],
  [
    "Riwayat Aktivitas",
    "/transaction-activities",
    History,
    (url) => url.startsWith("/transaction-activities"),
  ],
  [
    "Pengaturan Valuasi",
    "/settings/inventory-valuation",
    Settings,
    (url) => url.startsWith("/settings/inventory-valuation"),
  ],
];

export default function AppLayout({ children, title, fullWidth = false }) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [accessOpen, setAccessOpen] = useState(null);
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const { url, props } = usePage();
  const user = props.auth?.user;

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const role = user?.role || "superadmin";
  const permissions = props.auth?.permissions || [];
  const hasPermission = (permission) =>
    role === "superadmin" || permissions.includes(permission);
  const canManageWarehouse = [
    "superadmin",
    "warehouse_admin_dry",
    "warehouse_admin_wet",
  ].includes(role);
  const canCreateStockTransaction = [
    "superadmin",
    "warehouse_admin_dry",
    "warehouse_admin_wet",
  ].includes(role);
  const canCreateStockOut = canCreateStockTransaction || role === "unit_user";
  const canApprove = [
    "superadmin",
    "unit_manager",
    "warehouse_admin_dry",
    "warehouse_admin_wet",
  ].includes(role);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden bg-[#0b1526] text-white shadow-2xl shadow-slate-950/10 transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_65%)]" />
        <div className="relative flex h-20 items-center justify-between border-b border-white/[0.07] px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src="/brand/bas-stockflow-mark.png"
              alt=""
              className="size-11 rounded-xl object-cover shadow-lg shadow-slate-950/30"
            />
            <div>
              <p className="font-semibold tracking-tight">BAS StockFlow</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Inventory Workflow
              </p>
            </div>
          </Link>
          <button
            aria-label="Tutup menu"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="relative min-h-0 flex-1 overflow-y-auto px-4 py-6 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.18)_transparent]">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </p>
          <div className="space-y-1">
            {links
              .filter(([label]) =>
                label.startsWith("Master ")
                  ? role === "superadmin" && hasPermission("master.manage")
                  : label === "Manajemen User"
                    ? role === "superadmin"
                    : label === "Pengaturan Valuasi"
                      ? role === "superadmin"
                    : label === "Manajemen Akses"
                      ? role === "superadmin"
                      : label === "Stock In"
                        ? canCreateStockTransaction && hasPermission("stock.in")
                        : label === "Stock Out / Mutasi"
                          ? canCreateStockOut && hasPermission("stock.out")
                          : label === "Opname & Adjustment"
                            ? canManageWarehouse &&
                              hasPermission("stock.adjust")
                            : label === "Approval"
                              ? canApprove && hasPermission("approval.act")
                              : label === "Riwayat Aktivitas"
                              ? (canApprove || role === "finance") &&
                                hasPermission("activity.view")
                                : label === "Laporan Persediaan"
                                  ? hasPermission("report.view")
                                  : label === "Stok Gudang"
                                    ? hasPermission("stock.view")
                                    : label === "Request Stok Unit"
                                      ? hasPermission("stock.request") ||
                                        hasPermission("stock.ship") ||
                                        hasPermission("stock.receive")
                                      : true,
              )
              .map(([label, href, Icon, isActive]) => {
                const active = isActive(url);

                if (label === "Manajemen Akses") {
                  const accessExpanded = accessOpen ?? active;

                  return (
                    <div key={label} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setAccessOpen(!accessExpanded)}
                        aria-expanded={accessExpanded}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/25" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}
                      >
                        <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                        <span className="flex-1 text-left">{label}</span>
                        <ChevronDown
                          size={15}
                          className={`transition-transform ${accessExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      {accessExpanded && (
                        <div className="relative ml-[1.6rem] space-y-0.5 border-l border-white/10 py-1 pl-3.5">
                          {[
                            ["Hak Akses", "/access-management", ShieldCheck],
                            ["Role", "/role-management", UsersRound],
                            ["Permission", "/permission-management", KeyRound],
                          ].map(([childLabel, childHref, ChildIcon]) => (
                            <Link
                              key={childHref}
                              href={childHref}
                              onClick={() => setOpen(false)}
                              className={`relative flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${url.startsWith(childHref) ? "bg-white/[0.07] text-emerald-300" : "text-slate-500 hover:bg-white/[0.06] hover:text-emerald-300"}`}
                            >
                              {url.startsWith(childHref) && (
                                <span className="absolute -left-[17px] size-1.5 rounded-full bg-emerald-400 ring-4 ring-[#0b1526]" />
                              )}
                              <ChildIcon size={14} className="shrink-0" />
                              <span className="truncate">{childLabel}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/25" : "text-slate-400 hover:bg-white/[0.06] hover:text-white"}`}
                  >
                    <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <ChevronRight size={15} className="opacity-75" />
                    )}
                  </Link>
                );
              })}
          </div>
        </nav>

        <div className="relative m-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-slate-700 text-xs font-semibold text-white">
              {(user?.name || "WM").slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">
                {user?.name || "Warehouse Manager"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || "WMS Workspace"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut size={15} /> Keluar dari aplikasi
          </button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="min-h-screen min-w-0 w-full overflow-x-hidden lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            aria-label="Buka menu"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
              BAS StockFlow
            </p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex ${online ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
              role="status"
            >
              {online ? <Wifi size={14} /> : <WifiOff size={14} />}
              {online ? "Online" : "Offline"}
            </span>
            <NotificationMenu notifications={props.auth?.notifications} />
          </div>
        </header>
        {!online && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 sm:text-sm">
            Koneksi terputus. Data hanya dapat dilihat kembali setelah internet
            tersedia dan transaksi sementara tidak dapat diproses.
          </div>
        )}
        <div
          className={`w-full p-4 sm:p-6 lg:p-8 ${fullWidth ? "" : "max-w-[1440px]"}`}
        >
          {children}
        </div>
      </main>
      <ConfirmActionDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={() => {
          setLoggingOut(true);
          router.post("/logout", {}, { onFinish: () => setLoggingOut(false) });
        }}
        processing={loggingOut}
        tone="amber"
        title="Keluar dari aplikasi?"
        description="Sesi Anda akan diakhiri dan Anda perlu masuk kembali untuk mengakses BAS StockFlow."
        confirmLabel="Ya, keluar"
      />
    </div>
  );
}
