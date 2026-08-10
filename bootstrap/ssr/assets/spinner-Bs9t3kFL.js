import { t as cn } from "./utils-DAgvUY2L.js";
import { jsx } from "react/jsx-runtime";
import { Loader2Icon } from "lucide-react";
//#region resources/js/components/ui/spinner.tsx
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ jsx(Loader2Icon, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
//#endregion
export { Spinner as t };

//# sourceMappingURL=spinner-Bs9t3kFL.js.map