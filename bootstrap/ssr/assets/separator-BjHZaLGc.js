import { t as cn } from "./utils-DAgvUY2L.js";
import "react";
import { jsx } from "react/jsx-runtime";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
//#region resources/js/components/ui/separator.tsx
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ jsx(SeparatorPrimitive.Root, {
		"data-slot": "separator-root",
		decorative,
		orientation,
		className: cn("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className),
		...props
	});
}
//#endregion
export { Separator as t };

//# sourceMappingURL=separator-BjHZaLGc.js.map