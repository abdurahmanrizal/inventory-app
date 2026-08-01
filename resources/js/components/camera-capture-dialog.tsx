import {
  AlertCircle,
  Camera,
  Check,
  RefreshCcw,
  SwitchCamera,
} from "lucide-react";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  onCapture: (file: File) => void;
};

export default function CameraCaptureDialog({
  open,
  onOpenChange,
  label,
  onCapture,
}: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const reset = () => {
    setPhoto(null);
    setCameraReady(false);
    setCameraError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const takePhoto = () => {
    const image = webcamRef.current?.getScreenshot({
      width: 1600,
      height: 1200,
    });

    if (image) setPhoto(image);
  };

  const usePhoto = async () => {
    if (!photo) return;

    const blob = await fetch(photo).then((response) => response.blob());
    const file = new File([blob], `kamera-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="px-5 pb-3 pt-5 text-left sm:px-6">
          <DialogTitle>Ambil {label}</DialogTitle>
          <DialogDescription>
            Arahkan kamera ke dokumen hingga seluruh bagian terlihat jelas.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
          {photo ? (
            <img
              src={photo}
              alt={`Pratinjau ${label}`}
              className="size-full object-contain"
            />
          ) : (
            <Webcam
              key={facingMode}
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.82}
              videoConstraints={{
                facingMode: { ideal: facingMode },
                width: { ideal: 1600 },
                height: { ideal: 1200 },
              }}
              onUserMedia={() => {
                setCameraReady(true);
                setCameraError("");
              }}
              onUserMediaError={() => {
                setCameraReady(false);
                setCameraError(
                  "Kamera tidak dapat diakses. Pastikan izin kamera diberikan dan aplikasi dibuka melalui HTTPS.",
                );
              }}
              className="size-full object-cover"
            />
          )}

          {!photo && !cameraReady && !cameraError && (
            <div className="absolute inset-0 grid place-items-center bg-slate-950 text-sm text-white">
              Membuka kamera…
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 grid place-items-center bg-slate-950 p-8 text-center text-sm leading-6 text-white">
              <span>
                <AlertCircle className="mx-auto mb-3 text-amber-400" />
                {cameraError}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
          {!photo ? (
            <>
              <button
                type="button"
                disabled={Boolean(cameraError)}
                onClick={() => {
                  setCameraReady(false);
                  setFacingMode((mode) =>
                    mode === "environment" ? "user" : "environment",
                  );
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <SwitchCamera size={17} /> Ganti kamera
              </button>
              <button
                type="button"
                disabled={!cameraReady || Boolean(cameraError)}
                onClick={takePhoto}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
              >
                <Camera size={17} /> Ambil foto
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw size={17} /> Ambil ulang
              </button>
              <button
                type="button"
                onClick={usePhoto}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                <Check size={17} /> Gunakan foto
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
