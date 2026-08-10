import { t as cn } from "./utils-DAgvUY2L.js";
import { n as queryParams } from "./wayfinder-BrhwLpUM.js";
import { t as InputError } from "./input-error-kjOtsSWi.js";
import { t as Spinner } from "./spinner-Bs9t3kFL.js";
import { t as PasswordInput } from "./password-input-BoWWpS-H.js";
import { Form, Head } from "@inertiajs/react";
import "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { Activity, CheckCircle2, CheckIcon, LockKeyhole, ShieldCheck } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
//#region resources/js/components/ui/checkbox.tsx
function Checkbox({ className, ...props }) {
	return /* @__PURE__ */ jsx(CheckboxPrimitive.Root, {
		"data-slot": "checkbox",
		className: cn("peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className),
		...props,
		children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, {
			"data-slot": "checkbox-indicator",
			className: "flex items-center justify-center text-current transition-none",
			children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-3.5" })
		})
	});
}
//#endregion
//#region resources/js/routes/login/index.ts
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
var store = (options) => ({
	url: store.url(options),
	method: "post"
});
store.definition = {
	methods: ["post"],
	url: "/login"
};
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
store.url = (options) => {
	return store.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
store.post = (options) => ({
	url: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
var storeForm = (options) => ({
	action: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:58
* @route '/login'
*/
storeForm.post = (options) => ({
	action: store.url(options),
	method: "post"
});
store.form = storeForm;
Object.assign(store, store);
//#endregion
//#region resources/js/pages/auth/login.tsx
var inputClass = "h-12 w-full rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10";
function Login({ status }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[#071220] lg:grid lg:grid-cols-[1.05fr_0.95fr]",
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Masuk" }),
			/* @__PURE__ */ jsxs("section", {
				className: "relative hidden min-h-screen overflow-hidden border-r border-white/[0.06] p-12 text-white lg:flex lg:flex-col xl:p-16",
				children: [
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -left-32 -top-40 size-[560px] rounded-full bg-emerald-500/15 blur-[100px]" }),
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-40 right-0 size-[480px] rounded-full bg-blue-500/10 blur-[110px]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:44px_44px]" }),
					/* @__PURE__ */ jsxs("div", {
						className: "relative flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("img", {
							src: "/brand/bas-stockflow-mark.png",
							alt: "",
							className: "size-12 rounded-2xl object-cover shadow-xl shadow-emerald-950/40"
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-lg font-semibold tracking-tight",
							children: "BAS StockFlow"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500",
							children: "Inventory Workflow"
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "relative my-auto max-w-xl py-16",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300",
								children: [/* @__PURE__ */ jsx(Activity, { size: 14 }), " Sistem operasional aktif"]
							}),
							/* @__PURE__ */ jsx("h1", {
								className: "text-4xl font-semibold leading-[1.15] tracking-[-0.035em] xl:text-5xl",
								children: "Kendalikan persediaan dari satu ruang kerja."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-5 max-w-lg text-base leading-7 text-slate-400",
								children: "Kelola penerimaan, permintaan unit, mutasi, dan approval gudang secara akurat dan terintegrasi."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-10 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsx(Feature, {
									icon: ShieldCheck,
									title: "Akses berbasis role",
									children: "Hak akses gudang dan unit terisolasi dengan aman."
								}), /* @__PURE__ */ jsx(Feature, {
									icon: CheckCircle2,
									title: "Approval terkontrol",
									children: "Setiap pergerakan stok tercatat dan dapat ditelusuri."
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "relative text-xs text-slate-600",
						children: [
							"© ",
							(/* @__PURE__ */ new Date()).getFullYear(),
							" BAS StockFlow · Warehouse Management System"
						]
					})
				]
			}),
			/* @__PURE__ */ jsx("main", {
				className: "relative flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5 py-10 sm:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-md",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mb-8 flex items-center gap-3 lg:hidden",
							children: [/* @__PURE__ */ jsx("img", {
								src: "/brand/bas-stockflow-mark.png",
								alt: "",
								className: "size-11 rounded-xl object-cover shadow-lg shadow-emerald-500/20"
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "font-semibold text-slate-950",
								children: "BAS StockFlow"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400",
								children: "Inventory Workflow"
							})] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:p-8",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "mb-7",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "mb-5 grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700",
											children: /* @__PURE__ */ jsx(LockKeyhole, { size: 21 })
										}),
										/* @__PURE__ */ jsx("h2", {
											className: "text-2xl font-semibold tracking-tight text-slate-950",
											children: "Selamat datang kembali"
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-2 text-sm leading-6 text-slate-500",
											children: "Masukkan akun WMS Anda untuk melanjutkan ke workspace."
										})
									]
								}),
								status && /* @__PURE__ */ jsxs("div", {
									className: "mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm text-emerald-700",
									children: [/* @__PURE__ */ jsx(CheckCircle2, {
										size: 17,
										className: "mt-0.5 shrink-0"
									}), status]
								}),
								/* @__PURE__ */ jsx(Form, {
									...store.form(),
									resetOnSuccess: ["password"],
									className: "space-y-5",
									children: ({ processing, errors }) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
										/* @__PURE__ */ jsxs("label", {
											className: "grid gap-2",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-xs font-semibold text-slate-700",
													children: "Email"
												}),
												/* @__PURE__ */ jsx("input", {
													id: "email",
													type: "email",
													name: "email",
													required: true,
													autoFocus: true,
													tabIndex: 1,
													autoComplete: "email",
													placeholder: "nama@perusahaan.com",
													className: inputClass
												}),
												/* @__PURE__ */ jsx(InputError, { message: errors.email })
											]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "grid gap-2",
											children: [/* @__PURE__ */ jsx(PasswordInput, {
												id: "password",
												name: "password",
												required: true,
												tabIndex: 2,
												autoComplete: "current-password",
												placeholder: "Masukkan password",
												className: inputClass
											}), /* @__PURE__ */ jsx(InputError, { message: errors.password })]
										}),
										/* @__PURE__ */ jsxs("label", {
											className: "flex w-fit cursor-pointer items-center gap-3 text-sm text-slate-600",
											children: [/* @__PURE__ */ jsx(Checkbox, {
												id: "remember",
												name: "remember",
												tabIndex: 3,
												className: "border-slate-300 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
											}), "Ingat saya di perangkat ini"]
										}),
										/* @__PURE__ */ jsxs("button", {
											type: "submit",
											tabIndex: 4,
											disabled: processing,
											"data-test": "login-button",
											className: "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60",
											children: [processing && /* @__PURE__ */ jsx(Spinner, {}), processing ? "Memverifikasi..." : "Masuk ke BAS StockFlow"]
										})
									] })
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex items-center justify-center gap-2 text-xs text-slate-400",
							children: [/* @__PURE__ */ jsx(ShieldCheck, { size: 14 }), "Akses dilindungi dan aktivitas pengguna tercatat"]
						})
					]
				})
			})
		]
	});
}
function Feature({ icon: Icon, title, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 backdrop-blur-sm",
		children: [
			/* @__PURE__ */ jsx(Icon, {
				size: 20,
				className: "text-emerald-400"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 text-sm font-medium text-slate-200",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-xs leading-5 text-slate-500",
				children
			})
		]
	});
}
//#endregion
export { Login as default };

//# sourceMappingURL=login-Byao3s3h.js.map