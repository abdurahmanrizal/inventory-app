import { router } from "@inertiajs/react";
import { Bell, CheckCheck, ClipboardCheck, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const eventStyle = {
  approval_required: [ClipboardCheck, "bg-amber-50 text-amber-600"],
  request_fully_approved: [CheckCheck, "bg-emerald-50 text-emerald-600"],
  request_rejected: [XCircle, "bg-rose-50 text-rose-600"],
};

export default function NotificationMenu({ notifications }) {
  const [feed, setFeed] = useState(
    notifications || { unread_count: 0, items: [] },
  );
  const requestRef = useRef(null);
  const unreadCount = Number(feed?.unread_count || 0);
  const items = feed?.items || [];

  const refreshNotifications = useCallback(async () => {
    if (
      document.visibilityState !== "visible" ||
      !navigator.onLine ||
      requestRef.current
    )
      return;

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch("/notifications", {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
      });
      if (response.ok) setFeed(await response.json());
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("Notifikasi belum dapat diperbarui.", error);
      }
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, []);

  useEffect(() => {
    setFeed(notifications || { unread_count: 0, items: [] });
  }, [notifications]);

  useEffect(() => {
    const interval = window.setInterval(refreshNotifications, 30_000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshNotifications();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("online", refreshNotifications);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("online", refreshNotifications);
      requestRef.current?.abort();
    };
  }, [refreshNotifications]);

  const openNotification = (notification) => {
    const actionUrl = notification.data?.action_url || "/stock-requests";
    if (notification.read_at) {
      router.visit(actionUrl);
      return;
    }

    router.patch(
      `/notifications/${notification.id}/read`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => router.visit(actionUrl),
      },
    );
  };

  return (
    <DropdownMenu onOpenChange={(isOpen) => isOpen && refreshNotifications()}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ""}`}
          className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-emerald-200 hover:text-emerald-600"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:w-[390px]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">Notifikasi</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {unreadCount} notifikasi belum dibaca
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() =>
                router.patch(
                  "/notifications/read-all",
                  {},
                  {
                    preserveScroll: true,
                    onSuccess: refreshNotifications,
                  },
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              <CheckCheck size={14} /> Tandai semua dibaca
            </button>
          )}
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {items.length ? (
            items.map((notification) => {
              const event = notification.data?.event;
              const [Icon, tone] = eventStyle[event] || [
                Bell,
                "bg-blue-50 text-blue-600",
              ];

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotification(notification)}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-0 hover:bg-slate-50 ${notification.read_at ? "bg-white" : "bg-emerald-50/35"}`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="flex-1 text-xs font-semibold text-slate-800">
                        {notification.data?.title || "Notifikasi workflow"}
                      </span>
                      {!notification.read_at && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" />
                      )}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {notification.data?.message}
                    </span>
                    <span className="mt-1.5 block text-[10px] font-medium text-slate-400">
                      {notification.created_at
                        ? new Date(notification.created_at).toLocaleString(
                            "id-ID",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )
                        : ""}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell size={19} />
              </span>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Belum ada notifikasi
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Update approval request akan tampil di sini.
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
