import { t as Button } from "./button-DRdOZmfE.js";
import { t as Input } from "./input-BKaRA9ml.js";
import { t as InputError } from "./input-error-kjOtsSWi.js";
import { t as Spinner } from "./spinner-Bs9t3kFL.js";
import { t as PasswordInput } from "./password-input-BoWWpS-H.js";
import { t as Label } from "./label-3LcUKzgf.js";
import { n as update } from "./password-BWdBegUB.js";
import { Form, Head } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/pages/auth/reset-password.tsx
function ResetPassword({ token, email, passwordRules }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Reset password" }), /* @__PURE__ */ jsx(Form, {
		...update.form(),
		transform: (data) => ({
			...data,
			token,
			email
		}),
		resetOnSuccess: ["password", "password_confirmation"],
		children: ({ processing, errors }) => /* @__PURE__ */ jsxs("div", {
			className: "grid gap-6",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ jsx(Label, {
							htmlFor: "email",
							children: "Email"
						}),
						/* @__PURE__ */ jsx(Input, {
							id: "email",
							type: "email",
							name: "email",
							autoComplete: "email",
							value: email,
							className: "mt-1 block w-full",
							readOnly: true
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: errors.email,
							className: "mt-2"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ jsx(Label, {
							htmlFor: "password",
							children: "Password"
						}),
						/* @__PURE__ */ jsx(PasswordInput, {
							id: "password",
							name: "password",
							autoComplete: "new-password",
							className: "mt-1 block w-full",
							autoFocus: true,
							placeholder: "Password",
							passwordrules: passwordRules
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
							autoComplete: "new-password",
							className: "mt-1 block w-full",
							placeholder: "Confirm password",
							passwordrules: passwordRules
						}),
						/* @__PURE__ */ jsx(InputError, {
							message: errors.password_confirmation,
							className: "mt-2"
						})
					]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					className: "mt-4 w-full",
					disabled: processing,
					"data-test": "reset-password-button",
					children: [processing && /* @__PURE__ */ jsx(Spinner, {}), "Reset password"]
				})
			]
		})
	})] });
}
ResetPassword.layout = {
	title: "Reset password",
	description: "Please enter your new password below"
};
//#endregion
export { ResetPassword as default };

//# sourceMappingURL=reset-password-BqagzoX0.js.map