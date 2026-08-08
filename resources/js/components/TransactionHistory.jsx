import { Link } from "@inertiajs/react";
import { ArrowRight, Boxes, Download, FileText } from "lucide-react";
import { formatDateTime } from "../lib/date";

const statusStyles = {
  waiting_approval: [
    "Menunggu approval",
    "bg-amber-50 text-amber-700 ring-amber-600/10",
  ],
  completed: ["Selesai", "bg-emerald-50 text-emerald-700 ring-emerald-600/10"],
  rejected: ["Ditolak", "bg-rose-50 text-rose-700 ring-rose-600/10"],
  draft: ["Draft", "bg-slate-100 text-slate-600 ring-slate-500/10"],
};

export default function TransactionHistory({ transactions, title, emptyText }) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
          <FileText size={19} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {transactions.total ?? transactions.data.length} pengajuan ditemukan
          </p>
        </div>
      </div>

      {transactions.data.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                <th className="px-6 py-3.5">Nomor</th>
                <th className="px-5 py-3.5">Pergerakan</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.data.map((transaction) => {
                const status = statusStyles[transaction.status] || [
                  transaction.status,
                  statusStyles.draft[1],
                ];
                const movementSource =
                  transaction.type === "stock_in"
                    ? transaction.supplier_name?.trim() || "Eksternal"
                    : transaction.source_warehouse?.name || "Eksternal";
                return (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{transaction.number}</div>
                      {transaction.approvals?.length > 0 && (
                        <div className="mt-1 space-y-1.5">
                          {transaction.approvals.map((approval, index) => (
                            <div
                              key={approval.id || index}
                              className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500"
                            >
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                Level {approval.level}
                              </span>
                              <span>{approval.approver?.name || "-"}</span>
                              <span className="rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ring-slate-200">
                                {approval.status}
                              </span>
                              {approval.remarks && (
                                <span>{approval.remarks}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      <span>
                        {movementSource}
                      </span>
                      <ArrowRight
                        size={13}
                        className="mx-2 inline text-slate-300"
                      />
                      <span>
                        {transaction.destination_warehouse?.name || "Eksternal"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDateTime(transaction.document_date)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status[1]}`}
                      >
                        {status[0]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {transaction.receipt_image_path && (
                          <a
                            href={`/stock-transactions/${transaction.id}/evidence/receipt`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700"
                          >
                            <FileText size={14} /> Nota
                          </a>
                        )}
                        {transaction.payment_proof_image_path && (
                          <a
                            href={`/stock-transactions/${transaction.id}/evidence/payment`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700"
                          >
                            <FileText size={14} /> Bayar
                          </a>
                        )}
                        {transaction.delivery_proof_image_path && (
                          <a
                            href={`/stock-transactions/${transaction.id}/evidence/delivery`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700"
                          >
                            <FileText size={14} /> Kirim
                          </a>
                        )}
                        <a
                          href={`/stock-transactions/${transaction.id}/document`}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Download size={14} /> PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <Boxes size={21} />
          </span>
          <p className="mt-4 font-medium text-slate-700">Belum ada pengajuan</p>
          <p className="mt-1 text-sm text-slate-500">{emptyText}</p>
        </div>
      )}

      {transactions.links?.length > 3 && (
        <nav className="flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4">
          {transactions.links.map((link, index) =>
            link.url ? (
              <Link
                key={index}
                href={link.url}
                preserveScroll
                className={`grid min-h-9 min-w-9 place-items-center rounded-lg border px-3 text-sm ${link.active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600"}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ) : (
              <span
                key={index}
                className="grid min-h-9 min-w-9 place-items-center rounded-lg border border-slate-100 px-3 text-sm text-slate-300"
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ),
          )}
        </nav>
      )}
    </section>
  );
}
