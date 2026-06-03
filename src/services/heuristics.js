import { clamp } from "../utils/format";

// Catálogo real de servicios RMKT
const serviceCatalog = {
  landing: {
    service: "Landing Express",
    confidence: 94,
    revenue: 1500,
    range: [1500, 1500],
    unit: " único",
    icon: "🚀",
    desc: "1 página enfocada en convertir visitas en clientes. WhatsApp, mapa, galería, móvil. Entrega 5 días."
  },
  webPro: {
    service: "Web Profesional",
    confidence: 91,
    revenue: 3500,
    range: [3500, 3500],
    unit: " único",
    icon: "🌐",
    desc: "Sitio multipágina con catálogo, testimonios, dominio + hosting 1 año. Entrega 10 días."
  },
  webEmp: {
    service: "Web Empresarial",
    confidence: 85,
    revenue: 7500,
    range: [7500, 7500],
    unit: " único",
    icon: "🏢",
    desc: "Plataforma con CMS, blog, SEO técnico, analítica y soporte 2 meses. Entrega 15–20 días."
  },
  metaAds: {
    service: "Meta Ads",
    confidence: 88,
    revenue: 2000,
    range: [2000, 5000],
    unit: "/mes",
    icon: "📣",
    desc: "Campañas Facebook + Instagram con estrategia, creativos, segmentación y reporte mensual."
  },
  googleAds: {
    service: "Google Ads",
    confidence: 82,
    revenue: 2500,
    range: [2500, 6000],
    unit: "/mes",
    icon: "🔍",
    desc: "Campañas de búsqueda y display con keywords, conversiones y reporte mensual."
  },
  chatbot: {
    service: "Chatbot de captación",
    confidence: 86,
    revenue: 500,
    range: [500, 500],
    unit: "/mes",
    icon: "🤖",
    desc: "Bot WhatsApp o web que responde, califica prospectos y agenda citas 24/7."
  },
  automatizaciones: {
    service: "Automatizaciones",
    confidence: 80,
    revenue: 800,
    range: [500, 1500],
    unit: "/mes",
    icon: "⚙️",
    desc: "Flujos automáticos: seguimiento de leads, recordatorios y notificaciones."
  },
  ecommerce: {
    service: "Ecommerce Completo",
    confidence: 78,
    revenue: 8000,
    range: [8000, 14000],
    unit: " único",
    icon: "🛒",
    desc: "Tienda online con carrito, pagos Stripe/MercadoPago y panel de pedidos e inventario."
  },
  sistemaAdmin: {
    service: "Sistema Administrativo",
    confidence: 72,
    revenue: 8000,
    range: [8000, 15000],
    unit: " único",
    icon: "📊",
    desc: "Panel de control: inventario, proveedores, órdenes, clientes y reportes."
  },
  crm: {
    service: "CRM Personalizado",
    confidence: 74,
    revenue: 8000,
    range: [8000, 12000],
    unit: " único",
    icon: "🎯",
    desc: "Pipeline de prospectos y clientes con notas, historial y recordatorios."
  },
  dashboard: {
    service: "Dashboard de Negocio",
    confidence: 70,
    revenue: 5000,
    range: [5000, 8000],
    unit: " único",
    icon: "📈",
    desc: "Panel de métricas en tiempo real: ventas, clientes, inventario y KPIs."
  },
  reservaciones: {
    service: "Sistema de Reservaciones",
    confidence: 83,
    revenue: 5000,
    range: [5000, 8000],
    unit: " único",
    icon: "📅",
    desc: "Agenda digital con disponibilidad, confirmaciones y recordatorios automáticos."
  },
  appMovil: {
    service: "App Móvil",
    confidence: 60,
    revenue: 20000,
    range: [20000, 40000],
    unit: " único",
    icon: "📱",
    desc: "App iOS y Android a la medida, publicada en App Store y Google Play."
  },
  mantenimiento: {
    service: "Plan de Mantenimiento",
    confidence: 89,
    revenue: 900,
    range: [500, 1500],
    unit: "/mes",
    icon: "🔧",
    desc: "Actualizaciones, soporte técnico y mejoras continuas mensuales."
  },
  packLanzamiento: {
    service: "Pack de Lanzamiento Digital",
    confidence: 87,
    revenue: 6000,
    range: [6000, 6000],
    unit: " único",
    icon: "🎯",
    desc: "Web Profesional + Meta Ads 1er mes + Chatbot. Todo para arrancar."
  }
};

// Paquetes por nicho con ruta de entrada y upsells
const nichoPaquetes = {
  iglesia: { starter: 2500, pro: 5500, premium: 10000 },
  restaurante: { starter: 2500, pro: 6000, premium: 12000 },
  boutique: { starter: 2500, pro: 7000, premium: 14000 },
  clinica: { starter: 2500, pro: 6500, premium: 11000 },
  fitness: { starter: 2500, pro: 6500, premium: 13000 }
};

const industryPlaybooks = {
  restaurante: {
    features: ["Sitio web", "Menú digital", "Sistema de reservas", "Meta Ads activos", "WhatsApp integrado", "Google My Business"],
    serviceKeys: ["landing", "reservaciones", "metaAds", "chatbot"],
    painPoints: ["reservaciones perdidas", "menú desactualizado", "visibilidad en Google Maps", "pedidos online"],
    multipliers: { landing: 1, reservaciones: 1, metaAds: 1, chatbot: 1 },
    upsell: "Ecommerce de pedidos a domicilio + App del restaurante"
  },
  automotriz: {
    features: ["Sitio web", "Google My Business", "Sistema de citas", "WhatsApp profesional", "Meta Ads"],
    serviceKeys: ["webPro", "reservaciones", "metaAds", "chatbot"],
    painPoints: ["cotizaciones sin respuesta", "citas informales", "confianza local", "seguimiento de leads"],
    multipliers: { webPro: 1, reservaciones: 1, metaAds: 1, chatbot: 1 },
    upsell: "CRM + automatizaciones de seguimiento"
  },
  fotografia: {
    features: ["Sitio portafolio", "Meta Ads activos", "Sistema de reservas", "Tienda online"],
    serviceKeys: ["webPro", "metaAds", "reservaciones", "ecommerce"],
    painPoints: ["temporadas altas sin reservas", "portafolio desactualizado", "upsell de productos digitales"],
    multipliers: { webPro: 1, metaAds: 1, reservaciones: 1 },
    upsell: "Ecommerce de prints + App para clientes"
  },
  salud: {
    features: ["Sitio web", "Sistema de citas", "WhatsApp profesional", "Google My Business", "Meta Ads"],
    serviceKeys: ["webPro", "reservaciones", "chatbot", "metaAds"],
    painPoints: ["agenda llena de llamadas", "citas sin confirmar", "pacientes sin recordatorio", "captación local"],
    multipliers: { webPro: 1, reservaciones: 1, chatbot: 1 },
    upsell: "Expediente de pacientes + App móvil"
  },
  dental: {
    features: ["Sitio web", "Sistema de citas", "WhatsApp profesional", "Google My Business", "Meta Ads"],
    serviceKeys: ["webPro", "reservaciones", "chatbot", "metaAds"],
    painPoints: ["agenda llena de llamadas", "recordatorios manuales", "captación local de pacientes"],
    multipliers: { webPro: 1, reservaciones: 1, chatbot: 1 },
    upsell: "Expediente digital + App para pacientes"
  },
  reposteria: {
    features: ["Catálogo web", "WhatsApp integrado", "Google My Business", "Meta Ads", "Pedidos online"],
    serviceKeys: ["landing", "metaAds", "chatbot", "ecommerce"],
    painPoints: ["pedidos por DM", "catálogo desorganizado", "campañas estacionales"],
    multipliers: { landing: 1, metaAds: 1, chatbot: 1 },
    upsell: "Ecommerce + automatización de pedidos"
  },
  belleza: {
    features: ["Sitio web", "Sistema de citas", "Instagram activo", "Meta Ads activos", "WhatsApp integrado"],
    serviceKeys: ["landing", "reservaciones", "metaAds", "chatbot"],
    painPoints: ["citas sin sistema", "portafolio visual disperso", "reseñas locales", "captación por redes"],
    multipliers: { landing: 1, reservaciones: 1, metaAds: 1 },
    upsell: "Meta Ads de temporada + CRM de clientes"
  },
  gimnasio: {
    features: ["Sitio web", "Sistema de membresías", "Instagram activo", "Meta Ads", "WhatsApp integrado"],
    serviceKeys: ["webPro", "sistemaAdmin", "metaAds", "chatbot"],
    painPoints: ["control manual de membresías", "vencimientos sin aviso", "captación de nuevos miembros"],
    multipliers: { webPro: 1, sistemaAdmin: 1, metaAds: 1 },
    upsell: "App de reservas de clases + control de acceso QR"
  },
  inmobiliaria: {
    features: ["Sitio web", "CRM de leads", "Meta Ads activos", "WhatsApp profesional", "Google My Business"],
    serviceKeys: ["webEmp", "crm", "metaAds", "automatizaciones"],
    painPoints: ["leads sin seguimiento", "propiedades sin visibilidad", "proceso de ventas manual"],
    multipliers: { webEmp: 1, crm: 1, metaAds: 1 },
    upsell: "App de propiedades + automatización de seguimiento"
  },
  educacion: {
    features: ["Sitio web", "Landing de cursos", "Meta Ads activos", "WhatsApp profesional", "Sistema de inscripciones"],
    serviceKeys: ["webPro", "metaAds", "chatbot", "automatizaciones"],
    painPoints: ["inscripciones manuales", "prospectos sin seguimiento", "visibilidad de cursos"],
    multipliers: { webPro: 1, metaAds: 1, chatbot: 1 },
    upsell: "Plataforma de cursos online + App educativa"
  },
  boutique: {
    features: ["Catálogo online", "Tienda con pagos", "Instagram activo", "Meta Ads", "WhatsApp integrado"],
    serviceKeys: ["ecommerce", "metaAds", "chatbot", "automatizaciones"],
    painPoints: ["ventas solo por DM", "inventario sin control", "carritos abandonados"],
    multipliers: { ecommerce: 1, metaAds: 1, chatbot: 1 },
    upsell: "App de la tienda + programa de lealtad"
  },
  iglesia: {
    features: ["Sitio web", "Sección de sermones", "Donaciones online", "WhatsApp integrado", "Directorio de ministerios"],
    serviceKeys: ["webPro", "automatizaciones", "chatbot", "appMovil"],
    painPoints: ["comunicación dispersa", "donaciones sin sistema", "ausencia digital", "alcance limitado"],
    multipliers: { webPro: 1, automatizaciones: 1 },
    upsell: "App de la iglesia + notificaciones push a la congregación"
  },
  default: {
    features: ["Sitio web", "Google My Business", "WhatsApp profesional", "Meta Ads activos", "Sistema de captación"],
    serviceKeys: ["landing", "metaAds", "chatbot", "automatizaciones"],
    painPoints: ["visibilidad digital", "captación de clientes", "seguimiento comercial", "automatización"],
    multipliers: { landing: 1, metaAds: 1, chatbot: 1 },
    upsell: "Web Profesional + CRM según el volumen del negocio"
  }
};

function getPlaybook(industry = "") {
  const key = industry.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  if (key.includes("restaur") || key.includes("comida") || key.includes("cocina") || key.includes("taqueria") || key.includes("cafe")) return industryPlaybooks.restaurante;
  if (key.includes("auto") || key.includes("taller") || key.includes("mecanico") || key.includes("refaccion")) return industryPlaybooks.automotriz;
  if (key.includes("foto") || key.includes("video") || key.includes("produc")) return industryPlaybooks.fotografia;
  if (key.includes("dental") || key.includes("dentist") || key.includes("odontolog")) return industryPlaybooks.dental;
  if (key.includes("salud") || key.includes("farmac") || key.includes("medic") || key.includes("clinic") || key.includes("hospital")) return industryPlaybooks.salud;
  if (key.includes("reposter") || key.includes("pastel") || key.includes("panader") || key.includes("dulce")) return industryPlaybooks.reposteria;
  if (key.includes("belleza") || key.includes("salon") || key.includes("estetica") || key.includes("spa") || key.includes("peluquer") || key.includes("nail") || key.includes("estudio")) return industryPlaybooks.belleza;
  if (key.includes("fitness") || key.includes("gym") || key.includes("gimnasio") || key.includes("yoga") || key.includes("crossfit") || key.includes("box")) return industryPlaybooks.gimnasio;
  if (key.includes("inmobil") || key.includes("bienes raices") || key.includes("real estate") || key.includes("propied")) return industryPlaybooks.inmobiliaria;
  if (key.includes("educa") || key.includes("escuela") || key.includes("academia") || key.includes("curso") || key.includes("colegio")) return industryPlaybooks.educacion;
  if (key.includes("boutique") || key.includes("moda") || key.includes("ropa") || key.includes("tienda") || key.includes("fashion")) return industryPlaybooks.boutique;
  if (key.includes("iglesia") || key.includes("iglesia") || key.includes("templo") || key.includes("ministerio") || key.includes("parroquia")) return industryPlaybooks.iglesia;
  return industryPlaybooks.default;
}

function buildScoreBreakdown(prospect) {
  const hasWebsite = Boolean(prospect.website);
  const hasInstagram = Boolean(prospect.instagram);
  const hasFacebook = Boolean(prospect.facebook);
  const hasWhatsapp = Boolean(prospect.whatsapp);
  const socialCount = [hasInstagram, hasFacebook].filter(Boolean).length;

  const websiteScore = hasWebsite ? 56 : 8;
  const mobileScore = hasWebsite ? 44 : 10;
  const socialScore = clamp(18 + socialCount * 24 + (hasInstagram && hasFacebook ? 14 : 0), 10, 76);
  const conversionScore = clamp((hasWebsite ? 20 : 0) + (hasWhatsapp ? 34 : 8) + socialCount * 12, 10, 88);
  const functionalityScore = clamp((hasWebsite ? 18 : 0) + (hasWhatsapp ? 20 : 0) + socialCount * 14, 8, 82);

  return [
    {
      label: "Calidad del sitio web",
      value: websiteScore,
      note: hasWebsite ? "Presente, pero sin auditoría técnica" : "Sin sitio web detectado"
    },
    {
      label: "Experiencia móvil",
      value: mobileScore,
      note: hasWebsite ? "Se asume mejorable sin validación" : "Sin experiencia móvil disponible"
    },
    {
      label: "Presencia en redes",
      value: socialScore,
      note: socialCount === 0 ? "Sin redes identificadas" : socialCount === 1 ? "Canal único detectado" : "Presencia parcial"
    },
    {
      label: "Oportunidades de conversión",
      value: conversionScore,
      note: hasWhatsapp ? "WhatsApp presente, faltan automatizaciones" : "Faltan CTAs directos"
    },
    {
      label: "Funcionalidades clave",
      value: functionalityScore,
      note: "Se estiman gaps de activación comercial"
    }
  ];
}

function buildMissingFeatures(prospect, playbook) {
  const rows = [];
  const checks = {
    "Sitio web": Boolean(prospect.website),
    "Sitio portafolio": Boolean(prospect.website),
    "Catálogo online": Boolean(prospect.website),
    "Catálogo web": Boolean(prospect.website),
    "Landing de cursos": Boolean(prospect.website),
    "Google My Business": false,
    "WhatsApp integrado": Boolean(prospect.whatsapp),
    "WhatsApp profesional": Boolean(prospect.whatsapp),
    "Menú digital": Boolean(prospect.website),
    "Sistema de citas": false,
    "Sistema de reservas": false,
    "Sistema de membresías": false,
    "Sistema de inscripciones": false,
    "Meta Ads activos": false,
    "Meta Ads": false,
    "Instagram activo": Boolean(prospect.instagram),
    "Donaciones online": false,
    "Tienda con pagos": false,
    "CRM de leads": false,
    "Directorio de ministerios": false,
    "Sección de sermones": false
  };

  for (const feature of playbook.features) {
    if (!checks[feature]) {
      rows.push({
        name: feature,
        critical: feature.includes("Sitio") || feature.includes("WhatsApp") || feature.includes("Sistema") || feature.includes("Tienda")
      });
    }
  }

  return rows.slice(0, 6);
}

function topServiceKeys(prospect, missingFeatures, playbook) {
  const keys = [...playbook.serviceKeys];
  if (!prospect.website && !keys.includes("landing")) keys.unshift("landing");
  return [...new Set(keys)].slice(0, 4);
}

function scoreLabel(opportunityScore) {
  if (opportunityScore >= 88) return "Oportunidad crítica";
  if (opportunityScore >= 75) return "Alta oportunidad";
  if (opportunityScore >= 60) return "Buen potencial";
  return "Potencial moderado";
}

export function estimateOpportunityScore(prospect) {
  const breakdown = buildScoreBreakdown(prospect);
  const averageMaturity = breakdown.reduce((sum, row) => sum + row.value, 0) / breakdown.length;
  const missingIntensity = breakdown.filter((row) => row.value < 40).length * 5;
  return clamp(Math.round(100 - averageMaturity + missingIntensity), 40, 96);
}

export async function generateProspectAnalysisAI(prospect) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospect })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const { analysis } = await res.json();
  return analysis;
}

export async function generateProspectKitAI(prospect, analysis) {
  const res = await fetch("/api/generate-kit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospect, analysis })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }

  const { kit } = await res.json();
  return kit;
}

export function generateProspectAnalysis(prospect) {
  const playbook = getPlaybook(prospect.industry);
  const scoreBreakdown = buildScoreBreakdown(prospect);
  const opportunityScore = estimateOpportunityScore(prospect);
  const missingFeatures = buildMissingFeatures(prospect, playbook);
  const serviceKeys = topServiceKeys(prospect, missingFeatures, playbook);
  const recommendedServices = serviceKeys.map((key, index) => {
    const base = serviceCatalog[key];
    return {
      service: base.service,
      confidence: clamp(base.confidence - index * 3, 68, 99),
      revenue: base.revenue,
      unit: base.unit,
      icon: base.icon,
      desc: base.desc
    };
  });

  const opportunities = serviceKeys.map((key, index) => {
    const service = recommendedServices[index];
    const priority = index === 0 ? "urgente" : index === 1 ? "alta" : "media";
    return {
      type: key,
      title: service.service,
      desc: `${service.desc} Impacta ${playbook.painPoints[index % playbook.painPoints.length]}.`,
      priority,
      impact: clamp(95 - index * 12, 58, 95)
    };
  });

  const actionPlan = recommendedServices.map((service, index) => ({
    action: `Implementar ${service.service.toLowerCase()}`,
    impact: index < 2 ? "Muy alto" : "Alto",
    effort: index === 0 ? "Medio" : index === 1 ? "Bajo" : "Medio",
    tag: index === 0 ? "Revenue" : index === 1 ? "Quick Win" : index === 2 ? "Proyecto" : "Retención"
  }));

  const weaknesses = missingFeatures.map((feature) => `Falta ${feature.name.toLowerCase()}`);
  if (!prospect.instagram && !prospect.facebook) {
    weaknesses.push("Sin ecosistema social consistente");
  }
  if (!prospect.website) {
    weaknesses.push("No existe una base propia para captación digital");
  }

  const revenueMin = recommendedServices.reduce((sum, item) => sum + item.revenue, 0);
  const revenueMax = recommendedServices.reduce(
    (sum, item, index) => sum + Math.round(item.revenue * (2.2 + index * 0.2)),
    0
  );

  return {
    version: 1,
    opportunityScore,
    scoreLabel: scoreLabel(opportunityScore),
    scoreBreakdown,
    missingFeatures,
    recommendedServices,
    opportunities,
    actionPlan,
    revenue: {
      min: revenueMin,
      max: revenueMax
    },
    weaknesses: [...new Set(weaknesses)].slice(0, 6),
    source: "heuristic"
  };
}

export function generateProspectKit(prospect, analysis) {
  const topService = analysis.recommendedServices[0]?.service || "una estrategia digital";
  const weaknessList = analysis.weaknesses.slice(0, 3);
  const before = weaknessList.length ? weaknessList : ["Sin estructura digital clara", "Oportunidades sin capturar"];
  const after = analysis.recommendedServices.slice(0, 4).map((item) => `Implementar ${item.service.toLowerCase()}`);

  return {
    channelMessages: {
      whatsapp: `Hola 👋 Vi ${prospect.name} en ${prospect.city} y detecté una oportunidad clara para crecer con ${topService.toLowerCase()}.\n\nSoy Carlos de RamosMKT. Ayudo a negocios como ${prospect.name} a ordenar su captación digital y convertir más contactos en clientes.\n\n¿Te puedo compartir un mini diagnóstico en 10 minutos?`,
      instagram: `Hola 👋 Estuve revisando ${prospect.name} y vi una oportunidad muy fuerte para crecer con ${topService.toLowerCase()}. Si quieres, te comparto un diagnóstico corto y accionable sin costo.`,
      facebook: `Hola equipo de ${prospect.name} 👋 Soy Carlos de RamosMKT. Detecté varias mejoras de captación digital, empezando por ${topService.toLowerCase()}. ¿Les interesa que les comparta un análisis breve y práctico?`,
      email: {
        subject: `Diagnóstico digital para ${prospect.name}`,
        body: `Hola equipo de ${prospect.name},\n\nRevisé su presencia digital y encontré una oportunidad fuerte para crecer con ${topService.toLowerCase()}.\n\nHallazgos principales:\n${weaknessList.map((item) => `• ${item}`).join("\n")}\n\nSi quieren, les comparto un plan concreto con prioridades, estimado de impacto y siguientes pasos.\n\nCarlos Ramos\nRamosMKT · ramosmkt.lat\nWhatsApp: +52 814 807 8309`
      }
    },
    proposalSnapshot: {
      before,
      after,
      summary: `${prospect.name} puede pasar de una presencia digital reactiva a una captación más ordenada y rentable empezando por ${topService.toLowerCase()}.`
    }
  };
}
