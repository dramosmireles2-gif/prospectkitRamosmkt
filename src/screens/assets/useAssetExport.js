import { useRef, useState } from "react";

export function useAssetExport({ filename }) {
  const exportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  async function download(format = "png", width, height) {
    if (!exportRef.current || downloading) return;
    setDownloading(true);
    setMessage("Renderizando...");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(exportRef.current, {
        scale: 1,
        backgroundColor: "#0a0a0f",
        useCORS: true,
        logging: false,
        width,
        height
      });
      const link = document.createElement("a");
      link.download = `${filename}.${format}`;
      link.href = canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png", 0.95);
      link.click();
      setMessage("Descargado ✓");
    } catch {
      setMessage("Error al generar");
    } finally {
      setDownloading(false);
      setTimeout(() => setMessage(""), 2200);
    }
  }

  return { exportRef, downloading, message, download };
}
