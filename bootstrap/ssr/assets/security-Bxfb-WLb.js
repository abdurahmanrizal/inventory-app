import { n as useAppearance } from "./use-appearance-E0ZYowTZ.js";
import { t as cn } from "./utils-DAgvUY2L.js";
import { t as Button } from "./button-DRdOZmfE.js";
import { t as Input } from "./input-BKaRA9ml.js";
import { n as queryParams, t as applyUrlDefaults } from "./wayfinder-BrhwLpUM.js";
import { t as Heading } from "./heading-BKCTPZtU.js";
import { t as edit$1 } from "./security-C4aqlBsk.js";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, n as DialogClose, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-BRHxsiws.js";
import { t as InputError } from "./input-error-kjOtsSWi.js";
import { t as Spinner } from "./spinner-Bs9t3kFL.js";
import { t as PasswordInput } from "./password-input-BoWWpS-H.js";
import { t as Label } from "./label-3LcUKzgf.js";
import { a as regenerateRecoveryCodes, c as InputOTPGroup, i as enable, l as InputOTPSlot, n as confirm, r as disable, s as InputOTP, t as useTwoFactorAuth } from "./use-two-factor-auth-D3qO1hpv.js";
import { Form, Head, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { AlertCircleIcon, Check, Copy, Eye, EyeOff, KeyRound, LockKeyhole, RefreshCw, ScanLine, ShieldCheck, Trash2 } from "lucide-react";
import { usePasskeyRegister } from "@laravel/passkeys/react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
//#region resources/js/actions/App/Http/Controllers/Settings/SecurityController.ts
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
var edit = (options) => ({
	url: edit.url(options),
	method: "get"
});
edit.definition = {
	methods: ["get", "head"],
	url: "/settings/security"
};
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
edit.url = (options) => {
	return edit.definition.url + queryParams(options);
};
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
edit.get = (options) => ({
	url: edit.url(options),
	method: "get"
});
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
edit.head = (options) => ({
	url: edit.url(options),
	method: "head"
});
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
var editForm = (options) => ({
	action: edit.url(options),
	method: "get"
});
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
editForm.get = (options) => ({
	action: edit.url(options),
	method: "get"
});
/**
* @see \App\Http\Controllers\Settings\SecurityController::edit
* @see app/Http/Controllers/Settings/SecurityController.php:19
* @route '/settings/security'
*/
editForm.head = (options) => ({
	action: edit.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
edit.form = editForm;
/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:56
* @route '/settings/password'
*/
var update = (options) => ({
	url: update.url(options),
	method: "put"
});
update.definition = {
	methods: ["put"],
	url: "/settings/password"
};
/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:56
* @route '/settings/password'
*/
update.url = (options) => {
	return update.definition.url + queryParams(options);
};
/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:56
* @route '/settings/password'
*/
update.put = (options) => ({
	url: update.url(options),
	method: "put"
});
/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:56
* @route '/settings/password'
*/
var updateForm = (options) => ({
	action: update.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "PUT",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "post"
});
/**
* @see \App\Http\Controllers\Settings\SecurityController::update
* @see app/Http/Controllers/Settings/SecurityController.php:56
* @route '/settings/password'
*/
updateForm.put = (options) => ({
	action: update.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "PUT",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "post"
});
update.form = updateForm;
var SecurityController = {
	edit,
	update
};
//#endregion
//#region resources/js/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController.ts
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
var index = (options) => ({
	url: index.url(options),
	method: "get"
});
index.definition = {
	methods: ["get", "head"],
	url: "/user/passkeys/options"
};
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
index.url = (options) => {
	return index.definition.url + queryParams(options);
};
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
index.get = (options) => ({
	url: index.url(options),
	method: "get"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
index.head = (options) => ({
	url: index.url(options),
	method: "head"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
var indexForm = (options) => ({
	action: index.url(options),
	method: "get"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
indexForm.get = (options) => ({
	action: index.url(options),
	method: "get"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::index
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:29
* @route '/user/passkeys/options'
*/
indexForm.head = (options) => ({
	action: index.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
index.form = indexForm;
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
var store = (options) => ({
	url: store.url(options),
	method: "post"
});
store.definition = {
	methods: ["post"],
	url: "/user/passkeys"
};
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
store.url = (options) => {
	return store.definition.url + queryParams(options);
};
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
store.post = (options) => ({
	url: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
var storeForm = (options) => ({
	action: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::store
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:48
* @route '/user/passkeys'
*/
storeForm.post = (options) => ({
	action: store.url(options),
	method: "post"
});
store.form = storeForm;
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
var destroy = (args, options) => ({
	url: destroy.url(args, options),
	method: "delete"
});
destroy.definition = {
	methods: ["delete"],
	url: "/user/passkeys/{passkey}"
};
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
destroy.url = (args, options) => {
	if (typeof args === "string" || typeof args === "number") args = { passkey: args };
	if (typeof args === "object" && !Array.isArray(args) && "id" in args) args = { passkey: args.id };
	if (Array.isArray(args)) args = { passkey: args[0] };
	args = applyUrlDefaults(args);
	const parsedArgs = { passkey: typeof args.passkey === "object" ? args.passkey.id : args.passkey };
	return destroy.definition.url.replace("{passkey}", parsedArgs.passkey.toString()).replace(/\/+$/, "") + queryParams(options);
};
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
destroy.delete = (args, options) => ({
	url: destroy.url(args, options),
	method: "delete"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
var destroyForm = (args, options) => ({
	action: destroy.url(args, { [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "DELETE",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "post"
});
/**
* @see \Laravel\Passkeys\Http\Controllers\PasskeyRegistrationController::destroy
* @see vendor/laravel/passkeys/src/Http/Controllers/PasskeyRegistrationController.php:68
* @route '/user/passkeys/{passkey}'
*/
destroyForm.delete = (args, options) => ({
	action: destroy.url(args, { [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "DELETE",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "post"
});
destroy.form = destroyForm;
//#endregion
//#region resources/js/components/passkey-item.tsx
function PasskeyItem({ passkey, onDelete }) {
	const [isDeleting, setIsDeleting] = useState(false);
	const handleDelete = () => {
		setIsDeleting(true);
		onDelete(passkey.id, () => setIsDeleting(false));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between border-b p-4 last:border-b-0",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted",
				children: /* @__PURE__ */ jsx(KeyRound, { className: "h-5 w-5 text-muted-foreground" })
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-medium tracking-tight",
						children: passkey.name
					}), passkey.authenticator && /* @__PURE__ */ jsx("span", {
						className: "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset",
						children: passkey.authenticator
					})]
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Added ",
						passkey.created_at_diff,
						passkey.last_used_at_diff && /* @__PURE__ */ jsxs(Fragment$1, { children: [
							/* @__PURE__ */ jsx("span", {
								className: "mx-1 text-muted-foreground/50",
								children: "/"
							}),
							"Last used ",
							passkey.last_used_at_diff
						] })
					]
				})]
			})]
		}), /* @__PURE__ */ jsxs(Dialog, { children: [/* @__PURE__ */ jsx(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsxs(Button, {
				variant: "ghost",
				size: "sm",
				className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
				children: [/* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
					className: "sr-only",
					children: "Remove"
				})]
			})
		}), /* @__PURE__ */ jsxs(DialogContent, { children: [
			/* @__PURE__ */ jsx(DialogTitle, { children: "Remove passkey" }),
			/* @__PURE__ */ jsxs(DialogDescription, { children: [
				"Are you sure you want to remove the \"",
				passkey.name,
				"\" passkey? You will no longer be able to use it to sign in."
			] }),
			/* @__PURE__ */ jsxs(DialogFooter, {
				className: "gap-2",
				children: [/* @__PURE__ */ jsx(DialogClose, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Button, {
						variant: "secondary",
						children: "Cancel"
					})
				}), /* @__PURE__ */ jsx(Button, {
					variant: "destructive",
					onClick: handleDelete,
					disabled: isDeleting,
					children: isDeleting ? "Removing..." : "Remove passkey"
				})]
			})
		] })] })]
	});
}
//#endregion
//#region resources/js/components/passkey-register.tsx
function PasskeyRegistration({ onSuccess }) {
	const [name, setName] = useState(() => {
		const ua = navigator.userAgent;
		return [[
			{
				pattern: /Edg|Edge/,
				name: "Edge"
			},
			{
				pattern: /OPR|Opera|OPiOS/,
				name: "Opera"
			},
			{
				pattern: /Firefox|FxiOS/,
				name: "Firefox"
			},
			{
				pattern: /Chrome|CriOS/,
				name: "Chrome"
			},
			{
				pattern: /Safari/,
				name: "Safari"
			}
		].find(({ pattern }) => pattern.test(ua))?.name, [
			{
				pattern: /iPhone/,
				name: "iPhone"
			},
			{
				pattern: /iPad|Macintosh(?=.*Mobile)/,
				name: "iPad"
			},
			{
				pattern: /Android/,
				name: "Android"
			},
			{
				pattern: /Mac/,
				name: "Mac"
			},
			{
				pattern: /Windows/,
				name: "Windows"
			}
		].find(({ pattern }) => pattern.test(ua))?.name].filter(Boolean).join(" on ") || "";
	});
	const [showForm, setShowForm] = useState(false);
	const { register, isLoading, error, isSupported } = usePasskeyRegister({ onSuccess: () => {
		setName("");
		setShowForm(false);
		onSuccess();
	} });
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!name.trim()) return;
		await register(name);
	};
	const handleCancel = () => {
		setShowForm(false);
		setName("");
	};
	if (!isSupported) return /* @__PURE__ */ jsx("div", {
		className: "text-sm text-muted-foreground",
		children: "Passkeys are not supported in this browser."
	});
	if (!showForm) return /* @__PURE__ */ jsx(Button, {
		variant: "outline",
		onClick: () => setShowForm(true),
		children: "Add passkey"
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: handleSubmit,
		className: "space-y-4 rounded-lg border border-border bg-muted/50 p-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ jsx(Label, {
						htmlFor: "passkey-name",
						children: "Passkey name"
					}),
					/* @__PURE__ */ jsx(Input, {
						id: "passkey-name",
						type: "text",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "e.g., MacBook Pro, iPhone",
						className: "mt-1 block w-full border-foreground/20",
						autoFocus: true
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: "A name helps you identify this passkey later."
					})
				]
			}),
			error && /* @__PURE__ */ jsx(InputError, { message: error }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ jsx(Button, {
					type: "submit",
					disabled: isLoading || !name.trim(),
					children: isLoading ? "Registering..." : "Register passkey"
				}), /* @__PURE__ */ jsx(Button, {
					type: "button",
					variant: "ghost",
					onClick: handleCancel,
					children: "Cancel"
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/components/manage-passkeys.tsx
var EmptyState = () => {
	return /* @__PURE__ */ jsxs("div", {
		className: "p-8 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted",
				children: /* @__PURE__ */ jsx(KeyRound, { className: "h-7 w-7 text-muted-foreground" })
			}),
			/* @__PURE__ */ jsx("p", {
				className: "font-medium",
				children: "No passkeys yet"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Add a passkey to sign in without a password"
			})
		]
	});
};
function ManagePasskeys(props) {
	const passkeys = props.passkeys ?? [];
	const handleDelete = (id, onError) => {
		router.delete(destroy.url(id), {
			preserveScroll: true,
			onError
		});
	};
	const handleRegisterSuccess = () => {
		router.reload();
	};
	if (!(props.canManagePasskeys ?? false)) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(Heading, {
				variant: "small",
				title: "Passkeys",
				description: "Manage your passkeys for passwordless sign-in"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "overflow-hidden rounded-lg border border-border",
				children: passkeys.length > 0 ? passkeys.map((passkey) => /* @__PURE__ */ jsx(PasskeyItem, {
					passkey,
					onDelete: handleDelete
				}, passkey.id)) : /* @__PURE__ */ jsx(EmptyState, {})
			}),
			/* @__PURE__ */ jsx(PasskeyRegistration, { onSuccess: handleRegisterSuccess })
		]
	});
}
//#endregion
//#region resources/js/components/ui/alert.tsx
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/80"
	} },
	defaultVariants: { variant: "default" }
});
function Alert({ className, variant, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert",
		role: "alert",
		className: cn(alertVariants({ variant }), className),
		...props
	});
}
function AlertTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-title",
		className: cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className),
		...props
	});
}
function AlertDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-description",
		className: cn("text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed", className),
		...props
	});
}
//#endregion
//#region resources/js/components/alert-error.tsx
function AlertError({ errors, title }) {
	return /* @__PURE__ */ jsxs(Alert, {
		variant: "destructive",
		children: [
			/* @__PURE__ */ jsx(AlertCircleIcon, {}),
			/* @__PURE__ */ jsx(AlertTitle, { children: title || "Something went wrong." }),
			/* @__PURE__ */ jsx(AlertDescription, { children: /* @__PURE__ */ jsx("ul", {
				className: "list-inside list-disc text-sm",
				children: Array.from(new Set(errors)).map((error, index) => /* @__PURE__ */ jsx("li", { children: error }, index))
			}) })
		]
	});
}
//#endregion
//#region resources/js/components/ui/card.tsx
function Card({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card",
		className: cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-header",
		className: cn("flex flex-col gap-1.5 px-6", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-title",
		className: cn("leading-none font-semibold", className),
		...props
	});
}
function CardDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-description",
		className: cn("text-muted-foreground text-sm", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "card-content",
		className: cn("px-6", className),
		...props
	});
}
//#endregion
//#region resources/js/components/two-factor-recovery-codes.tsx
function TwoFactorRecoveryCodes({ recoveryCodesList, fetchRecoveryCodes, errors }) {
	const [codesAreVisible, setCodesAreVisible] = useState(false);
	const codesSectionRef = useRef(null);
	const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;
	const toggleCodesVisibility = useCallback(async () => {
		if (!codesAreVisible && !recoveryCodesList.length) await fetchRecoveryCodes();
		setCodesAreVisible(!codesAreVisible);
		if (!codesAreVisible) setTimeout(() => {
			codesSectionRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "nearest"
			});
		});
	}, [
		codesAreVisible,
		recoveryCodesList.length,
		fetchRecoveryCodes
	]);
	useEffect(() => {
		if (!recoveryCodesList.length) fetchRecoveryCodes();
	}, [recoveryCodesList.length, fetchRecoveryCodes]);
	return /* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsxs(CardHeader, { children: [/* @__PURE__ */ jsxs(CardTitle, {
		className: "flex gap-3",
		children: [/* @__PURE__ */ jsx(LockKeyhole, {
			className: "size-4",
			"aria-hidden": "true"
		}), "2FA recovery codes"]
	}), /* @__PURE__ */ jsx(CardDescription, { children: "Recovery codes let you regain access if you lose your 2FA device. Store them in a secure password manager." })] }), /* @__PURE__ */ jsxs(CardContent, { children: [/* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ jsxs(Button, {
			onClick: toggleCodesVisibility,
			className: "w-fit",
			"aria-expanded": codesAreVisible,
			"aria-controls": "recovery-codes-section",
			children: [
				/* @__PURE__ */ jsx(codesAreVisible ? EyeOff : Eye, {
					className: "size-4",
					"aria-hidden": "true"
				}),
				codesAreVisible ? "Hide" : "View",
				" recovery codes"
			]
		}), canRegenerateCodes && /* @__PURE__ */ jsx(Form, {
			...regenerateRecoveryCodes.form(),
			options: { preserveScroll: true },
			onSuccess: fetchRecoveryCodes,
			children: ({ processing }) => /* @__PURE__ */ jsxs(Button, {
				variant: "secondary",
				type: "submit",
				disabled: processing,
				"aria-describedby": "regenerate-warning",
				children: [/* @__PURE__ */ jsx(RefreshCw, {}), " Regenerate codes"]
			})
		})]
	}), /* @__PURE__ */ jsx("div", {
		id: "recovery-codes-section",
		className: `relative overflow-hidden transition-all duration-300 ${codesAreVisible ? "h-auto opacity-100" : "h-0 opacity-0"}`,
		"aria-hidden": !codesAreVisible,
		children: /* @__PURE__ */ jsx("div", {
			className: "mt-3 space-y-3",
			children: errors?.length ? /* @__PURE__ */ jsx(AlertError, { errors }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
				ref: codesSectionRef,
				className: "grid gap-1 rounded-lg bg-muted p-4 font-mono text-sm",
				role: "list",
				"aria-label": "Recovery codes",
				children: recoveryCodesList.length ? recoveryCodesList.map((code, index) => /* @__PURE__ */ jsx("div", {
					role: "listitem",
					className: "select-text",
					children: code
				}, index)) : /* @__PURE__ */ jsx("div", {
					className: "space-y-2",
					"aria-label": "Loading recovery codes",
					children: Array.from({ length: 8 }, (_, index) => /* @__PURE__ */ jsx("div", {
						className: "h-4 animate-pulse rounded bg-muted-foreground/20",
						"aria-hidden": "true"
					}, index))
				})
			}), /* @__PURE__ */ jsx("div", {
				className: "text-xs text-muted-foreground select-none",
				children: /* @__PURE__ */ jsxs("p", {
					id: "regenerate-warning",
					children: [
						"Each recovery code can be used once to access your account and will be removed after use. If you need more, click",
						" ",
						/* @__PURE__ */ jsx("span", {
							className: "font-bold",
							children: "Regenerate codes"
						}),
						" ",
						"above."
					]
				})
			})] })
		})
	})] })] });
}
//#endregion
//#region resources/js/hooks/use-clipboard.ts
function useClipboard() {
	const [copiedText, setCopiedText] = useState(null);
	const copy = async (text) => {
		if (!navigator?.clipboard) {
			console.warn("Clipboard not supported");
			return false;
		}
		try {
			await navigator.clipboard.writeText(text);
			setCopiedText(text);
			return true;
		} catch (error) {
			console.warn("Copy failed", error);
			setCopiedText(null);
			return false;
		}
	};
	return [copiedText, copy];
}
//#endregion
//#region resources/js/components/two-factor-setup-modal.tsx
function GridScanIcon() {
	return /* @__PURE__ */ jsx("div", {
		className: "mb-3 rounded-full border border-border bg-card p-0.5 shadow-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "relative overflow-hidden rounded-full border border-border bg-muted p-2.5",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 grid grid-cols-5 opacity-50",
					children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ jsx("div", { className: "border-r border-border last:border-r-0" }, `col-${i + 1}`))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 grid grid-rows-5 opacity-50",
					children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ jsx("div", { className: "border-b border-border last:border-b-0" }, `row-${i + 1}`))
				}),
				/* @__PURE__ */ jsx(ScanLine, { className: "relative z-20 size-6 text-foreground" })
			]
		})
	});
}
function TwoFactorSetupStep({ qrCodeSvg, manualSetupKey, buttonText, onNextStep, errors }) {
	const { resolvedAppearance } = useAppearance();
	const [copiedText, copy] = useClipboard();
	const IconComponent = copiedText === manualSetupKey ? Check : Copy;
	return /* @__PURE__ */ jsx(Fragment$1, { children: errors?.length ? /* @__PURE__ */ jsx(AlertError, { errors }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", {
			className: "mx-auto flex max-w-md overflow-hidden",
			children: /* @__PURE__ */ jsx("div", {
				className: "mx-auto aspect-square w-64 rounded-lg border border-border",
				children: /* @__PURE__ */ jsx("div", {
					className: "z-10 flex h-full w-full items-center justify-center p-5",
					children: qrCodeSvg ? /* @__PURE__ */ jsx("div", {
						className: "aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full",
						dangerouslySetInnerHTML: { __html: qrCodeSvg },
						style: { filter: resolvedAppearance === "dark" ? "invert(1) brightness(1.5)" : void 0 }
					}) : /* @__PURE__ */ jsx(Spinner, {})
				})
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "flex w-full space-x-5",
			children: /* @__PURE__ */ jsx(Button, {
				className: "w-full",
				onClick: onNextStep,
				children: buttonText
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "relative flex w-full items-center justify-center",
			children: [/* @__PURE__ */ jsx("div", { className: "absolute inset-0 top-1/2 h-px w-full bg-border" }), /* @__PURE__ */ jsx("span", {
				className: "relative bg-card px-2 py-1",
				children: "or, enter the code manually"
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "flex w-full space-x-2",
			children: /* @__PURE__ */ jsx("div", {
				className: "flex w-full items-stretch overflow-hidden rounded-xl border border-border",
				children: !manualSetupKey ? /* @__PURE__ */ jsx("div", {
					className: "flex h-full w-full items-center justify-center bg-muted p-3",
					children: /* @__PURE__ */ jsx(Spinner, {})
				}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("input", {
					type: "text",
					readOnly: true,
					value: manualSetupKey,
					className: "h-full w-full bg-background p-3 text-foreground outline-none"
				}), /* @__PURE__ */ jsx("button", {
					onClick: () => copy(manualSetupKey),
					className: "border-l border-border px-3 hover:bg-muted",
					children: /* @__PURE__ */ jsx(IconComponent, { className: "w-4" })
				})] })
			})
		})
	] }) });
}
function TwoFactorVerificationStep({ onClose, onBack }) {
	const [code, setCode] = useState("");
	const pinInputContainerRef = useRef(null);
	useEffect(() => {
		setTimeout(() => {
			pinInputContainerRef.current?.querySelector("input")?.focus();
		}, 0);
	}, []);
	return /* @__PURE__ */ jsx(Form, {
		...confirm.form(),
		onSuccess: () => onClose(),
		resetOnError: true,
		resetOnSuccess: true,
		children: ({ processing, errors }) => /* @__PURE__ */ jsx(Fragment$1, { children: /* @__PURE__ */ jsxs("div", {
			ref: pinInputContainerRef,
			className: "relative w-full space-y-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex w-full flex-col items-center space-y-3 py-2",
				children: [/* @__PURE__ */ jsx(InputOTP, {
					id: "otp",
					name: "code",
					maxLength: 6,
					onChange: setCode,
					disabled: processing,
					pattern: REGEXP_ONLY_DIGITS,
					autoFocus: true,
					children: /* @__PURE__ */ jsx(InputOTPGroup, { children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ jsx(InputOTPSlot, { index }, index)) })
				}), /* @__PURE__ */ jsx(InputError, { message: errors?.confirmTwoFactorAuthentication?.code })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex w-full space-x-5",
				children: [/* @__PURE__ */ jsx(Button, {
					type: "button",
					variant: "outline",
					className: "flex-1",
					onClick: onBack,
					disabled: processing,
					children: "Back"
				}), /* @__PURE__ */ jsx(Button, {
					type: "submit",
					className: "flex-1",
					disabled: processing || code.length < 6,
					children: "Confirm"
				})]
			})]
		}) })
	});
}
function TwoFactorSetupModal({ isOpen, onClose, requiresConfirmation, twoFactorEnabled, qrCodeSvg, manualSetupKey, clearSetupData, fetchSetupData, errors }) {
	const [showVerificationStep, setShowVerificationStep] = useState(false);
	const modalConfig = useMemo(() => {
		if (twoFactorEnabled) return {
			title: "Two-factor authentication enabled",
			description: "Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.",
			buttonText: "Close"
		};
		if (showVerificationStep) return {
			title: "Verify authentication code",
			description: "Enter the 6-digit code from your authenticator app",
			buttonText: "Continue"
		};
		return {
			title: "Enable two-factor authentication",
			description: "To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app",
			buttonText: "Continue"
		};
	}, [twoFactorEnabled, showVerificationStep]);
	const resetModalState = useCallback(() => {
		if (twoFactorEnabled) clearSetupData();
		setShowVerificationStep(false);
	}, [clearSetupData, twoFactorEnabled]);
	const handleClose = useCallback(() => {
		resetModalState();
		onClose();
	}, [onClose, resetModalState]);
	const handleModalNextStep = useCallback(() => {
		if (requiresConfirmation) {
			setShowVerificationStep(true);
			return;
		}
		clearSetupData();
		handleClose();
	}, [
		requiresConfirmation,
		clearSetupData,
		handleClose
	]);
	const fetchSetupDataRef = useRef(fetchSetupData);
	useEffect(() => {
		fetchSetupDataRef.current = fetchSetupData;
	}, [fetchSetupData]);
	useEffect(() => {
		if (isOpen && !qrCodeSvg) fetchSetupDataRef.current();
	}, [isOpen, qrCodeSvg]);
	return /* @__PURE__ */ jsx(Dialog, {
		open: isOpen,
		onOpenChange: (open) => !open && handleClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ jsxs(DialogHeader, {
				className: "flex items-center justify-center",
				children: [
					/* @__PURE__ */ jsx(GridScanIcon, {}),
					/* @__PURE__ */ jsx(DialogTitle, { children: modalConfig.title }),
					/* @__PURE__ */ jsx(DialogDescription, {
						className: "text-center",
						children: modalConfig.description
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "flex flex-col items-center space-y-5",
				children: showVerificationStep ? /* @__PURE__ */ jsx(TwoFactorVerificationStep, {
					onClose: handleClose,
					onBack: () => setShowVerificationStep(false)
				}) : /* @__PURE__ */ jsx(TwoFactorSetupStep, {
					qrCodeSvg,
					manualSetupKey,
					buttonText: modalConfig.buttonText,
					onNextStep: handleModalNextStep,
					errors
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/components/manage-two-factor.tsx
function ManageTwoFactor(props) {
	const requiresConfirmation = props.requiresConfirmation ?? false;
	const twoFactorEnabled = props.twoFactorEnabled ?? false;
	const { qrCodeSvg, hasSetupData, manualSetupKey, clearSetupData, clearTwoFactorAuthData, fetchSetupData, recoveryCodesList, fetchRecoveryCodes, errors } = useTwoFactorAuth();
	const [showSetupModal, setShowSetupModal] = useState(false);
	const prevTwoFactorEnabled = useRef(twoFactorEnabled);
	useEffect(() => {
		if (prevTwoFactorEnabled.current && !twoFactorEnabled) clearTwoFactorAuthData();
		prevTwoFactorEnabled.current = twoFactorEnabled;
	}, [twoFactorEnabled, clearTwoFactorAuthData]);
	if (!(props.canManageTwoFactor ?? false)) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsx(Heading, {
				variant: "small",
				title: "Two-factor authentication",
				description: "Manage your two-factor authentication settings"
			}),
			twoFactorEnabled ? /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-start justify-start space-y-4",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "You will be prompted for a secure, random pin during login, which you can retrieve from the TOTP-supported application on your phone."
					}),
					/* @__PURE__ */ jsx("div", {
						className: "relative inline",
						children: /* @__PURE__ */ jsx(Form, {
							...disable.form(),
							children: ({ processing }) => /* @__PURE__ */ jsx(Button, {
								variant: "destructive",
								type: "submit",
								disabled: processing,
								children: "Disable 2FA"
							})
						})
					}),
					/* @__PURE__ */ jsx(TwoFactorRecoveryCodes, {
						recoveryCodesList,
						fetchRecoveryCodes,
						errors
					})
				]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-start justify-start space-y-4",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "When you enable two-factor authentication, you will be prompted for a secure pin during login. This pin can be retrieved from a TOTP-supported application on your phone."
				}), /* @__PURE__ */ jsx("div", { children: hasSetupData ? /* @__PURE__ */ jsxs(Button, {
					onClick: () => setShowSetupModal(true),
					children: [/* @__PURE__ */ jsx(ShieldCheck, {}), "Continue setup"]
				}) : /* @__PURE__ */ jsx(Form, {
					...enable.form(),
					onSuccess: () => setShowSetupModal(true),
					children: ({ processing }) => /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: processing,
						children: "Enable 2FA"
					})
				}) })]
			}),
			/* @__PURE__ */ jsx(TwoFactorSetupModal, {
				isOpen: showSetupModal,
				onClose: () => setShowSetupModal(false),
				requiresConfirmation,
				twoFactorEnabled,
				qrCodeSvg,
				manualSetupKey,
				clearSetupData,
				fetchSetupData,
				errors
			})
		]
	});
}
//#endregion
//#region resources/js/pages/settings/security.tsx
function Security(props) {
	const passwordInput = useRef(null);
	const currentPasswordInput = useRef(null);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Security settings" }),
		/* @__PURE__ */ jsx("h1", {
			className: "sr-only",
			children: "Security settings"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ jsx(Heading, {
				variant: "small",
				title: "Update password",
				description: "Ensure your account is using a long, random password to stay secure"
			}), /* @__PURE__ */ jsx(Form, {
				...SecurityController.update.form(),
				options: { preserveScroll: true },
				resetOnError: [
					"password",
					"password_confirmation",
					"current_password"
				],
				resetOnSuccess: true,
				onError: (errors) => {
					if (errors.password) passwordInput.current?.focus();
					if (errors.current_password) currentPasswordInput.current?.focus();
				},
				className: "space-y-6",
				children: ({ errors, processing }) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "current_password",
								children: "Current password"
							}),
							/* @__PURE__ */ jsx(PasswordInput, {
								id: "current_password",
								ref: currentPasswordInput,
								name: "current_password",
								className: "mt-1 block w-full",
								autoComplete: "current-password",
								placeholder: "Current password"
							}),
							/* @__PURE__ */ jsx(InputError, { message: errors.current_password })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "password",
								children: "New password"
							}),
							/* @__PURE__ */ jsx(PasswordInput, {
								id: "password",
								ref: passwordInput,
								name: "password",
								className: "mt-1 block w-full",
								autoComplete: "new-password",
								placeholder: "New password",
								passwordrules: props.passwordRules
							}),
							/* @__PURE__ */ jsx(InputError, { message: errors.password })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ jsx(Label, {
								htmlFor: "password_confirmation",
								children: "Confirm password"
							}),
							/* @__PURE__ */ jsx(PasswordInput, {
								id: "password_confirmation",
								name: "password_confirmation",
								className: "mt-1 block w-full",
								autoComplete: "new-password",
								placeholder: "Confirm password",
								passwordrules: props.passwordRules
							}),
							/* @__PURE__ */ jsx(InputError, { message: errors.password_confirmation })
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-4",
						children: /* @__PURE__ */ jsx(Button, {
							disabled: processing,
							"data-test": "update-password-button",
							children: "Save"
						})
					})
				] })
			})]
		}),
		/* @__PURE__ */ jsx(ManageTwoFactor, {
			canManageTwoFactor: props.canManageTwoFactor,
			requiresConfirmation: props.requiresConfirmation,
			twoFactorEnabled: props.twoFactorEnabled
		}),
		/* @__PURE__ */ jsx(ManagePasskeys, {
			canManagePasskeys: props.canManagePasskeys,
			passkeys: props.passkeys
		})
	] });
}
Security.layout = { breadcrumbs: [{
	title: "Security settings",
	href: edit$1()
}] };
//#endregion
export { Security as default };

//# sourceMappingURL=security-Bxfb-WLb.js.map