import { createInertiaApp, router } from "@inertiajs/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTheme } from "@/hooks/use-appearance";
import AppLayout from "@/layouts/app-layout";
import AuthLayout from "@/layouts/auth-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

const appName = import.meta.env.VITE_APP_NAME || "BAS StockFlow";

registerSW({ immediate: true });

router.on("before", (event) => {
  if (
    navigator.onLine ||
    String(event.detail.visit.method).toLowerCase() === "get"
  ) {
    return;
  }

  event.preventDefault();
  toast.error("Transaksi tidak dapat diproses saat perangkat offline.");
});

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  layout: (name) => {
    const wmsPages = [
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
      "settings/inventory-valuation",
    ];

    if (
      name === "auth/login" ||
      wmsPages.some((prefix) => name.startsWith(prefix))
    ) {
      return null;
    }

    switch (true) {
      case name === "welcome":
        return null;
      case name.startsWith("auth/"):
        return AuthLayout;
      case name.startsWith("settings/"):
        return [AppLayout, SettingsLayout];
      case name === "dashboard":
        return AppLayout;
      default:
        return null;
    }
  },
  strictMode: true,
  withApp(app) {
    return (
      <TooltipProvider delayDuration={0}>
        {app}
        <Toaster />
      </TooltipProvider>
    );
  },
  progress: {
    color: "#4B5563",
  },
});

// This will set light / dark mode on load...
initializeTheme();
