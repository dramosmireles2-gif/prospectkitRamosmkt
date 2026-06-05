import { useEffect, useRef } from "react";

const NOTIF_KEY = "rmkt_last_notif_date";
const ACTION_LABELS = {
  llamar: "Llamar",
  email: "Enviar email",
  demo: "Agendar demo",
  seguimiento: "Seguimiento",
  propuesta: "Enviar propuesta",
  cierre: "Cierre",
};

export function useFollowUpNotifications(prospects = []) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!prospects.length) return;

    // Pedir permiso si no lo tiene
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    const today = new Date().toISOString().split("T")[0];
    const lastNotifDate = localStorage.getItem(NOTIF_KEY);

    // Solo notificar una vez por día
    if (lastNotifDate === today) return;

    const overdue = prospects.filter(
      (p) => p.nextActionDate && p.nextActionDate <= today && !notifiedRef.current.has(p.id)
    );

    if (!overdue.length) return;

    localStorage.setItem(NOTIF_KEY, today);

    if (overdue.length === 1) {
      const p = overdue[0];
      const actionLabel = ACTION_LABELS[p.nextActionType] || "Seguimiento";
      new Notification(`RamosMKT — Seguimiento pendiente`, {
        body: `${actionLabel}: ${p.name} (${p.industry || "sin industria"})`,
        icon: "/logo-isotipo.png",
        tag: `rmkt-followup-${p.id}`,
      });
      notifiedRef.current.add(p.id);
    } else {
      new Notification(`RamosMKT — ${overdue.length} seguimientos vencidos`, {
        body: overdue.slice(0, 3).map((p) => `· ${p.name}`).join("\n") + (overdue.length > 3 ? `\n· y ${overdue.length - 3} más...` : ""),
        icon: "/logo-isotipo.png",
        tag: "rmkt-followups-batch",
      });
      overdue.forEach((p) => notifiedRef.current.add(p.id));
    }
  }, [prospects]);
}
