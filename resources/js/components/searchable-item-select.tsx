import { CheckCircle2, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

type Item = { id: number | string; code: string; name: string };

type Props = {
  value: string;
  items: Item[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyOptionLabel?: string;
};

export default function SearchableItemSelect({
  value,
  items,
  onChange,
  placeholder = "Cari kode atau nama item",
  emptyOptionLabel,
}: Props) {
  const selected = items.find((item) => String(item.id) === String(value));
  const [query, setQuery] = useState(
    selected ? `${selected.code} — ${selected.name}` : "",
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected ? `${selected.code} — ${selected.name}` : "");
  }, [value, selected?.code, selected?.name]);

  const filteredItems = items
    .filter((item) =>
      `${item.code} ${item.name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, 50);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery(selected ? `${selected.code} — ${selected.name}` : "");
        }
      }}
    >
      <Search className="pointer-events-none absolute left-3.5 top-3.5 z-10 size-4 text-slate-400" />
      <input
        value={query}
        autoComplete="off"
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        onFocus={(event) => {
          setOpen(true);
          event.currentTarget.select();
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (!event.target.value) onChange("");
        }}
      />
      {query || value ? (
        <button
          type="button"
          aria-label="Reset pilihan item"
          title="Reset pilihan item"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onChange("");
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <X size={15} />
        </button>
      ) : (
        <ChevronDown
          className={`pointer-events-none absolute right-3.5 top-3.5 size-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      )}
      {open && (
        <div className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          {emptyOptionLabel && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${!value ? "bg-emerald-50 font-semibold text-emerald-700" : "text-slate-700"}`}
            >
              {emptyOptionLabel}
              {!value && <CheckCircle2 size={15} />}
            </button>
          )}
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(String(item.id));
                  setQuery(`${item.code} — ${item.name}`);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-emerald-50 ${String(item.id) === String(value) ? "bg-emerald-50 font-semibold text-emerald-700" : "text-slate-700"}`}
              >
                <span>
                  {item.code} — {item.name}
                </span>
                {String(item.id) === String(value) && (
                  <CheckCircle2 size={15} />
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-xs text-slate-500">
              Item tidak ditemukan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
