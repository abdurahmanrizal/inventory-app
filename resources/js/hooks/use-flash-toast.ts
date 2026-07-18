import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { FlashToast } from "@/types/ui";

export function useFlashToast(): void {
  useEffect(() => {
    const removeFlashListener = router.on("flash", (event) => {
      const flash = (event as CustomEvent).detail?.flash;
      const data = flash?.toast as FlashToast | undefined;

      if (!data) {
        return;
      }

      toast[data.type](data.message);
    });

    const removeErrorListener = router.on("error", (event) => {
      const errors = (event as CustomEvent).detail?.errors as
        Record<string, string> | undefined;
      const message = errors ? Object.values(errors)[0] : undefined;
      toast.error(message || "Aksi gagal diproses. Silakan coba kembali.");
    });

    return () => {
      removeFlashListener();
      removeErrorListener();
    };
  }, []);
}
