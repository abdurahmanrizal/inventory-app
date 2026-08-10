import { t as cn } from "./utils-DAgvUY2L.js";
import { Link } from "@inertiajs/react";
import { jsx } from "react/jsx-runtime";
//#region resources/js/components/text-link.tsx
function TextLink({ className = "", children, ...props }) {
	return /* @__PURE__ */ jsx(Link, {
		className: cn("text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500", className),
		...props,
		children
	});
}
//#endregion
export { TextLink as t };

//# sourceMappingURL=text-link-Cme2xW04.js.map