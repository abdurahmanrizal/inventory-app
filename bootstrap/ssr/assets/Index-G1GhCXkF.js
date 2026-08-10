import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BRHxsiws.js";
import { n as ConfirmActionDialog, t as AppLayout } from "./AppLayout-2lRcxVpS.js";
import { t as SearchableItemSelect } from "./searchable-item-select-3UmoD7Bb.js";
import { t as TransactionHistory } from "./TransactionHistory-BpwGx3Fx.js";
import { Head, useForm } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { AlertCircle, CalendarDays, Camera, Check, CheckCircle2, ChevronDown, Image, PackagePlus, Plus, RefreshCcw, SwitchCamera, Trash2, Upload, Warehouse } from "lucide-react";
import Webcam from "react-webcam";
//#region resources/js/components/camera-capture-dialog.tsx
function CameraCaptureDialog({ open, onOpenChange, label, onCapture }) {
	const webcamRef = useRef(null);
	const [photo, setPhoto] = useState(null);
	const [facingMode, setFacingMode] = useState("environment");
	const [cameraReady, setCameraReady] = useState(false);
	const [cameraError, setCameraError] = useState("");
	const reset = () => {
		setPhoto(null);
		setCameraReady(false);
		setCameraError("");
	};
	const handleOpenChange = (nextOpen) => {
		if (!nextOpen) reset();
		onOpenChange(nextOpen);
	};
	const takePhoto = () => {
		const image = webcamRef.current?.getScreenshot({
			width: 1600,
			height: 1200
		});
		if (image) setPhoto(image);
	};
	const usePhoto = async () => {
		if (!photo) return;
		const blob = await fetch(photo).then((response) => response.blob());
		onCapture(new File([blob], `kamera-${Date.now()}.jpg`, { type: "image/jpeg" }));
		handleOpenChange(false);
	};
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl",
			children: [
				/* @__PURE__ */ jsxs(DialogHeader, {
					className: "px-5 pb-3 pt-5 text-left sm:px-6",
					children: [/* @__PURE__ */ jsxs(DialogTitle, { children: ["Ambil ", label] }), /* @__PURE__ */ jsx(DialogDescription, { children: "Arahkan kamera ke dokumen hingga seluruh bagian terlihat jelas." })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative aspect-[4/3] overflow-hidden bg-slate-950",
					children: [
						photo ? /* @__PURE__ */ jsx("img", {
							src: photo,
							alt: `Pratinjau ${label}`,
							className: "size-full object-contain"
						}) : /* @__PURE__ */ jsx(Webcam, {
							ref: webcamRef,
							audio: false,
							screenshotFormat: "image/jpeg",
							screenshotQuality: .82,
							videoConstraints: {
								facingMode: { ideal: facingMode },
								width: { ideal: 1600 },
								height: { ideal: 1200 }
							},
							onUserMedia: () => {
								setCameraReady(true);
								setCameraError("");
							},
							onUserMediaError: () => {
								setCameraReady(false);
								setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera diberikan dan aplikasi dibuka melalui HTTPS.");
							},
							className: "size-full object-cover"
						}, facingMode),
						!photo && !cameraReady && !cameraError && /* @__PURE__ */ jsx("div", {
							className: "absolute inset-0 grid place-items-center bg-slate-950 text-sm text-white",
							children: "Membuka kamera…"
						}),
						cameraError && /* @__PURE__ */ jsx("div", {
							className: "absolute inset-0 grid place-items-center bg-slate-950 p-8 text-center text-sm leading-6 text-white",
							children: /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(AlertCircle, { className: "mx-auto mb-3 text-amber-400" }), cameraError] })
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-between sm:px-6",
					children: !photo ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: Boolean(cameraError),
						onClick: () => {
							setCameraReady(false);
							setFacingMode((mode) => mode === "environment" ? "user" : "environment");
						},
						className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40",
						children: [/* @__PURE__ */ jsx(SwitchCamera, { size: 17 }), " Ganti kamera"]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: !cameraReady || Boolean(cameraError),
						onClick: takePhoto,
						className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40",
						children: [/* @__PURE__ */ jsx(Camera, { size: 17 }), " Ambil foto"]
					})] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => setPhoto(null),
						className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50",
						children: [/* @__PURE__ */ jsx(RefreshCcw, { size: 17 }), " Ambil ulang"]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: usePhoto,
						className: "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500",
						children: [/* @__PURE__ */ jsx(Check, { size: 17 }), " Gunakan foto"]
					})] })
				})
			]
		})
	});
}
//#endregion
//#region resources/js/pages/StockIn/Index.tsx
var fieldClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";
var emptyDetail = () => ({
	item_id: "",
	qty: 1,
	unit_cost: "",
	batch_no: "",
	expired_at: ""
});
function SupportingDocumentInput({ label, description, value, onChange }) {
	const fileInput = useRef(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [cameraOpen, setCameraOpen] = useState(false);
	const [previewUrl, setPreviewUrl] = useState("");
	const inputClass = "sr-only";
	useEffect(() => {
		if (!value) {
			setPreviewUrl("");
			return;
		}
		const objectUrl = URL.createObjectURL(value);
		setPreviewUrl(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [value]);
	const selectFile = (event) => {
		onChange(event.target.files?.[0] || null);
		event.target.value = "";
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "flex items-start gap-3",
				children: [previewUrl ? /* @__PURE__ */ jsx("img", {
					src: previewUrl,
					alt: `Pratinjau ${label}`,
					className: "size-16 shrink-0 rounded-xl bg-white object-cover shadow-sm ring-1 ring-slate-200"
				}) : /* @__PURE__ */ jsx("span", {
					className: "grid size-10 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm",
					children: /* @__PURE__ */ jsx(Image, { size: 18 })
				}), /* @__PURE__ */ jsxs("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("span", {
						className: "block text-sm font-semibold text-slate-800",
						children: label
					}), /* @__PURE__ */ jsx("span", {
						className: "mt-1 block text-xs leading-5 text-slate-500",
						children: description
					})]
				})]
			}),
			/* @__PURE__ */ jsx("input", {
				ref: fileInput,
				type: "file",
				accept: "image/jpeg,image/png,image/webp",
				className: inputClass,
				onChange: selectFile
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mt-4",
				onBlur: (event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
				},
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					"aria-haspopup": "menu",
					"aria-expanded": menuOpen,
					onClick: () => setMenuOpen((open) => !open),
					className: "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500",
					children: [
						/* @__PURE__ */ jsx(Upload, { size: 15 }),
						value ? "Ganti dokumen" : "Tambah dokumen",
						/* @__PURE__ */ jsx(ChevronDown, {
							size: 15,
							className: `ml-auto transition ${menuOpen ? "rotate-180" : ""}`
						})
					]
				}), menuOpen && /* @__PURE__ */ jsxs("div", {
					role: "menu",
					className: "absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "menuitem",
						onClick: () => {
							setMenuOpen(false);
							setCameraOpen(true);
						},
						className: "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700",
						children: [/* @__PURE__ */ jsx(Camera, { size: 16 }), " Ambil dari kamera"]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "menuitem",
						onClick: () => {
							setMenuOpen(false);
							fileInput.current?.click();
						},
						className: "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700",
						children: [/* @__PURE__ */ jsx(Upload, { size: 16 }), " Pilih dari perangkat"]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("span", {
				className: `mt-3 block truncate text-xs ${value ? "font-medium text-emerald-700" : "text-slate-400"}`,
				children: value ? value.name : "Belum ada file dipilih"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[11px] text-slate-400",
				children: "JPG, PNG, atau WebP · maksimal 10 MB · dikompres otomatis"
			}),
			/* @__PURE__ */ jsx(CameraCaptureDialog, {
				open: cameraOpen,
				onOpenChange: setCameraOpen,
				label,
				onCapture: onChange
			})
		]
	});
}
function Index({ transactions, warehouses, items, stockInMode, userWarehouse }) {
	const isUnitRequest = stockInMode === "unit_request";
	const [confirmOpen, setConfirmOpen] = useState(false);
	const form = useForm({
		type: isUnitRequest ? "transfer" : "stock_in",
		request_kind: stockInMode,
		source_warehouse_id: "",
		destination_warehouse_id: userWarehouse?.id || "",
		supplier_name: "",
		receipt_image: null,
		payment_proof_image: null,
		delivery_proof_image: null,
		document_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		notes: "",
		details: [emptyDetail()]
	});
	const setDetail = (index, key, value) => {
		form.setData("details", form.data.details.map((detail, position) => position === index ? {
			...detail,
			[key]: value
		} : detail));
	};
	const removeDetail = (index) => {
		if (form.data.details.length === 1) return;
		form.setData("details", form.data.details.filter((_, position) => position !== index));
	};
	const submit = (event) => {
		event.preventDefault();
		setConfirmOpen(true);
	};
	const confirmSubmit = () => {
		form.post("/stock-transactions", {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => {
				setConfirmOpen(false);
				form.reset();
			}
		});
	};
	const errors = Object.values(form.errors);
	return /* @__PURE__ */ jsxs(AppLayout, {
		title: "Stock In",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Stock In" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-medium text-emerald-700",
						children: isUnitRequest ? "Permintaan persediaan unit" : "Penerimaan persediaan"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-1 text-2xl font-semibold tracking-tight text-slate-950",
						children: isUnitRequest ? "Request stok ke gudang utama" : "Buat transaksi Stock In"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 max-w-2xl text-sm leading-6 text-slate-500",
						children: isUnitRequest ? "Ajukan kebutuhan stok unit Anda ke gudang kering atau basah untuk disetujui oleh manajer unit." : "Catat barang masuk dari supplier beserta nilai perolehan dan informasi batch."
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700",
					children: [/* @__PURE__ */ jsx(CheckCircle2, { size: 16 }), "Masuk ke antrean approval"]
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "space-y-5",
				children: [
					errors.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700",
						children: [/* @__PURE__ */ jsx(AlertCircle, {
							className: "mt-0.5 shrink-0",
							size: 19
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm font-semibold",
							children: "Periksa kembali data transaksi"
						}), /* @__PURE__ */ jsx("ul", {
							className: "mt-1 list-inside list-disc text-xs leading-5 text-rose-600",
							children: errors.map((error, index) => /* @__PURE__ */ jsx("li", { children: error }, index))
						})] })]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700",
								children: /* @__PURE__ */ jsx(Warehouse, { size: 18 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-semibold text-slate-900",
								children: isUnitRequest ? "Informasi permintaan" : "Informasi penerimaan"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-xs text-slate-500",
								children: isUnitRequest ? "Jalur distribusi stok sesuai unit pengguna." : "Data utama dokumen dan gudang tujuan."
							})] })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 p-5 sm:p-6 md:grid-cols-3",
							children: [
								isUnitRequest ? /* @__PURE__ */ jsxs("label", {
									className: "space-y-2 md:col-span-2",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-xs font-semibold text-slate-700",
										children: ["Request dari gudang ", /* @__PURE__ */ jsx("b", {
											className: "text-rose-500",
											children: "*"
										})]
									}), /* @__PURE__ */ jsxs("select", {
										className: fieldClass,
										value: form.data.source_warehouse_id,
										onChange: (event) => form.setData("source_warehouse_id", event.target.value),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Pilih gudang kering / basah"
										}), warehouses.filter((warehouse) => warehouse.type === "main").map((warehouse) => /* @__PURE__ */ jsxs("option", {
											value: warehouse.id,
											children: [
												warehouse.name,
												" → ",
												userWarehouse?.name
											]
										}, warehouse.id))]
									})]
								}) : /* @__PURE__ */ jsxs("label", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-xs font-semibold text-slate-700",
										children: ["Gudang tujuan ", /* @__PURE__ */ jsx("b", {
											className: "text-rose-500",
											children: "*"
										})]
									}), /* @__PURE__ */ jsxs("select", {
										className: fieldClass,
										value: form.data.destination_warehouse_id,
										onChange: (event) => form.setData("destination_warehouse_id", event.target.value),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Pilih gudang tujuan"
										}), warehouses.filter((warehouse) => warehouse.type === "main").map((warehouse) => /* @__PURE__ */ jsx("option", {
											value: warehouse.id,
											children: warehouse.name
										}, warehouse.id))]
									})]
								}),
								!isUnitRequest && /* @__PURE__ */ jsxs("label", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-xs font-semibold text-slate-700",
										children: "Nama supplier"
									}), /* @__PURE__ */ jsx("input", {
										className: fieldClass,
										placeholder: "Contoh: PT Sumber Makmur",
										value: form.data.supplier_name,
										onChange: (event) => form.setData("supplier_name", event.target.value)
									})]
								}),
								/* @__PURE__ */ jsxs("label", {
									className: "space-y-2",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-xs font-semibold text-slate-700",
										children: ["Tanggal dokumen ", /* @__PURE__ */ jsx("b", {
											className: "text-rose-500",
											children: "*"
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "relative",
										children: [/* @__PURE__ */ jsx(CalendarDays, {
											size: 16,
											className: "pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
										}), /* @__PURE__ */ jsx("input", {
											type: "date",
											className: `${fieldClass} pl-10`,
											value: form.data.document_date,
											onChange: (event) => form.setData("document_date", event.target.value)
										})]
									})]
								})
							]
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "relative z-10 overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ jsx("span", {
									className: "grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700",
									children: /* @__PURE__ */ jsx(PackagePlus, { size: 18 })
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
									className: "text-sm font-semibold text-slate-900",
									children: "Detail barang"
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-0.5 text-xs text-slate-500",
									children: [form.data.details.length, " baris item ditambahkan."]
								})] })]
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: () => form.setData("details", [...form.data.details, emptyDetail()]),
								className: "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
								children: [/* @__PURE__ */ jsx(Plus, { size: 15 }), " Tambah item"]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-3 p-4 sm:p-6",
							children: form.data.details.map((detail, index) => /* @__PURE__ */ jsxs("div", {
								className: "relative rounded-2xl border border-slate-200 bg-slate-50/60 p-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "mb-3 flex items-center justify-between",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400",
										children: ["Item ", String(index + 1).padStart(2, "0")]
									}), /* @__PURE__ */ jsx("button", {
										"aria-label": "Hapus item",
										type: "button",
										disabled: form.data.details.length === 1,
										className: "rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30",
										onClick: () => removeDetail(index),
										children: /* @__PURE__ */ jsx(Trash2, { size: 17 })
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "grid gap-4 md:grid-cols-12",
									children: [
										/* @__PURE__ */ jsxs("label", {
											className: `space-y-2 ${isUnitRequest ? "md:col-span-5" : "md:col-span-3"}`,
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "Produk"
											}), /* @__PURE__ */ jsx(SearchableItemSelect, {
												value: detail.item_id,
												items,
												placeholder: "Cari kode atau nama produk",
												onChange: (itemId) => setDetail(index, "item_id", itemId)
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "space-y-2 md:col-span-1",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "Satuan"
											}), /* @__PURE__ */ jsx("input", {
												readOnly: true,
												"aria-label": `Satuan dasar item ${index + 1}`,
												className: `${fieldClass} cursor-not-allowed bg-slate-100 font-semibold text-slate-600`,
												value: items.find((item) => String(item.id) === String(detail.item_id))?.base_uom || "",
												placeholder: "—"
											})]
										}),
										!isUnitRequest && /* @__PURE__ */ jsxs("label", {
											className: "space-y-2 md:col-span-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "Kuantitas"
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												min: "0.001",
												step: ".001",
												className: fieldClass,
												value: detail.qty,
												onChange: (event) => setDetail(index, "qty", event.target.value)
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "space-y-2 md:col-span-2",
											children: [/* @__PURE__ */ jsxs("span", {
												className: "text-xs font-semibold text-slate-600",
												children: ["HPP / unit ", /* @__PURE__ */ jsx("b", {
													className: "text-rose-500",
													children: "*"
												})]
											}), /* @__PURE__ */ jsx("input", {
												type: "number",
												required: true,
												min: "0.01",
												step: "0.01",
												className: fieldClass,
												value: detail.unit_cost,
												onChange: (event) => setDetail(index, "unit_cost", event.target.value)
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "space-y-2 md:col-span-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "Nomor batch"
											}), /* @__PURE__ */ jsx("input", {
												className: fieldClass,
												placeholder: "Opsional",
												value: detail.batch_no,
												onChange: (event) => setDetail(index, "batch_no", event.target.value)
											})]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "space-y-2 md:col-span-2",
											children: [/* @__PURE__ */ jsx("span", {
												className: "text-xs font-semibold text-slate-600",
												children: "Kedaluwarsa"
											}), /* @__PURE__ */ jsx("input", {
												type: "date",
												className: fieldClass,
												value: detail.expired_at,
												onChange: (event) => setDetail(index, "expired_at", event.target.value)
											})]
										})
									]
								})]
							}, index))
						})]
					}),
					!isUnitRequest && /* @__PURE__ */ jsxs("section", {
						className: "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700",
								children: /* @__PURE__ */ jsx(Image, { size: 18 })
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-semibold text-slate-900",
								children: "Dokumen pendukung"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-0.5 text-xs text-slate-500",
								children: "Gambar otomatis dikompres saat transaksi disimpan."
							})] })]
						}), /* @__PURE__ */ jsx("div", {
							className: "grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6",
							children: [
								[
									"receipt_image",
									"Foto nota",
									"Foto nota pembelian dari supplier"
								],
								[
									"payment_proof_image",
									"Bukti pembayaran",
									"Foto transfer atau bukti pembayaran"
								],
								[
									"delivery_proof_image",
									"Bukti pengiriman",
									"Foto surat jalan atau bukti barang dikirim"
								]
							].map(([key, label, description]) => /* @__PURE__ */ jsx(SupportingDocumentInput, {
								label,
								description,
								value: form.data[key],
								onChange: (file) => form.setData(key, file)
							}, key))
						})]
					}),
					/* @__PURE__ */ jsxs("section", {
						className: "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6",
						children: [/* @__PURE__ */ jsxs("label", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-xs font-semibold text-slate-700",
								children: "Catatan transaksi"
							}), /* @__PURE__ */ jsx("textarea", {
								rows: 3,
								className: `${fieldClass} h-auto resize-y py-3`,
								placeholder: "Tambahkan informasi yang perlu diketahui approver...",
								value: form.data.notes,
								onChange: (event) => form.setData("notes", event.target.value)
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => form.reset(),
								className: "rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
								children: "Reset"
							}), /* @__PURE__ */ jsxs("button", {
								disabled: form.processing,
								className: "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60",
								children: [
									/* @__PURE__ */ jsx(CheckCircle2, { size: 17 }),
									" ",
									form.processing ? "Mengirim..." : isUnitRequest ? "Kirim Request ke Manajer" : "Simpan Penerimaan"
								]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(TransactionHistory, {
				transactions,
				title: isUnitRequest ? "Daftar request stok unit" : "Daftar pengajuan Stock In",
				emptyText: isUnitRequest ? "Request stok unit yang dibuat akan muncul di sini." : "Pengajuan Stock In yang dibuat akan muncul di sini."
			}),
			/* @__PURE__ */ jsx(ConfirmActionDialog, {
				open: confirmOpen,
				onOpenChange: setConfirmOpen,
				onConfirm: confirmSubmit,
				processing: form.processing,
				title: isUnitRequest ? "Ajukan request stok?" : "Simpan penerimaan barang?",
				description: isUnitRequest ? "Request akan dikirim kepada manajer unit untuk diperiksa dan disetujui." : "Pastikan supplier, jumlah, HPP, dan informasi batch sudah sesuai sebelum disimpan.",
				confirmLabel: isUnitRequest ? "Ya, kirim request" : "Ya, simpan penerimaan"
			})
		]
	});
}
//#endregion
export { Index as default };

//# sourceMappingURL=Index-G1GhCXkF.js.map