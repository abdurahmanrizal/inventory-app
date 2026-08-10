import { n as useAppearance, t as initializeTheme } from "./assets/use-appearance-E0ZYowTZ.js";
import { n as toUrl, t as cn } from "./assets/utils-DAgvUY2L.js";
import { t as Button } from "./assets/button-DRdOZmfE.js";
import "./assets/input-BKaRA9ml.js";
import { t as Separator } from "./assets/separator-BjHZaLGc.js";
import { a as DropdownMenuLabel, i as DropdownMenuItem, n as DropdownMenuContent, o as DropdownMenuSeparator, r as DropdownMenuGroup, s as DropdownMenuTrigger, t as DropdownMenu } from "./assets/dropdown-menu-Dez2j4dN.js";
import { i as logout, n as home, t as dashboard } from "./assets/routes-Bb8kWkRa.js";
import { t as edit } from "./assets/profile-C0rmUldE.js";
import { t as Heading } from "./assets/heading-BKCTPZtU.js";
import { t as edit$1 } from "./assets/appearance-C9XoGQxF.js";
import { t as edit$2 } from "./assets/security-C4aqlBsk.js";
import { Link, createInertiaApp, router, usePage } from "@inertiajs/react";
import * as React from "react";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Toaster, toast } from "sonner";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { BookOpen, ChevronsUpDown, FolderGit2, LayoutGrid, LogOut, Settings, XIcon } from "lucide-react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
//#region resources/js/hooks/use-flash-toast.ts
function useFlashToast() {
	useEffect(() => {
		const removeFlashListener = router.on("flash", (event) => {
			const data = (event.detail?.flash)?.toast;
			if (!data) return;
			toast[data.type](data.message);
		});
		const removeErrorListener = router.on("error", (event) => {
			const errors = event.detail?.errors;
			const message = errors ? Object.values(errors)[0] : void 0;
			toast.error(message || "Aksi gagal diproses. Silakan coba kembali.");
		});
		return () => {
			removeFlashListener();
			removeErrorListener();
		};
	}, []);
}
//#endregion
//#region resources/js/components/ui/sonner.tsx
function Toaster$1({ ...props }) {
	const { appearance } = useAppearance();
	useFlashToast();
	return /* @__PURE__ */ jsx(Toaster, {
		theme: appearance,
		className: "toaster group",
		position: "top-right",
		richColors: true,
		closeButton: true,
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)"
		},
		...props
	});
}
//#endregion
//#region resources/js/components/ui/tooltip.tsx
function TooltipProvider({ delayDuration = 0, ...props }) {
	return /* @__PURE__ */ jsx(TooltipPrimitive.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration,
		...props
	});
}
function Tooltip({ ...props }) {
	return /* @__PURE__ */ jsx(TooltipPrimitive.Root, {
		"data-slot": "tooltip",
		...props
	});
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ jsx(TooltipPrimitive.Trigger, {
		"data-slot": "tooltip-trigger",
		...props
	});
}
function TooltipContent({ className, sideOffset = 4, children, ...props }) {
	return /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxs(TooltipPrimitive.Content, {
		"data-slot": "tooltip-content",
		sideOffset,
		className: cn("bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-w-sm rounded-md px-3 py-1.5 text-xs", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(TooltipPrimitive.Arrow, { className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })]
	}) });
}
//#endregion
//#region resources/js/components/ui/sheet.tsx
function Sheet({ ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Root, {
		"data-slot": "sheet",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Portal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Overlay, {
		"data-slot": "sheet-overlay",
		className: cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(SheetPrimitive.Content, {
		"data-slot": "sheet-content",
		className: cn("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500", side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm", side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm", side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b", side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t", className),
		...props,
		children: [children, /* @__PURE__ */ jsxs(SheetPrimitive.Close, {
			className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
			children: [/* @__PURE__ */ jsx(XIcon, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-1.5 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Title, {
		"data-slot": "sheet-title",
		className: cn("text-foreground font-semibold", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(SheetPrimitive.Description, {
		"data-slot": "sheet-description",
		className: cn("text-muted-foreground text-sm", className),
		...props
	});
}
//#endregion
//#region resources/js/hooks/use-mobile.tsx
var mql = typeof window === "undefined" ? void 0 : window.matchMedia(`(max-width: 767px)`);
function mediaQueryListener(callback) {
	if (!mql) return () => {};
	mql.addEventListener("change", callback);
	return () => {
		mql.removeEventListener("change", callback);
	};
}
function isSmallerThanBreakpoint() {
	return mql?.matches ?? false;
}
function getServerSnapshot() {
	return false;
}
function useIsMobile() {
	return useSyncExternalStore(mediaQueryListener, isSmallerThanBreakpoint, getServerSnapshot);
}
//#endregion
//#region resources/js/components/ui/sidebar.tsx
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 3600 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = React.createContext(null);
function useSidebar() {
	const context = React.useContext(SidebarContext);
	if (!context) throw new Error("useSidebar must be used within a SidebarProvider.");
	return context;
}
function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }) {
	const isMobile = useIsMobile();
	const [openMobile, setOpenMobile] = React.useState(false);
	const [_open, _setOpen] = React.useState(defaultOpen);
	const open = openProp ?? _open;
	const setOpen = React.useCallback((value) => {
		const openState = typeof value === "function" ? value(open) : value;
		if (setOpenProp) setOpenProp(openState);
		else _setOpen(openState);
		document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
	}, [setOpenProp, open]);
	const toggleSidebar = React.useCallback(() => {
		return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
	}, [
		isMobile,
		setOpen,
		setOpenMobile
	]);
	React.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggleSidebar();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [toggleSidebar]);
	const state = open ? "expanded" : "collapsed";
	const contextValue = React.useMemo(() => ({
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	}), [
		state,
		open,
		setOpen,
		isMobile,
		openMobile,
		setOpenMobile,
		toggleSidebar
	]);
	return /* @__PURE__ */ jsx(SidebarContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsx("div", {
			"data-slot": "sidebar-wrapper",
			style: {
				"--sidebar-width": SIDEBAR_WIDTH,
				"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
				...style
			},
			className: cn("group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full", className),
			...props,
			children
		})
	});
}
function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
	if (collapsible === "none") return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar",
		className: cn("bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col", className),
		...props,
		children
	});
	if (isMobile) return /* @__PURE__ */ jsxs(Sheet, {
		open: openMobile,
		onOpenChange: setOpenMobile,
		...props,
		children: [/* @__PURE__ */ jsxs(SheetHeader, {
			className: "sr-only",
			children: [/* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }), /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })]
		}), /* @__PURE__ */ jsx(SheetContent, {
			"data-sidebar": "sidebar",
			"data-slot": "sidebar",
			"data-mobile": "true",
			className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
			style: { "--sidebar-width": SIDEBAR_WIDTH_MOBILE },
			side,
			children: /* @__PURE__ */ jsx("div", {
				className: "flex h-full w-full flex-col",
				children
			})
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "group peer text-sidebar-foreground hidden md:block",
		"data-state": state,
		"data-collapsible": state === "collapsed" ? collapsible : "",
		"data-variant": variant,
		"data-side": side,
		"data-slot": "sidebar",
		children: [/* @__PURE__ */ jsx("div", { className: cn("relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)") }), /* @__PURE__ */ jsx("div", {
			className: cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", className),
			...props,
			children: /* @__PURE__ */ jsx("div", {
				"data-sidebar": "sidebar",
				className: "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
				children
			})
		})]
	});
}
function SidebarInset({ className, ...props }) {
	return /* @__PURE__ */ jsx("main", {
		"data-slot": "sidebar-inset",
		className: cn("bg-background relative flex max-w-full min-h-svh flex-1 flex-col", "peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0", className),
		...props
	});
}
function SidebarHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-header",
		"data-sidebar": "header",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
}
function SidebarFooter({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-footer",
		"data-sidebar": "footer",
		className: cn("flex flex-col gap-2 p-2", className),
		...props
	});
}
function SidebarContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-content",
		"data-sidebar": "content",
		className: cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className),
		...props
	});
}
function SidebarGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-group",
		"data-sidebar": "group",
		className: cn("relative flex w-full min-w-0 flex-col p-2", className),
		...props
	});
}
function SidebarGroupLabel({ className, asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot : "div", {
		"data-slot": "sidebar-group-label",
		"data-sidebar": "group-label",
		className: cn("text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:select-none group-data-[collapsible=icon]:pointer-events-none", className),
		...props
	});
}
function SidebarGroupContent({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-group-content",
		"data-sidebar": "group-content",
		className: cn("w-full text-sm", className),
		...props
	});
}
function SidebarMenu({ className, ...props }) {
	return /* @__PURE__ */ jsx("ul", {
		"data-slot": "sidebar-menu",
		"data-sidebar": "menu",
		className: cn("flex w-full min-w-0 flex-col gap-1", className),
		...props
	});
}
function SidebarMenuItem({ className, ...props }) {
	return /* @__PURE__ */ jsx("li", {
		"data-slot": "sidebar-menu-item",
		"data-sidebar": "menu-item",
		className: cn("group/menu-item relative", className),
		...props
	});
}
var sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
		},
		size: {
			default: "h-8 text-sm",
			sm: "h-7 text-xs",
			lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function SidebarMenuButton({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }) {
	const Comp = asChild ? Slot : "button";
	const { isMobile, state } = useSidebar();
	const button = /* @__PURE__ */ jsx(Comp, {
		"data-slot": "sidebar-menu-button",
		"data-sidebar": "menu-button",
		"data-size": size,
		"data-active": isActive,
		className: cn(sidebarMenuButtonVariants({
			variant,
			size
		}), className),
		...props
	});
	if (!tooltip) return button;
	if (typeof tooltip === "string") tooltip = { children: tooltip };
	return /* @__PURE__ */ jsxs(Tooltip, { children: [/* @__PURE__ */ jsx(TooltipTrigger, {
		asChild: true,
		children: button
	}), /* @__PURE__ */ jsx(TooltipContent, {
		side: "right",
		align: "center",
		hidden: state !== "collapsed" || isMobile,
		...tooltip
	})] });
}
//#endregion
//#region resources/js/components/app-content.tsx
function AppContent({ variant = "sidebar", children, ...props }) {
	if (variant === "sidebar") return /* @__PURE__ */ jsx(SidebarInset, {
		...props,
		children
	});
	return /* @__PURE__ */ jsx("main", {
		className: "mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl",
		...props,
		children
	});
}
//#endregion
//#region resources/js/components/app-shell.tsx
function AppShell({ children, variant = "sidebar" }) {
	const isOpen = usePage().props.sidebarOpen;
	if (variant === "header") return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen w-full flex-col",
		children
	});
	return /* @__PURE__ */ jsx(SidebarProvider, {
		defaultOpen: isOpen,
		children
	});
}
//#endregion
//#region resources/js/components/app-logo.tsx
function AppLogo() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("img", {
		src: "/brand/bas-stockflow-mark.png",
		alt: "",
		className: "size-8 rounded-md object-cover"
	}), /* @__PURE__ */ jsx("div", {
		className: "ml-1 grid flex-1 text-left text-sm",
		children: /* @__PURE__ */ jsx("span", {
			className: "mb-0.5 truncate leading-tight font-semibold",
			children: "BAS StockFlow"
		})
	})] });
}
//#endregion
//#region resources/js/components/nav-footer.tsx
function NavFooter({ items, className, ...props }) {
	return /* @__PURE__ */ jsx(SidebarGroup, {
		...props,
		className: `group-data-[collapsible=icon]:p-0 ${className || ""}`,
		children: /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: items.map((item) => /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, {
			asChild: true,
			className: "text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100",
			children: /* @__PURE__ */ jsxs("a", {
				href: toUrl(item.href),
				target: "_blank",
				rel: "noopener noreferrer",
				children: [item.icon && /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }), /* @__PURE__ */ jsx("span", { children: item.title })]
			})
		}) }, item.title)) }) })
	});
}
//#endregion
//#region resources/js/hooks/use-current-url.ts
function useCurrentUrl() {
	const page = usePage();
	const currentUrlPath = new URL(page.url, typeof window !== "undefined" ? window.location.origin : "http://localhost").pathname;
	const isCurrentUrl = (urlToCheck, currentUrl, startsWith = false) => {
		const urlToCompare = currentUrl ?? currentUrlPath;
		const urlString = toUrl(urlToCheck);
		const comparePath = (path) => startsWith ? urlToCompare.startsWith(path) : path === urlToCompare;
		if (!urlString.startsWith("http")) return comparePath(urlString);
		try {
			return comparePath(new URL(urlString).pathname);
		} catch {
			return false;
		}
	};
	const isCurrentOrParentUrl = (urlToCheck, currentUrl) => {
		return isCurrentUrl(urlToCheck, currentUrl, true);
	};
	const whenCurrentUrl = (urlToCheck, ifTrue, ifFalse = null) => {
		return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
	};
	return {
		currentUrl: currentUrlPath,
		isCurrentUrl,
		isCurrentOrParentUrl,
		whenCurrentUrl
	};
}
//#endregion
//#region resources/js/components/nav-main.tsx
function NavMain({ items = [] }) {
	const { isCurrentUrl } = useCurrentUrl();
	return /* @__PURE__ */ jsxs(SidebarGroup, {
		className: "px-2 py-0",
		children: [/* @__PURE__ */ jsx(SidebarGroupLabel, { children: "Platform" }), /* @__PURE__ */ jsx(SidebarMenu, { children: items.map((item) => /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, {
			asChild: true,
			isActive: isCurrentUrl(item.href),
			tooltip: { children: item.title },
			children: /* @__PURE__ */ jsxs(Link, {
				href: item.href,
				prefetch: true,
				children: [item.icon && /* @__PURE__ */ jsx(item.icon, {}), /* @__PURE__ */ jsx("span", { children: item.title })]
			})
		}) }, item.title)) })]
	});
}
//#endregion
//#region resources/js/components/ui/avatar.tsx
function Avatar({ className, ...props }) {
	return /* @__PURE__ */ jsx(AvatarPrimitive.Root, {
		"data-slot": "avatar",
		className: cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className),
		...props
	});
}
function AvatarImage({ className, ...props }) {
	return /* @__PURE__ */ jsx(AvatarPrimitive.Image, {
		"data-slot": "avatar-image",
		className: cn("aspect-square size-full", className),
		...props
	});
}
function AvatarFallback({ className, ...props }) {
	return /* @__PURE__ */ jsx(AvatarPrimitive.Fallback, {
		"data-slot": "avatar-fallback",
		className: cn("bg-muted flex size-full items-center justify-center rounded-full", className),
		...props
	});
}
//#endregion
//#region resources/js/hooks/use-initials.tsx
function getInitial(name) {
	return Array.from(name)[0] ?? "";
}
function useInitials() {
	return useCallback((fullName) => {
		const names = fullName.trim().split(/\s+/u).filter(Boolean);
		if (names.length === 0) return "";
		if (names.length === 1) return getInitial(names[0]).toUpperCase();
		return `${getInitial(names[0])}${getInitial(names[names.length - 1])}`.toUpperCase();
	}, []);
}
//#endregion
//#region resources/js/components/user-info.tsx
function UserInfo({ user, showEmail = false }) {
	const getInitials = useInitials();
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(Avatar, {
		className: "h-8 w-8 overflow-hidden rounded-full",
		children: [/* @__PURE__ */ jsx(AvatarImage, {
			src: user.avatar,
			alt: user.name
		}), /* @__PURE__ */ jsx(AvatarFallback, {
			className: "rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white",
			children: getInitials(user.name)
		})]
	}), /* @__PURE__ */ jsxs("div", {
		className: "grid flex-1 text-left text-sm leading-tight",
		children: [/* @__PURE__ */ jsx("span", {
			className: "truncate font-medium",
			children: user.name
		}), showEmail && /* @__PURE__ */ jsx("span", {
			className: "truncate text-xs text-muted-foreground",
			children: user.email
		})]
	})] });
}
//#endregion
//#region resources/js/hooks/use-mobile-navigation.ts
function useMobileNavigation() {
	return useCallback(() => {
		document.body.style.removeProperty("pointer-events");
	}, []);
}
//#endregion
//#region resources/js/components/user-menu-content.tsx
function UserMenuContent({ user }) {
	const cleanup = useMobileNavigation();
	const handleLogout = () => {
		cleanup();
		router.flushAll();
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(DropdownMenuLabel, {
			className: "p-0 font-normal",
			children: /* @__PURE__ */ jsx("div", {
				className: "flex items-center gap-2 px-1 py-1.5 text-left text-sm",
				children: /* @__PURE__ */ jsx(UserInfo, {
					user,
					showEmail: true
				})
			})
		}),
		/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
		/* @__PURE__ */ jsx(DropdownMenuGroup, { children: /* @__PURE__ */ jsx(DropdownMenuItem, {
			asChild: true,
			children: /* @__PURE__ */ jsxs(Link, {
				className: "block w-full cursor-pointer",
				href: edit(),
				prefetch: true,
				onClick: cleanup,
				children: [/* @__PURE__ */ jsx(Settings, { className: "mr-2" }), "Settings"]
			})
		}) }),
		/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
		/* @__PURE__ */ jsx(DropdownMenuItem, {
			asChild: true,
			children: /* @__PURE__ */ jsxs(Link, {
				className: "block w-full cursor-pointer",
				href: logout(),
				as: "button",
				onClick: handleLogout,
				"data-test": "logout-button",
				children: [/* @__PURE__ */ jsx(LogOut, { className: "mr-2" }), "Log out"]
			})
		})
	] });
}
//#endregion
//#region resources/js/components/nav-user.tsx
function NavUser() {
	const { auth } = usePage().props;
	const { state } = useSidebar();
	const isMobile = useIsMobile();
	if (!auth.user) return null;
	return /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs(SidebarMenuButton, {
			size: "lg",
			className: "group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent",
			"data-test": "sidebar-menu-button",
			children: [/* @__PURE__ */ jsx(UserInfo, { user: auth.user }), /* @__PURE__ */ jsx(ChevronsUpDown, { className: "ml-auto size-4" })]
		})
	}), /* @__PURE__ */ jsx(DropdownMenuContent, {
		className: "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
		align: "end",
		side: isMobile ? "bottom" : state === "collapsed" ? "left" : "bottom",
		children: /* @__PURE__ */ jsx(UserMenuContent, { user: auth.user })
	})] }) }) });
}
//#endregion
//#region resources/js/components/app-sidebar.tsx
var mainNavItems = [{
	title: "Dashboard",
	href: dashboard(),
	icon: LayoutGrid
}];
var footerNavItems = [{
	title: "Repository",
	href: "https://github.com/laravel/react-starter-kit",
	icon: FolderGit2
}, {
	title: "Documentation",
	href: "https://laravel.com/docs/starter-kits#react",
	icon: BookOpen
}];
function AppSidebar() {
	return /* @__PURE__ */ jsxs(Sidebar, {
		collapsible: "icon",
		variant: "inset",
		children: [
			/* @__PURE__ */ jsx(SidebarHeader, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, {
				size: "lg",
				asChild: true,
				children: /* @__PURE__ */ jsx(Link, {
					href: dashboard(),
					prefetch: true,
					children: /* @__PURE__ */ jsx(AppLogo, {})
				})
			}) }) }) }),
			/* @__PURE__ */ jsx(SidebarContent, { children: /* @__PURE__ */ jsx(NavMain, { items: mainNavItems }) }),
			/* @__PURE__ */ jsxs(SidebarFooter, { children: [/* @__PURE__ */ jsx(NavFooter, {
				items: footerNavItems,
				className: "mt-auto"
			}), /* @__PURE__ */ jsx(NavUser, {})] })
		]
	});
}
//#endregion
//#region resources/js/layouts/app/app-sidebar-layout.tsx
function AppSidebarLayout({ children, breadcrumbs = [] }) {
	return /* @__PURE__ */ jsxs(AppShell, {
		variant: "sidebar",
		children: [/* @__PURE__ */ jsx(AppSidebar, {}), /* @__PURE__ */ jsx(AppContent, {
			variant: "sidebar",
			className: "overflow-x-hidden",
			children
		})]
	});
}
//#endregion
//#region resources/js/layouts/app-layout.tsx
function AppLayout({ breadcrumbs = [], children }) {
	return /* @__PURE__ */ jsx(AppSidebarLayout, {
		breadcrumbs,
		children
	});
}
//#endregion
//#region resources/js/components/app-logo-icon.tsx
function AppLogoIcon(props) {
	return /* @__PURE__ */ jsx("svg", {
		...props,
		viewBox: "0 0 430 430",
		xmlns: "http://www.w3.org/2000/svg",
		children: /* @__PURE__ */ jsx("image", {
			href: "/brand/bas-stockflow-mark.png",
			width: "430",
			height: "430",
			preserveAspectRatio: "xMidYMid slice"
		})
	});
}
//#endregion
//#region resources/js/layouts/auth/auth-simple-layout.tsx
function AuthSimpleLayout({ children, title, description }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10",
		children: /* @__PURE__ */ jsx("div", {
			className: "w-full max-w-sm",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-col items-center gap-4",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: home(),
						className: "flex flex-col items-center gap-2 font-medium",
						children: [/* @__PURE__ */ jsx("div", {
							className: "mb-1 flex h-9 w-9 items-center justify-center rounded-md",
							children: /* @__PURE__ */ jsx(AppLogoIcon, { className: "size-9 fill-current text-[var(--foreground)] dark:text-white" })
						}), /* @__PURE__ */ jsx("span", {
							className: "sr-only",
							children: title
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-2 text-center",
						children: [/* @__PURE__ */ jsx("h1", {
							className: "text-xl font-medium",
							children: title
						}), /* @__PURE__ */ jsx("p", {
							className: "text-center text-sm text-muted-foreground",
							children: description
						})]
					})]
				}), children]
			})
		})
	});
}
//#endregion
//#region resources/js/layouts/auth-layout.tsx
function AuthLayout({ title = "", description = "", children }) {
	return /* @__PURE__ */ jsx(AuthSimpleLayout, {
		title,
		description,
		children
	});
}
//#endregion
//#region resources/js/layouts/settings/layout.tsx
var sidebarNavItems = [
	{
		title: "Profile",
		href: edit(),
		icon: null
	},
	{
		title: "Security",
		href: edit$2(),
		icon: null
	},
	{
		title: "Appearance",
		href: edit$1(),
		icon: null
	}
];
function SettingsLayout({ children }) {
	const { isCurrentOrParentUrl } = useCurrentUrl();
	const { auth } = usePage().props;
	const navItems = auth.user.role === "superadmin" ? [...sidebarNavItems, {
		title: "Valuasi Persediaan",
		href: "/settings/inventory-valuation",
		icon: null
	}] : sidebarNavItems;
	return /* @__PURE__ */ jsxs("div", {
		className: "px-4 py-6",
		children: [/* @__PURE__ */ jsx(Heading, {
			title: "Settings",
			description: "Manage your profile and account settings"
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col lg:flex-row lg:space-x-12",
			children: [
				/* @__PURE__ */ jsx("aside", {
					className: "w-full max-w-xl lg:w-48",
					children: /* @__PURE__ */ jsx("nav", {
						className: "flex flex-col space-y-1 space-x-0",
						"aria-label": "Settings",
						children: navItems.map((item, index) => /* @__PURE__ */ jsx(Button, {
							size: "sm",
							variant: "ghost",
							asChild: true,
							className: cn("w-full justify-start", { "bg-muted": isCurrentOrParentUrl(item.href) }),
							children: /* @__PURE__ */ jsxs(Link, {
								href: item.href,
								children: [item.icon && /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }), item.title]
							})
						}, `${toUrl(item.href)}-${index}`))
					})
				}),
				/* @__PURE__ */ jsx(Separator, { className: "my-6 lg:hidden" }),
				/* @__PURE__ */ jsx("div", {
					className: "flex-1 md:max-w-2xl",
					children: /* @__PURE__ */ jsx("section", {
						className: "max-w-xl space-y-12",
						children
					})
				})
			]
		})]
	});
}
//#endregion
//#region ../../../../@vite-plugin-pwa/virtual:pwa-register
var autoUpdateMode = "true";
var selfDestroying = "false";
var auto = autoUpdateMode === "true";
var autoDestroy = selfDestroying === "true";
function registerSW(options = {}) {
	const { immediate = false, onNeedReload, onNeedRefresh, onOfflineReady, onRegistered, onRegisteredSW, onRegisterError } = options;
	let wb;
	let registerPromise;
	let sendSkipWaitingMessage;
	const updateServiceWorker = async (_reloadPage = true) => {
		await registerPromise;
		if (!auto) sendSkipWaitingMessage?.();
	};
	async function register() {
		if ("serviceWorker" in navigator) {
			wb = await import("./assets/workbox-window.prod.es5-CkHxznpn.js").then(({ Workbox }) => {
				return new Workbox("/build/../sw.js", {
					scope: "/",
					type: "classic"
				});
			}).catch((e) => {
				onRegisterError?.(e);
			});
			if (!wb) return;
			sendSkipWaitingMessage = () => {
				wb?.messageSkipWaiting();
			};
			if (!autoDestroy) if (auto) {
				wb.addEventListener("activated", (event) => {
					if (event.isUpdate || event.isExternal) if (onNeedReload) onNeedReload();
					else window.location.reload();
				});
				wb.addEventListener("installed", (event) => {
					if (!event.isUpdate) onOfflineReady?.();
				});
			} else {
				let onNeedRefreshCalled = false;
				const showSkipWaitingPrompt = () => {
					onNeedRefreshCalled = true;
					wb?.addEventListener("controlling", (event) => {
						if (event.isUpdate) if (onNeedReload) onNeedReload();
						else window.location.reload();
					});
					onNeedRefresh?.();
				};
				wb.addEventListener("installed", (event) => {
					if (typeof event.isUpdate === "undefined") if (typeof event.isExternal !== "undefined") if (event.isExternal) showSkipWaitingPrompt();
					else !onNeedRefreshCalled && onOfflineReady?.();
					else !onNeedRefreshCalled && onOfflineReady?.();
					else if (!event.isUpdate) onOfflineReady?.();
				});
				wb.addEventListener("waiting", showSkipWaitingPrompt);
			}
			wb.register({ immediate }).then((r) => {
				if (onRegisteredSW) onRegisteredSW("/build/../sw.js", r);
				else onRegistered?.(r);
			}).catch((e) => {
				onRegisterError?.(e);
			});
		}
	}
	registerPromise = register();
	return updateServiceWorker;
}
//#endregion
//#region resources/js/app.tsx
var appName = "BAS StockFlow";
registerSW({ immediate: true });
router.on("before", (event) => {
	if (navigator.onLine || String(event.detail.visit.method).toLowerCase() === "get") return;
	event.preventDefault();
	toast.error("Transaksi tidak dapat diproses saat perangkat offline.");
});
var render = await createInertiaApp({
	resolve: async (name, page) => {
		const pages = /* #__PURE__ */ Object.assign({
			"./pages/AccessManagement/Index.tsx": () => import("./assets/Index-DUIE24Gi.js"),
			"./pages/Approvals/Index.tsx": () => import("./assets/Index-DSsP1EMN.js"),
			"./pages/Dashboard/Index.tsx": () => import("./assets/Index-CcMJiST1.js"),
			"./pages/Operations/Index.tsx": () => import("./assets/Index-B2KiZxn9.js"),
			"./pages/PermissionManagement/Index.tsx": () => import("./assets/Index-BekbHHaB.js"),
			"./pages/Reports/Index.tsx": () => import("./assets/Index-DXjGAOq9.js"),
			"./pages/RoleManagement/Index.tsx": () => import("./assets/Index-CJE-p0OK.js"),
			"./pages/StockIn/Index.tsx": () => import("./assets/Index-G1GhCXkF.js"),
			"./pages/StockOut/Index.tsx": () => import("./assets/Index-BnbGRmUi.js"),
			"./pages/StockRequests/Index.tsx": () => import("./assets/Index-DYH_DNA6.js"),
			"./pages/TransactionActivity/Index.tsx": () => import("./assets/Index-DnZS-cCZ.js"),
			"./pages/UserManagement/Index.tsx": () => import("./assets/Index-CBenghWP.js"),
			"./pages/WarehouseManagement/Index.tsx": () => import("./assets/Index-DmDmSwo3.js"),
			"./pages/WarehouseStock/Index.tsx": () => import("./assets/Index-DVZNgr5X.js"),
			"./pages/auth/confirm-password.tsx": () => import("./assets/confirm-password-B995hChi.js"),
			"./pages/auth/forgot-password.tsx": () => import("./assets/forgot-password-Dvk5pVHT.js"),
			"./pages/auth/login.tsx": () => import("./assets/login-Byao3s3h.js"),
			"./pages/auth/register.tsx": () => import("./assets/register-BfsLT00C.js"),
			"./pages/auth/reset-password.tsx": () => import("./assets/reset-password-BqagzoX0.js"),
			"./pages/auth/two-factor-challenge.tsx": () => import("./assets/two-factor-challenge-DZY70zct.js"),
			"./pages/auth/verify-email.tsx": () => import("./assets/verify-email-NKKaWzy6.js"),
			"./pages/dashboard.tsx": () => import("./assets/dashboard-B8Y-MvAf.js"),
			"./pages/settings/appearance.tsx": () => import("./assets/appearance-BubYqRqX.js"),
			"./pages/settings/inventory-valuation.tsx": () => import("./assets/inventory-valuation-FQ85_A47.js"),
			"./pages/settings/profile.tsx": () => import("./assets/profile-Dwr_fwUB.js"),
			"./pages/settings/security.tsx": () => import("./assets/security-Bxfb-WLb.js"),
			"./pages/welcome.tsx": () => import("./assets/welcome-Bifb-WBv.js")
		});
		const module = await (pages[`./pages/${name}.tsx`] || pages[`./pages/${name}.jsx`] || pages[`./Pages/${name}.tsx`] || pages[`./Pages/${name}.jsx`])?.();
		if (!module) throw new Error(`Page not found: ${name}`);
		return module.default ?? module;
	},
	title: (title) => title ? `${title} - ${appName}` : appName,
	layout: (name) => {
		if (name === "auth/login" || [
			"Dashboard/",
			"StockIn/",
			"StockOut/",
			"Approvals/",
			"Operations/",
			"WarehouseStock/",
			"TransactionActivity/",
			"StockRequests",
			"UserManagement/",
			"WarehouseManagement/",
			"AccessManagement/",
			"RoleManagement/",
			"PermissionManagement/",
			"Reports/",
			"settings/inventory-valuation"
		].some((prefix) => name.startsWith(prefix))) return null;
		switch (true) {
			case name === "welcome": return null;
			case name.startsWith("auth/"): return AuthLayout;
			case name.startsWith("settings/"): return [AppLayout, SettingsLayout];
			case name === "dashboard": return AppLayout;
			default: return null;
		}
	},
	strictMode: true,
	withApp(app) {
		return /* @__PURE__ */ jsxs(TooltipProvider, {
			delayDuration: 0,
			children: [app, /* @__PURE__ */ jsx(Toaster$1, {})]
		});
	},
	progress: { color: "#4B5563" }
});
var renderPage = (page) => render(page, renderToString);
createServer(renderPage);
initializeTheme();
//#endregion
export { renderPage as default };

//# sourceMappingURL=app.js.map