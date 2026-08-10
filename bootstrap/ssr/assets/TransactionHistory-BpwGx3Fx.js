import { t as formatDateTime } from "./date-TP9tjpoO.js";
import { Link } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, Boxes, Download, FileText } from "lucide-react";
//#region resources/js/components/TransactionHistory.jsx
var statusStyles = {
	waiting_approval: ["Menunggu approval", "bg-amber-50 text-amber-700 ring-amber-600/10"],
	completed: ["Selesai", "bg-emerald-50 text-emerald-700 ring-emerald-600/10"],
	rejected: ["Ditolak", "bg-rose-50 text-rose-700 ring-rose-600/10"],
	draft: ["Draft", "bg-slate-100 text-slate-600 ring-slate-500/10"]
};
function TransactionHistory({ transactions, title, emptyText }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6",
				children: [/* @__PURE__ */ jsx("span", {
					className: "grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600",
					children: /* @__PURE__ */ jsx(FileText, { size: 19 })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "text-sm font-semibold text-slate-900",
					children: title
				}), /* @__PURE__ */ jsxs("p", {
					className: "mt-0.5 text-xs text-slate-500",
					children: [transactions.total ?? transactions.data.length, " pengajuan ditemukan"]
				})] })]
			}),
			transactions.data.length ? /* @__PURE__ */ jsx("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ jsxs("table", {
					className: "min-w-full text-sm",
					children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
						className: "border-b border-slate-100 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500",
						children: [
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-3.5",
								children: "Nomor"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-5 py-3.5",
								children: "Pergerakan"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-5 py-3.5",
								children: "Tanggal"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-5 py-3.5",
								children: "Status"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "px-6 py-3.5 text-right",
								children: "Dokumen"
							})
						]
					}) }), /* @__PURE__ */ jsx("tbody", {
						className: "divide-y divide-slate-100",
						children: transactions.data.map((transaction) => {
							const status = statusStyles[transaction.status] || [transaction.status, statusStyles.draft[1]];
							const movementSource = transaction.type === "stock_in" ? transaction.supplier_name?.trim() || "Eksternal" : transaction.source_warehouse?.name || "Eksternal";
							return /* @__PURE__ */ jsxs("tr", {
								className: "transition hover:bg-slate-50/70",
								children: [
									/* @__PURE__ */ jsxs("td", {
										className: "px-6 py-4 font-semibold text-slate-900",
										children: [/* @__PURE__ */ jsx("div", { children: transaction.number }), transaction.approvals?.length > 0 && /* @__PURE__ */ jsx("div", {
											className: "mt-1 space-y-1.5",
											children: transaction.approvals.map((approval, index) => /* @__PURE__ */ jsxs("div", {
												className: "flex flex-wrap items-center gap-2 text-[11px] text-slate-500",
												children: [
													/* @__PURE__ */ jsxs("span", {
														className: "rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700",
														children: ["Level ", approval.level]
													}),
													/* @__PURE__ */ jsx("span", { children: approval.approver?.name || "-" }),
													/* @__PURE__ */ jsx("span", {
														className: "rounded-full px-2 py-0.5 font-medium ring-1 ring-inset ring-slate-200",
														children: approval.status
													}),
													approval.remarks && /* @__PURE__ */ jsx("span", { children: approval.remarks })
												]
											}, approval.id || index))
										})]
									}),
									/* @__PURE__ */ jsxs("td", {
										className: "whitespace-nowrap px-5 py-4 text-xs text-slate-500",
										children: [
											/* @__PURE__ */ jsx("span", { children: movementSource }),
											/* @__PURE__ */ jsx(ArrowRight, {
												size: 13,
												className: "mx-2 inline text-slate-300"
											}),
											/* @__PURE__ */ jsx("span", { children: transaction.destination_warehouse?.name || "Eksternal" })
										]
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4 text-slate-500",
										children: formatDateTime(transaction.document_date)
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-5 py-4",
										children: /* @__PURE__ */ jsx("span", {
											className: `rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status[1]}`,
											children: status[0]
										})
									}),
									/* @__PURE__ */ jsx("td", {
										className: "whitespace-nowrap px-6 py-4 text-right",
										children: /* @__PURE__ */ jsxs("div", {
											className: "flex justify-end gap-2",
											children: [
												transaction.receipt_image_path && /* @__PURE__ */ jsxs("a", {
													href: `/stock-transactions/${transaction.id}/evidence/receipt`,
													target: "_blank",
													rel: "noreferrer",
													className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700",
													children: [/* @__PURE__ */ jsx(FileText, { size: 14 }), " Nota"]
												}),
												transaction.payment_proof_image_path && /* @__PURE__ */ jsxs("a", {
													href: `/stock-transactions/${transaction.id}/evidence/payment`,
													target: "_blank",
													rel: "noreferrer",
													className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700",
													children: [/* @__PURE__ */ jsx(FileText, { size: 14 }), " Bayar"]
												}),
												transaction.delivery_proof_image_path && /* @__PURE__ */ jsxs("a", {
													href: `/stock-transactions/${transaction.id}/evidence/delivery`,
													target: "_blank",
													rel: "noreferrer",
													className: "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700",
													children: [/* @__PURE__ */ jsx(FileText, { size: 14 }), " Kirim"]
												}),
												/* @__PURE__ */ jsxs("a", {
													href: `/stock-transactions/${transaction.id}/document`,
													className: "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
													children: [/* @__PURE__ */ jsx(Download, { size: 14 }), " PDF"]
												})
											]
										})
									})
								]
							}, transaction.id);
						})
					})]
				})
			}) : /* @__PURE__ */ jsxs("div", {
				className: "px-6 py-14 text-center",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400",
						children: /* @__PURE__ */ jsx(Boxes, { size: 21 })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-4 font-medium text-slate-700",
						children: "Belum ada pengajuan"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-slate-500",
						children: emptyText
					})
				]
			}),
			transactions.links?.length > 3 && /* @__PURE__ */ jsx("nav", {
				className: "flex flex-wrap justify-center gap-1.5 border-t border-slate-100 p-4",
				children: transactions.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(Link, {
					href: link.url,
					preserveScroll: true,
					className: `grid min-h-9 min-w-9 place-items-center rounded-lg border px-3 text-sm ${link.active ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600"}`,
					dangerouslySetInnerHTML: { __html: link.label }
				}, index) : /* @__PURE__ */ jsx("span", {
					className: "grid min-h-9 min-w-9 place-items-center rounded-lg border border-slate-100 px-3 text-sm text-slate-300",
					dangerouslySetInnerHTML: { __html: link.label }
				}, index))
			})
		]
	});
}
//#endregion
export { TransactionHistory as t };

//# sourceMappingURL=TransactionHistory-BpwGx3Fx.js.map