import { t as cn } from "./utils-DAgvUY2L.js";
import "react";
import { jsx } from "react/jsx-runtime";
import * as LabelPrimitive from "@radix-ui/react-label";
//#region resources/js/components/ui/label.tsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx(LabelPrimitive.Root, {
		"data-slot": "label",
		className: cn("text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Label as t };

//# sourceMappingURL=label-3LcUKzgf.js.map