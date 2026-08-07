import { Head, router } from "@inertiajs/react";
import {
  Banknote,
  Boxes,
  Layers3,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Warehouse,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchableItemSelect from "../../components/searchable-item-select";
import AppLayout from "../../layouts/AppLayout";

const number = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(value);

const money = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Index({
  stocks,
  warehouses,
  selectedWarehouse,
  canFilterWarehouse,
  accessLabel,
  summary,
  valuationMethod,
}: any) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date());
  const [layerStock, setLayerStock] = useState<any>(null);
  const refreshInProgress = useRef(false);

  const refreshStocks = useCallback(() => {
    if (
      refreshInProgress.current ||
      document.visibilityState !== "visible" ||
      !navigator.onLine
    ) {
      return;
    }

    refreshInProgress.current = true;
    setIsRefreshing(true);
    router.reload({
      only: ["stocks", "summary"],
      onSuccess: () => setLastUpdatedAt(new Date()),
      onFinish: () => {
        refreshInProgress.current = false;
        setIsRefreshing(false);
      },
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(refreshStocks, 30_000);
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
    const items = new Map();
    stocks.forEach((row: any) => items.set(String(row.item.id), row.item));

    return Array.from(items.values()).sort((first: any, second: any) =>
      first.name.localeCompare(second.name, "id"),
    );
  }, [stocks]);

  const rows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return stocks.filter((row: any) => {
      const matchesItem = !selectedItem || String(row.item.id) === selectedItem;
      const matchesSearch =
        !keyword ||
        `${row.item.code} ${row.item.name} ${row.batch_no || ""} ${row.warehouse.name}`
          .toLowerCase()
          .includes(keyword);

      return matchesItem && matchesSearch;
    });
  }, [stocks, search, selectedItem]);

  const hasActiveFilters = Boolean(search || selectedItem);

  return (
    <AppLayout title="Stok Gudang">
      <Head title="Stok Gudang" />

      <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#10233f] px-6 py-7 text-white shadow-xl shadow-slate-200 sm:px-8">
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3 py-1.5 text-xs text-emerald-300">
              <ShieldCheck size={14} />
              {accessLabel}
            </span>
            <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5 text-xs text-slate-300">
              <Layers3 size={14} />
              Valuasi: {valuationMethod === "fifo" ? "FIFO" : "Moving Average"}
            </span>
            <h2 className="mt-4 text-2xl font-semibold">
              Saldo persediaan terkini
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Pantau stok fisik, reservasi, saldo tersedia, batch, kedaluwarsa,
              dan nilai persediaan.
            </p>
          </div>

          {canFilterWarehouse && (
            <div className="text-xs font-semibold text-slate-300">
              <span className="mb-2 block">Filter gudang</span>
              <Select
                value={selectedWarehouse ? String(selectedWarehouse) : "all"}
                onValueChange={(value) =>
                  router.get(
                    "/warehouse-stocks",
                    value !== "all" ? { warehouse_id: value } : {},
                    { preserveState: true, replace: true },
                  )
                }
              >
                <SelectTrigger className="h-11 min-w-64 rounded-xl border-white/10 bg-white/10 px-3.5 text-sm text-white shadow-none hover:bg-white/15 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/10 [&_svg]:text-slate-300">
                  <SelectValue placeholder="Pilih gudang" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl bg-white p-1">
                  <SelectItem value="all" className="rounded-lg py-2.5">
                    Semua gudang dalam cakupan
                  </SelectItem>
                  {warehouses.map((warehouse: any) => (
                    <SelectItem
                      key={warehouse.id}
                      value={String(warehouse.id)}
                      className="rounded-lg py-2.5"
                    >
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Baris stok",
            number(summary.items),
            Boxes,
            "bg-blue-50 text-blue-600",
          ],
          [
            "Stok fisik",
            number(summary.onHand),
            Warehouse,
            "bg-emerald-50 text-emerald-600",
          ],
          [
            "Tersedia",
            number(summary.available),
            PackageCheck,
            "bg-violet-50 text-violet-600",
          ],
          [
            "Nilai persediaan",
            money(summary.value),
            Banknote,
            "bg-amber-50 text-amber-600",
          ],
        ].map(([label, value, Icon, tone]: any) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div
              className={`grid size-10 place-items-center rounded-xl ${tone}`}
            >
              <Icon size={19} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <SlidersHorizontal size={16} />
                </span>
                <h3 className="font-semibold text-slate-950">
                  Detail stok per batch
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Update otomatis 30 detik
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                <span>
                  Menampilkan {rows.length} dari {stocks.length} baris
                  persediaan.
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span className="text-xs">
                  Diperbarui{" "}
                  {lastUpdatedAt.toLocaleTimeString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={refreshStocks}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-600 disabled:cursor-wait disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={isRefreshing ? "animate-spin" : ""}
                  />
                  {isRefreshing ? "Memperbarui…" : "Refresh sekarang"}
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="block sm:min-w-72">
                <span className="mb-2 block text-xs font-semibold text-slate-600">
                  Filter berdasarkan item
                </span>
                <SearchableItemSelect
                  value={selectedItem}
                  items={itemOptions as any}
                  onChange={setSelectedItem}
                  placeholder="Cari kode atau nama item"
                  emptyOptionLabel="Semua item"
                />
              </div>

              <label className="block sm:min-w-72">
                <span className="mb-2 block text-xs font-semibold text-slate-600">
                  Pencarian cepat
                </span>
                <span className="relative block">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari batch atau gudang..."
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                  />
                </span>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedItem("");
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X size={16} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-[11px] uppercase tracking-[.1em] text-slate-500">
                <tr>
                  {[
                    "Gudang / lokasi",
                    "Item",
                    "Batch / kedaluwarsa",
                    "Stok fisik",
                    "Reservasi",
                    "Tersedia",
                    "Biaya / HPP",
                    "Nilai",
                  ].map((header) => (
                    <th key={header} className="whitespace-nowrap px-5 py-3.5">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <b>{row.warehouse.name}</b>
                      <small className="mt-1 block text-slate-400">
                        {row.location
                          ? `${row.location.code} · ${row.location.name}`
                          : "Lokasi belum ditentukan"}
                      </small>
                    </td>
                    <td className="px-5 py-4">
                      <b>{row.item.name}</b>
                      <small className="mt-1 block text-slate-400">
                        {row.item.code} · {row.item.base_uom}
                      </small>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {row.batch_no || "-"}
                      <small className="mt-1 block text-slate-400">
                        {row.expired_at || "Tanpa kedaluwarsa"}
                      </small>
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {number(row.qty_on_hand)}
                    </td>
                    <td className="px-5 py-4 text-amber-600">
                      {number(row.qty_reserved)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.qty_available <= 0
                            ? "bg-rose-50 text-rose-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {number(row.qty_available)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="block">{money(row.average_cost)}</span>
                      <small className="mt-1 block text-slate-400">
                        {valuationMethod === "fifo"
                          ? "Rata-rata layer tersisa"
                          : "Rata-rata berjalan"}
                      </small>
                      {valuationMethod === "fifo" && (
                        <button
                          type="button"
                          onClick={() => setLayerStock(row)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-800"
                        >
                          <Layers3 size={13} /> Lihat {row.cost_layers.length} layer
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">
                      {money(row.stock_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Boxes size={21} />
            </span>
            <p className="mt-3 font-medium text-slate-700">
              Stok tidak ditemukan
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Coba ubah pilihan item atau kata kunci pencarian.
            </p>
          </div>
        )}
      </section>

      <Dialog open={Boolean(layerStock)} onOpenChange={(open) => !open && setLayerStock(null)}>
        <DialogContent className="max-w-4xl overflow-hidden border-slate-200 bg-white p-0 shadow-xl">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <span className="grid size-8 place-items-center rounded-lg bg-slate-200/70 text-slate-600">
                <Layers3 size={16} />
              </span>
              Layer biaya FIFO
            </DialogTitle>
            <DialogDescription>
              {layerStock?.item.name} · {layerStock?.warehouse.name} · Batch {layerStock?.batch_no || "-"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-[11px] uppercase tracking-[.1em] text-slate-500">
                <tr>
                  {['Tanggal masuk', 'Referensi', 'Qty awal', 'Qty tersisa', 'Biaya unit', 'Nilai tersisa'].map((header) => (
                    <th key={header} className="whitespace-nowrap px-5 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {layerStock?.cost_layers.map((layer: any) => (
                  <tr key={layer.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {layer.received_at
                        ? new Date(layer.received_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {layer.reference_type || '-'} {layer.reference_id ? `#${layer.reference_id}` : ''}
                    </td>
                    <td className="px-5 py-4">{number(layer.original_qty)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{number(layer.remaining_qty)}</td>
                    <td className="whitespace-nowrap px-5 py-4">{money(layer.unit_cost)}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">{money(layer.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold">
                <tr>
                  <td colSpan={3} className="px-5 py-4 text-right">Total layer tersisa</td>
                  <td className="px-5 py-4 text-slate-700">
                    {number(layerStock?.cost_layers.reduce((total: number, layer: any) => total + layer.remaining_qty, 0) || 0)}
                  </td>
                  <td />
                  <td className="whitespace-nowrap px-5 py-4">
                    {money(layerStock?.cost_layers.reduce((total: number, layer: any) => total + layer.value, 0) || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
