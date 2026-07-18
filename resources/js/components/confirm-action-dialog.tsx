import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  processing?: boolean;
  tone?: "emerald" | "amber" | "rose";
  cancelLabel?: string;
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  processing = false,
  tone = "emerald",
  cancelLabel = "Batal",
}: Props) {
  const styles = {
    emerald: {
      Icon: CheckCircle2,
      icon: "bg-emerald-50 text-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100",
      label: "Konfirmasi tindakan",
    },
    amber: {
      Icon: AlertTriangle,
      icon: "bg-amber-50 text-amber-600",
      button: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-100",
      label: "Perlu konfirmasi",
    },
    rose: {
      Icon: ShieldCheck,
      icon: "bg-rose-50 text-rose-600",
      button: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-100",
      label: "Tindakan penting",
    },
  }[tone];
  const Icon = styles.Icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[440px]">
        <div className="px-6 pb-6 pt-6">
          <div className="mb-5 flex items-start gap-3.5">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl ${styles.icon}`}
            >
              <Icon size={19} strokeWidth={2} />
            </span>
            <div className="min-w-0 pr-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {styles.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Pastikan informasi sudah sesuai sebelum melanjutkan.
              </p>
            </div>
          </div>
          <DialogHeader className="gap-2 text-left">
            <DialogTitle className="pr-6 text-lg leading-6 tracking-tight text-slate-950">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
          <button
            type="button"
            disabled={processing}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:min-w-24"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={processing}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-wait disabled:opacity-60 sm:min-w-32 ${styles.button}`}
          >
            {processing && <LoaderCircle size={16} className="animate-spin" />}
            {processing ? "Sedang memproses..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
