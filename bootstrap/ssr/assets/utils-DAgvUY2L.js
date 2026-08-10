import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region resources/js/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function toUrl(url) {
	return typeof url === "string" ? url : url.url;
}
//#endregion
export { toUrl as n, cn as t };

//# sourceMappingURL=utils-DAgvUY2L.js.map