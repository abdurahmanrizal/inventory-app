import { t as dashboard } from "./routes-Bb8kWkRa.js";
import { Head } from "@inertiajs/react";
import { useId } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region resources/js/components/ui/placeholder-pattern.tsx
function PlaceholderPattern({ className }) {
	const patternId = useId();
	return /* @__PURE__ */ jsxs("svg", {
		className,
		fill: "none",
		children: [/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("pattern", {
			id: patternId,
			x: "0",
			y: "0",
			width: "10",
			height: "10",
			patternUnits: "userSpaceOnUse",
			children: /* @__PURE__ */ jsx("path", { d: "M-3 13 15-5M-5 5l18-18M-1 21 17 3" })
		}) }), /* @__PURE__ */ jsx("rect", {
			stroke: "none",
			fill: `url(#${patternId})`,
			width: "100%",
			height: "100%"
		})]
	});
}
//#endregion
//#region resources/js/pages/dashboard.tsx
function Dashboard() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Dashboard" }), /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid auto-rows-min gap-4 md:grid-cols-3",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border",
					children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border",
					children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" })
				}),
				/* @__PURE__ */ jsx("div", {
					className: "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border",
					children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" })
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border",
			children: /* @__PURE__ */ jsx(PlaceholderPattern, { className: "absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" })
		})]
	})] });
}
Dashboard.layout = { breadcrumbs: [{
	title: "Dashboard",
	href: dashboard()
}] };
//#endregion
export { Dashboard as default };

//# sourceMappingURL=dashboard-B8Y-MvAf.js.map