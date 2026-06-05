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

  async function downloadAll(refs, formats, baseFilename) {
    if (downloading) return;
    setDownloading(true);
    setMessage("Generando ZIP...");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const fmt of formats) {
        const el = refs[fmt.id]?.current;
        if (!el) continue;
        setMessage(`Renderizando ${fmt.label}...`);
        const canvas = await html2canvas(el, {
          scale: 1,
          backgroundColor: "#0a0a0f",
          useCORS: true,
          logging: false,
          width: fmt.w,
          height: fmt.h
        });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));
        zip.file(`${baseFilename}-${fmt.id}.jpg`, blob);
      }
      setMessage("Comprimiendo...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.download = `${baseFilename}-todos.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("ZIP descargado ✓");
    } catch {
      setMessage("Error al generar ZIP");
    } finally {
      setDownloading(false);
      setTimeout(() => setMessage(""), 2200);
    }
  }

  return { exportRef, downloading, message, download, downloadAll };
}
