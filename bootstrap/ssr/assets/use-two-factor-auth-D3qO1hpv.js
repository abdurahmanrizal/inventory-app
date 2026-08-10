import { t as cn } from "./utils-DAgvUY2L.js";
import { n as queryParams } from "./wayfinder-BrhwLpUM.js";
import { useHttp } from "@inertiajs/react";
import * as React from "react";
import { useCallback, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Minus } from "lucide-react";
import { OTPInput, OTPInputContext } from "input-otp";
//#region resources/js/components/ui/input-otp.tsx
var InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsx(OTPInput, {
	ref,
	containerClassName: cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName),
	className: cn("disabled:cursor-not-allowed", className),
	...props
}));
InputOTP.displayName = "InputOTP";
var InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("flex items-center", className),
	...props
}));
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
	const { char, hasFakeCaret, isActive } = React.useContext(OTPInputContext).slots[index];
	return /* @__PURE__ */ jsxs("div", {
		ref,
		className: cn("relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md", isActive && "z-10 ring-1 ring-ring", className),
		...props,
		children: [char, hasFakeCaret && /* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute inset-0 flex items-center justify-center",
			children: /* @__PURE__ */ jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" })
		})]
	});
});
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	role: "separator",
	...props,
	children: /* @__PURE__ */ jsx(Minus, {})
}));
InputOTPSeparator.displayName = "InputOTPSeparator";
//#endregion
//#region resources/js/routes/two-factor/login/index.ts
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:56
* @route '/two-factor-challenge'
*/
var store = (options) => ({
	url: store.url(options),
	method: "post"
});
store.definition = {
	methods: ["post"],
	url: "/two-factor-challenge"
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:56
* @route '/two-factor-challenge'
*/
store.url = (options) => {
	return store.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:56
* @route '/two-factor-challenge'
*/
store.post = (options) => ({
	url: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:56
* @route '/two-factor-challenge'
*/
var storeForm = (options) => ({
	action: store.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::store
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:56
* @route '/two-factor-challenge'
*/
storeForm.post = (options) => ({
	action: store.url(options),
	method: "post"
});
store.form = storeForm;
var login$1 = { store: Object.assign(store, store) };
//#endregion
//#region resources/js/routes/two-factor/index.ts
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
var login = (options) => ({
	url: login.url(options),
	method: "get"
});
login.definition = {
	methods: ["get", "head"],
	url: "/two-factor-challenge"
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
login.url = (options) => {
	return login.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
login.get = (options) => ({
	url: login.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
login.head = (options) => ({
	url: login.url(options),
	method: "head"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
var loginForm = (options) => ({
	action: login.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
loginForm.get = (options) => ({
	action: login.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticatedSessionController.php:41
* @route '/two-factor-challenge'
*/
loginForm.head = (options) => ({
	action: login.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
login.form = loginForm;
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::enable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:21
* @route '/user/two-factor-authentication'
*/
var enable = (options) => ({
	url: enable.url(options),
	method: "post"
});
enable.definition = {
	methods: ["post"],
	url: "/user/two-factor-authentication"
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::enable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:21
* @route '/user/two-factor-authentication'
*/
enable.url = (options) => {
	return enable.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::enable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:21
* @route '/user/two-factor-authentication'
*/
enable.post = (options) => ({
	url: enable.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::enable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:21
* @route '/user/two-factor-authentication'
*/
var enableForm = (options) => ({
	action: enable.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::enable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:21
* @route '/user/two-factor-authentication'
*/
enableForm.post = (options) => ({
	action: enable.url(options),
	method: "post"
});
enable.form = enableForm;
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
var confirm = (options) => ({
	url: confirm.url(options),
	method: "post"
});
confirm.definition = {
	methods: ["post"],
	url: "/user/confirmed-two-factor-authentication"
};
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
confirm.url = (options) => {
	return confirm.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
confirm.post = (options) => ({
	url: confirm.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
var confirmForm = (options) => ({
	action: confirm.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController::confirm
* @see vendor/laravel/fortify/src/Http/Controllers/ConfirmedTwoFactorAuthenticationController.php:19
* @route '/user/confirmed-two-factor-authentication'
*/
confirmForm.post = (options) => ({
	action: confirm.url(options),
	method: "post"
});
confirm.form = confirmForm;
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::disable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:35
* @route '/user/two-factor-authentication'
*/
var disable = (options) => ({
	url: disable.url(options),
	method: "delete"
});
disable.definition = {
	methods: ["delete"],
	url: "/user/two-factor-authentication"
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::disable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:35
* @route '/user/two-factor-authentication'
*/
disable.url = (options) => {
	return disable.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::disable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:35
* @route '/user/two-factor-authentication'
*/
disable.delete = (options) => ({
	url: disable.url(options),
	method: "delete"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::disable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:35
* @route '/user/two-factor-authentication'
*/
var disableForm = (options) => ({
	action: disable.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "DELETE",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController::disable
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorAuthenticationController.php:35
* @route '/user/two-factor-authentication'
*/
disableForm.delete = (options) => ({
	action: disable.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "DELETE",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "post"
});
disable.form = disableForm;
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
var qrCode = (options) => ({
	url: qrCode.url(options),
	method: "get"
});
qrCode.definition = {
	methods: ["get", "head"],
	url: "/user/two-factor-qr-code"
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
qrCode.url = (options) => {
	return qrCode.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
qrCode.get = (options) => ({
	url: qrCode.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
qrCode.head = (options) => ({
	url: qrCode.url(options),
	method: "head"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
var qrCodeForm = (options) => ({
	action: qrCode.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
qrCodeForm.get = (options) => ({
	action: qrCode.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController::qrCode
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorQrCodeController.php:16
* @route '/user/two-factor-qr-code'
*/
qrCodeForm.head = (options) => ({
	action: qrCode.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
qrCode.form = qrCodeForm;
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
var secretKey = (options) => ({
	url: secretKey.url(options),
	method: "get"
});
secretKey.definition = {
	methods: ["get", "head"],
	url: "/user/two-factor-secret-key"
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKey.url = (options) => {
	return secretKey.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKey.get = (options) => ({
	url: secretKey.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKey.head = (options) => ({
	url: secretKey.url(options),
	method: "head"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
var secretKeyForm = (options) => ({
	action: secretKey.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKeyForm.get = (options) => ({
	action: secretKey.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController::secretKey
* @see vendor/laravel/fortify/src/Http/Controllers/TwoFactorSecretKeyController.php:17
* @route '/user/two-factor-secret-key'
*/
secretKeyForm.head = (options) => ({
	action: secretKey.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
secretKey.form = secretKeyForm;
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
var recoveryCodes = (options) => ({
	url: recoveryCodes.url(options),
	method: "get"
});
recoveryCodes.definition = {
	methods: ["get", "head"],
	url: "/user/two-factor-recovery-codes"
};
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodes.url = (options) => {
	return recoveryCodes.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodes.get = (options) => ({
	url: recoveryCodes.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodes.head = (options) => ({
	url: recoveryCodes.url(options),
	method: "head"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
var recoveryCodesForm = (options) => ({
	action: recoveryCodes.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodesForm.get = (options) => ({
	action: recoveryCodes.url(options),
	method: "get"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::recoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:19
* @route '/user/two-factor-recovery-codes'
*/
recoveryCodesForm.head = (options) => ({
	action: recoveryCodes.url({ [options?.mergeQuery ? "mergeQuery" : "query"]: {
		_method: "HEAD",
		...options?.query ?? options?.mergeQuery ?? {}
	} }),
	method: "get"
});
recoveryCodes.form = recoveryCodesForm;
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::regenerateRecoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:38
* @route '/user/two-factor-recovery-codes'
*/
var regenerateRecoveryCodes = (options) => ({
	url: regenerateRecoveryCodes.url(options),
	method: "post"
});
regenerateRecoveryCodes.definition = {
	methods: ["post"],
	url: "/user/two-factor-recovery-codes"
};
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::regenerateRecoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:38
* @route '/user/two-factor-recovery-codes'
*/
regenerateRecoveryCodes.url = (options) => {
	return regenerateRecoveryCodes.definition.url + queryParams(options);
};
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::regenerateRecoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:38
* @route '/user/two-factor-recovery-codes'
*/
regenerateRecoveryCodes.post = (options) => ({
	url: regenerateRecoveryCodes.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::regenerateRecoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:38
* @route '/user/two-factor-recovery-codes'
*/
var regenerateRecoveryCodesForm = (options) => ({
	action: regenerateRecoveryCodes.url(options),
	method: "post"
});
/**
* @see \Laravel\Fortify\Http\Controllers\RecoveryCodeController::regenerateRecoveryCodes
* @see vendor/laravel/fortify/src/Http/Controllers/RecoveryCodeController.php:38
* @route '/user/two-factor-recovery-codes'
*/
regenerateRecoveryCodesForm.post = (options) => ({
	action: regenerateRecoveryCodes.url(options),
	method: "post"
});
regenerateRecoveryCodes.form = regenerateRecoveryCodesForm;
Object.assign(login, login$1), Object.assign(enable, enable), Object.assign(confirm, confirm), Object.assign(disable, disable), Object.assign(qrCode, qrCode), Object.assign(secretKey, secretKey), Object.assign(recoveryCodes, recoveryCodes), Object.assign(regenerateRecoveryCodes, regenerateRecoveryCodes);
//#endregion
//#region resources/js/hooks/use-two-factor-auth.ts
var useTwoFactorAuth = () => {
	const { submit } = useHttp();
	const [qrCodeSvg, setQrCodeSvg] = useState(null);
	const [manualSetupKey, setManualSetupKey] = useState(null);
	const [recoveryCodesList, setRecoveryCodesList] = useState([]);
	const [errors, setErrors] = useState([]);
	const hasSetupData = qrCodeSvg !== null && manualSetupKey !== null;
	const clearErrors = useCallback(() => {
		setErrors([]);
	}, []);
	const clearSetupData = useCallback(() => {
		setManualSetupKey(null);
		setQrCodeSvg(null);
		setErrors([]);
	}, []);
	const clearTwoFactorAuthData = useCallback(() => {
		setManualSetupKey(null);
		setQrCodeSvg(null);
		setErrors([]);
		setRecoveryCodesList([]);
	}, []);
	const fetchQrCode = useCallback(async () => {
		try {
			const { svg } = await submit(qrCode());
			setQrCodeSvg(svg);
		} catch {
			setErrors((prev) => [...prev, "Failed to fetch QR code"]);
			setQrCodeSvg(null);
		}
	}, [submit]);
	const fetchSetupKey = useCallback(async () => {
		try {
			const { secretKey: key } = await submit(secretKey());
			setManualSetupKey(key);
		} catch {
			setErrors((prev) => [...prev, "Failed to fetch a setup key"]);
			setManualSetupKey(null);
		}
	}, [submit]);
	const fetchRecoveryCodes = useCallback(async () => {
		try {
			setErrors([]);
			const codes = await submit(recoveryCodes());
			setRecoveryCodesList(codes);
		} catch {
			setErrors((prev) => [...prev, "Failed to fetch recovery codes"]);
			setRecoveryCodesList([]);
		}
	}, [submit]);
	return {
		qrCodeSvg,
		manualSetupKey,
		recoveryCodesList,
		hasSetupData,
		errors,
		clearErrors,
		clearSetupData,
		clearTwoFactorAuthData,
		fetchQrCode,
		fetchSetupKey,
		fetchSetupData: useCallback(async () => {
			try {
				setErrors([]);
				await Promise.all([fetchQrCode(), fetchSetupKey()]);
			} catch {
				setQrCodeSvg(null);
				setManualSetupKey(null);
			}
		}, [fetchQrCode, fetchSetupKey]),
		fetchRecoveryCodes
	};
};
//#endregion
export { regenerateRecoveryCodes as a, InputOTPGroup as c, enable as i, InputOTPSlot as l, confirm as n, store as o, disable as r, InputOTP as s, useTwoFactorAuth as t };

//# sourceMappingURL=use-two-factor-auth-D3qO1hpv.js.map