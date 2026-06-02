export function exportProspectsCsv(prospects) {
  const headers = ["Nombre", "Industria", "Ciudad", "Score", "Status", "Website", "Instagram", "Facebook", "WhatsApp", "Notas", "Creado"];
  const rows = prospects.map((p) => [
    p.name,
    p.industry,
    p.city,
    p.opportunityScore,
    p.status,
    p.website,
    p.instagram,
    p.facebook,
    p.whatsapp,
    (p.notes || "").replace(/[\n\r]+/g, " "),
    p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-MX") : ""
  ]);

  const escape = (val) => {
    const str = String(val ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const csv = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `prospectos-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
