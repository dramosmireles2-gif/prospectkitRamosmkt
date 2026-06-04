import { formatCurrency } from "../utils/format";

export const SERVICE_CATALOG = [
  {
    id: "web",
    service: "Landing Page / Sitio web",
    shortService: "Landing Page",
    icon: "🌐",
    type: "unico",
    price: 3500,
    setupPrice: 0,
    clientMonthlyGain: 15750,
    desc: "Sitio de captacion con CTA claros y propuesta de valor enfocada.",
    billingNote: "Cobro unico. Dominio y mantenimiento se cotizan por separado.",
    keywords: ["landing", "sitio", "pagina", "web"]
  },
  {
    id: "ecom",
    service: "Catalogo / Tienda online",
    shortService: "Tienda online",
    icon: "🛒",
    type: "setup+mensual",
    price: 800,
    setupPrice: 4500,
    clientMonthlyGain: 7200,
    desc: "Convierte interes organico en pedidos digitales con catalogo activo.",
    billingNote: "Incluye setup inicial y luego una gestion mensual.",
    keywords: ["tienda", "catalogo", "ecommerce", "e-commerce"]
  },
  {
    id: "gmb",
    service: "Google My Business",
    shortService: "Google My Business",
    icon: "📍",
    type: "mensual",
    price: 800,
    setupPrice: 0,
    clientMonthlyGain: 4800,
    desc: "Activa busquedas locales, reseñas y rutas directas a tu negocio.",
    billingNote: "Gestion recurrente para mantener presencia local activa.",
    keywords: ["google", "maps", "gmb", "business"]
  },
  {
    id: "ads",
    service: "Meta Ads locales",
    shortService: "Meta Ads locales",
    icon: "📣",
    type: "mensual",
    price: 2200,
    setupPrice: 0,
    clientMonthlyGain: 7700,
    desc: "Campañas de adquisicion con segmentacion local y objetivo de conversion.",
    billingNote: "Servicio recurrente. La pauta publicitaria puede cobrarse aparte.",
    keywords: ["ads", "meta", "facebook", "pauta", "publicidad"]
  },
  {
    id: "social",
    service: "Contenido organico",
    shortService: "Contenido organico",
    icon: "✨",
    type: "mensual",
    price: 1500,
    setupPrice: 0,
    clientMonthlyGain: 4200,
    desc: "Calendario de contenido para sostener presencia y autoridad digital.",
    billingNote: "Servicio mensual de produccion y gestion.",
    keywords: ["social", "organico", "contenido", "redes"]
  },
  {
    id: "whatsapp",
    service: "WhatsApp Business",
    shortService: "WhatsApp Business",
    icon: "💬",
    type: "mensual",
    price: 900,
    setupPrice: 0,
    clientMonthlyGain: 2880,
    desc: "Automatiza respuestas, califica prospectos y acelera seguimiento.",
    billingNote: "Servicio mensual de configuracion y mejora continua.",
    keywords: ["whatsapp", "whats"]
  },
  {
    id: "seo",
    service: "SEO local",
    shortService: "SEO local",
    icon: "🔍",
    type: "mensual",
    price: 1200,
    setupPrice: 0,
    clientMonthlyGain: 6000,
    desc: "Posicionamiento organico en busquedas locales.",
    billingNote: "Trabajo recurrente para sostener posicionamiento.",
    keywords: ["seo", "posicionamiento", "busqueda"]
  },
  {
    id: "email",
    service: "Email marketing",
    shortService: "Email marketing",
    icon: "✉️",
    type: "mensual",
    price: 1000,
    setupPrice: 0,
    clientMonthlyGain: 3800,
    desc: "Reactivacion de base y retencion de clientes.",
    billingNote: "Servicio mensual de campañas y automatizaciones.",
    keywords: ["email", "correo", "newsletter"]
  },
  {
    id: "infra",
    service: "Infraestructura web",
    shortService: "Infraestructura web",
    icon: "☁️",
    type: "anual",
    price: 4800,
    priceMin: 1200,
    setupPrice: 0,
    clientMonthlyGain: 0,
    desc: "Dominio + hosting + mantenimiento web anual.",
    billingNote: "Cobro anual. Incluye dominio, hosting y mantenimiento básico.",
    keywords: ["hosting", "dominio", "mantenimiento", "manten", "infra", "infraestructura"]
  }
];

export const SERVICE_CATALOG_BY_ID = Object.fromEntries(SERVICE_CATALOG.map((item) => [item.id, item]));

export function getServiceCatalogItem(id) {
  return SERVICE_CATALOG_BY_ID[id] || null;
}

function resolveCatalogService(service) {
  if (!service) return null;
  if (typeof service === "string") {
    return getServiceCatalogItem(service) || matchCatalogService(service);
  }

  return (
    getServiceCatalogItem(service.catalogId) ||
    getServiceCatalogItem(service.id) ||
    matchCatalogService(service.service) ||
    matchCatalogService(service.shortService) ||
    null
  );
}

export function matchCatalogService(serviceLabel = "") {
  const lower = serviceLabel.toLowerCase();
  return SERVICE_CATALOG.find((item) => item.keywords.some((keyword) => lower.includes(keyword))) || null;
}

export function getRecurringPrice(service) {
  if (!service) return 0;
  const catalog = resolveCatalogService(service);
  if (service.monthlyPrice !== undefined) return service.monthlyPrice || 0;
  if (service.type === "anual" || service.billingType === "anual" || catalog?.type === "anual") return 0;
  if (service.type === "mensual" || service.type === "setup+mensual" || service.billingType === "mensual" || service.billingType === "setup+mensual") {
    return service.negotiatedPrice ?? service.price ?? service.revenue ?? 0;
  }
  if (catalog?.type === "mensual" || catalog?.type === "setup+mensual") {
    return service.negotiatedPrice ?? service.price ?? service.revenue ?? catalog.price ?? 0;
  }
  return 0;
}

export function getOneTimePrice(service) {
  if (!service) return 0;
  const catalog = resolveCatalogService(service);
  if (service.oneTimePrice !== undefined) return service.oneTimePrice || 0;
  if (service.type === "unico" || service.billingType === "unico") {
    return service.negotiatedPrice ?? service.price ?? service.revenue ?? 0;
  }
  if (catalog?.type === "unico") {
    return service.negotiatedPrice ?? service.price ?? service.revenue ?? catalog.price ?? 0;
  }
  if (service.type === "anual" || service.billingType === "anual") {
    return service.negotiatedPrice ?? service.price ?? service.revenue ?? 0;
  }
  if (catalog?.type === "anual") {
    return service.negotiatedPrice ?? service.price ?? service.revenue ?? catalog.price ?? 0;
  }
  return 0;
}

export function getSetupPrice(service) {
  if (!service) return 0;
  const catalog = resolveCatalogService(service);
  if (service.setupPrice !== undefined) return service.setupPrice || 0;
  if (service.type === "setup+mensual" || service.billingType === "setup+mensual") {
    return service.negotiatedSetupPrice ?? service.originalSetupPrice ?? 0;
  }
  if (catalog?.type === "setup+mensual") {
    return service.negotiatedSetupPrice ?? service.originalSetupPrice ?? catalog.setupPrice ?? 0;
  }
  return 0;
}

export function getServiceBillingType(service) {
  return service?.billingType || service?.type || resolveCatalogService(service)?.type || "mensual";
}

export function getClientMonthlyGain(service) {
  if (!service) return 0;
  return service.clientMonthlyGain ?? resolveCatalogService(service)?.clientMonthlyGain ?? 0;
}

export function getServiceNote(service) {
  return service?.billingNote || resolveCatalogService(service)?.billingNote || "";
}

export function formatServicePricing(service) {
  const billingType = getServiceBillingType(service);
  const oneTime = getOneTimePrice(service);
  const recurring = getRecurringPrice(service);
  const setup = getSetupPrice(service);

  if (billingType === "unico") {
    return `Pago unico ${formatCurrency(oneTime)}`;
  }

  if (billingType === "anual") {
    const price = oneTime;
    return `Pago anual ${formatCurrency(price)}`;
  }

  if (billingType === "setup+mensual") {
    return `Setup ${formatCurrency(setup)} + ${formatCurrency(recurring)}/mes`;
  }

  return `${formatCurrency(recurring)}/mes`;
}

export function summarizeServicePricing(services = []) {
  const oneTimeMin = services.reduce((sum, item) => sum + getOneTimePrice(item) + getSetupPrice(item), 0);
  const monthlyMin = services.reduce((sum, item) => sum + getRecurringPrice(item), 0);
  const oneTimeMax = services.reduce((sum, item) => sum + (item.oneTimeMaxPrice || getOneTimePrice(item)) + (item.setupMaxPrice || getSetupPrice(item)), 0);
  const monthlyMax = services.reduce((sum, item) => sum + (item.monthlyMaxPrice || getRecurringPrice(item)), 0);

  return {
    oneTime: { min: oneTimeMin, max: oneTimeMax },
    monthly: { min: monthlyMin, max: monthlyMax },
    firstYear: {
      min: oneTimeMin + monthlyMin * 12,
      max: oneTimeMax + monthlyMax * 12
    }
  };
}
