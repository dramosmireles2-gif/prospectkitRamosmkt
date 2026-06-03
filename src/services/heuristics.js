import { clamp } from "../utils/format";

const industryPlaybooks = {
  restaurante: {
    features: ["Google My Business", "WhatsApp integrado", "Menú digital", "Sistema de reservas", "Meta Ads activos", "Sitio responsivo"],
    services: ["Landing Page gastronómica", "Google My Business", "Meta Ads locales", "WhatsApp Business"],
    painPoints: ["reservaciones", "visitas en Google Maps", "respuesta rápida", "menú digital"],
    multipliers: { web: 1.15, gmb: 1.2, ads: 1.05 }
  },
  automotriz: {
    features: ["Sitio web", "Google My Business", "WhatsApp Button", "Sistema de citas", "Meta Ads", "Instagram activo"],
    services: ["Landing + agenda", "Google My Business", "WhatsApp Business", "Meta Ads locales"],
    painPoints: ["cotizaciones", "citas", "confianza local", "seguimiento de leads"],
    multipliers: { web: 1.15, gmb: 1.2, social: 0.9 }
  },
  fotografia: {
    features: ["Sitio portafolio", "Meta Ads activos", "Sistema de reservas", "Tienda online", "Optimización móvil"],
    services: ["Meta Ads de temporada", "Tienda online", "SEO local", "Optimización web"],
    painPoints: ["temporadas altas", "portafolio", "reserva inmediata", "upsell digital"],
    multipliers: { ads: 1.2, ecom: 1.1, web: 1.05 }
  },
  salud: {
    features: ["Sitio web", "WhatsApp profesional", "Google My Business", "Meta Ads activos", "Landing de sucursales"],
    services: ["Landing por sucursal", "Google My Business", "WhatsApp Business", "Campañas locales"],
    painPoints: ["ubicaciones", "confianza", "respuestas rápidas", "captación local"],
    multipliers: { gmb: 1.15, web: 1.1, social: 0.9 }
  },
  reposteria: {
    features: ["Catálogo web", "WhatsApp integrado", "Google My Business", "Contenido activo", "Promociones Meta Ads"],
    services: ["Catálogo web", "WhatsApp Business", "Google My Business", "Contenido para redes"],
    painPoints: ["pedidos por WhatsApp", "catálogo", "campañas estacionales", "reseñas locales"],
    multipliers: { social: 1.15, web: 1.1, gmb: 1.05 }
  },
  belleza: {
    features: ["Sitio web", "Google My Business", "WhatsApp integrado", "Instagram activo", "Sistema de citas", "Meta Ads activos"],
    services: ["Landing Page", "Google My Business", "WhatsApp Business", "Meta Ads locales"],
    painPoints: ["citas online", "portafolio visual", "reseñas locales", "captación por redes"],
    multipliers: { web: 1.1, gmb: 1.15, social: 1.2, ads: 1.05 }
  },
  fitness: {
    features: ["Sitio web", "Google My Business", "Instagram activo", "WhatsApp integrado", "Sistema de reservas", "Meta Ads activos"],
    services: ["Landing Page", "Google My Business", "Meta Ads locales", "Contenido orgánico"],
    painPoints: ["retención de alumnos", "captación local", "calendario de clases", "comunidad digital"],
    multipliers: { web: 1.1, gmb: 1.15, social: 1.1, ads: 1.1 }
  },
  inmobiliaria: {
    features: ["Sitio web", "Google My Business", "WhatsApp profesional", "Meta Ads activos", "CRM de leads", "Contenido activo"],
    services: ["Landing Page", "Meta Ads locales", "Google My Business", "WhatsApp Business"],
    painPoints: ["captación de leads", "seguimiento", "visibilidad de propiedades", "confianza digital"],
    multipliers: { web: 1.2, ads: 1.25, gmb: 1.1, social: 0.95 }
  },
  educacion: {
    features: ["Sitio web", "Google My Business", "WhatsApp profesional", "Meta Ads activos", "Landing de cursos"],
    services: ["Landing Page", "Google My Business", "Meta Ads locales", "WhatsApp Business"],
    painPoints: ["inscripciones", "visibilidad local", "confianza institucional", "seguimiento de interesados"],
    multipliers: { web: 1.15, gmb: 1.1, ads: 1.1, social: 1 }
  },
  default: {
    features: ["Sitio web", "Google My Business", "WhatsApp profesional", "Meta Ads activos", "Contenido activo"],
    services: ["Landing Page", "Google My Business", "Meta Ads locales", "WhatsApp Business"],
    painPoints: ["visibilidad", "conversión", "canales digitales", "seguimiento comercial"],
    multipliers: { web: 1.05, gmb: 1.05, social: 1, ads: 1.05 }
  }
};

const serviceCatalog = {
  web: {
    service: "Landing Page",
    confidence: 92,
    revenue: 3500,
    range: [3500, 11000],
    unit: "/mes",
    icon: "🌐",
    desc: "Sitio de captación con CTA claros y propuesta de valor enfocada."
  },
  gmb: {
    service: "Google My Business",
    confidence: 96,
    revenue: 800,
    range: [800, 2500],
    unit: " setup",
    icon: "📍",
    desc: "Activa búsquedas locales, reseñas y rutas directas a tu negocio."
  },
  ads: {
    service: "Meta Ads locales",
    confidence: 88,
    revenue: 2200,
    range: [2200, 7000],
    unit: "/mes",
    icon: "📣",
    desc: "Campañas de adquisición con segmentación local y objetivo de conversión."
  },
  social: {
    service: "Contenido orgánico",
    confidence: 79,
    revenue: 1500,
    range: [1500, 5000],
    unit: "/mes",
    icon: "✨",
    desc: "Calendario de contenido para sostener presencia y autoridad digital."
  },
  whatsapp: {
    service: "WhatsApp Business",
    confidence: 84,
    revenue: 900,
    range: [900, 3000],
    unit: "/mes",
    icon: "💬",
    desc: "Automatiza respuestas, califica prospectos y acelera seguimiento."
  },
  ecom: {
    service: "Catálogo / tienda online",
    confidence: 76,
    revenue: 1800,
    range: [1800, 6000],
    unit: "/mes",
    icon: "🛒",
    desc: "Convierte interés orgánico en pedidos digitales con catálogo activo."
  }
};

function getPlaybook(industry = "") {
  const key = industry.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (key.includes("restaur") || key.includes("comida") || key.includes("cocina")) return industryPlaybooks.restaurante;
  if (key.includes("auto") || key.includes("taller") || key.includes("mecanico")) return industryPlaybooks.automotriz;
  if (key.includes("foto") || key.includes("video") || key.includes("produc")) return industryPlaybooks.fotografia;
  if (key.includes("salud") || key.includes("farmac") || key.includes("medic") || key.includes("dental") || key.includes("clinic")) return industryPlaybooks.salud;
  if (key.includes("reposter") || key.includes("pastel") || key.includes("panader")) return industryPlaybooks.reposteria;
  if (key.includes("belleza") || key.includes("salon") || key.includes("estetica") || key.includes("spa") || key.includes("peluquer")) return industryPlaybooks.belleza;
  if (key.includes("fitness") || key.includes("gym") || key.includes("gimnasio") || key.includes("yoga") || key.includes("crossfit")) return industryPlaybooks.fitness;
  if (key.includes("inmobil") || key.includes("bienes raices") || key.includes("real estate")) return industryPlaybooks.inmobiliaria;
  if (key.includes("educa") || key.includes("escuela") || key.includes("academia") || key.includes("curso")) return industryPlaybooks.educacion;
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
    "Sitio responsivo": Boolean(prospect.website),
    "Sitio portafolio": Boolean(prospect.website),
    "Catálogo web": Boolean(prospect.website),
    "Landing de sucursales": Boolean(prospect.website),
    "Google My Business": false,
    "WhatsApp integrado": Boolean(prospect.whatsapp),
    "WhatsApp profesional": Boolean(prospect.whatsapp),
    "WhatsApp Button": Boolean(prospect.whatsapp),
    "Menú digital": Boolean(prospect.website),
    "Sistema de reservas": false,
    "Sistema de citas": false,
    "Meta Ads activos": false,
    "Meta Ads": false,
    "Instagram activo": Boolean(prospect.instagram),
    "Contenido activo": Boolean(prospect.instagram || prospect.facebook),
    "Promociones Meta Ads": false,
    "Tienda online": false,
    "Optimización móvil": Boolean(prospect.website)
  };

  for (const feature of playbook.features) {
    if (!checks[feature]) {
      rows.push({
        name: feature,
        critical: feature.includes("Sitio") || feature.includes("WhatsApp") || feature.includes("Google")
      });
    }
  }

  return rows.slice(0, 6);
}

function topServiceKeys(prospect, missingFeatures, playbook) {
  const keys = [];
  const names = missingFeatures.map((item) => item.name);

  if (names.some((item) => item.includes("Sitio") || item.includes("Catálogo") || item.includes("Landing"))) {
    keys.push("web");
  }
  if (names.some((item) => item.includes("Google"))) {
    keys.push("gmb");
  }
  if (names.some((item) => item.includes("WhatsApp"))) {
    keys.push("whatsapp");
  }
  if (names.some((item) => item.includes("Meta Ads"))) {
    keys.push("ads");
  }
  if (names.some((item) => item.includes("Contenido") || item.includes("Instagram"))) {
    keys.push("social");
  }
  if (names.some((item) => item.includes("Tienda") || item.includes("Catálogo"))) {
    keys.push("ecom");
  }

  for (const preferred of playbook.services) {
    if (preferred.includes("Google") && !keys.includes("gmb")) keys.push("gmb");
    if ((preferred.includes("Landing") || preferred.includes("web") || preferred.includes("Catálogo")) && !keys.includes("web")) keys.push("web");
    if (preferred.includes("WhatsApp") && !keys.includes("whatsapp")) keys.push("whatsapp");
    if ((preferred.includes("Ads") || preferred.includes("Campañas")) && !keys.includes("ads")) keys.push("ads");
    if (preferred.includes("Contenido") && !keys.includes("social")) keys.push("social");
    if (preferred.includes("Tienda") && !keys.includes("ecom")) keys.push("ecom");
  }

  if (!prospect.website && !keys.includes("web")) keys.unshift("web");
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

export function estimateSalesLikelihoodScore(prospect) {
  let score = 30;
  if (prospect.website) score += 20;
  if (prospect.instagram) score += 10;
  if (prospect.facebook) score += 8;
  if (prospect.whatsapp) score += 12;
  const channelCount = [prospect.website, prospect.instagram, prospect.facebook, prospect.whatsapp].filter(Boolean).length;
  if (channelCount >= 3) score += 10;
  if (channelCount === 4) score += 5;
  const notes = (prospect.notes || "").toLowerCase();
  const hotWords = ["urgente","necesito","quiero","presupuesto","cuanto","precio","crecer","ventas","clientes","pronto"];
  const coldWords = ["no tengo","sin presupuesto","no puedo","gratis","barato","no interesa"];
  hotWords.forEach(w => { if (notes.includes(w)) score += 5; });
  coldWords.forEach(w => { if (notes.includes(w)) score -= 8; });
  return clamp(score, 5, 98);
}

export function calcLeadTemperature(salesLikelihoodScore) {
  if (salesLikelihoodScore >= 86) return "urgente";
  if (salesLikelihoodScore >= 71) return "caliente";
  if (salesLikelihoodScore >= 51) return "tibio";
  return "frio";
}

export const TEMPERATURE_CONFIG = {
  urgente:  { label: "Urgente",  color: "#ff4455", bg: "rgba(255,68,85,0.15)",  dot: "🔴" },
  caliente: { label: "Caliente", color: "#ff7744", bg: "rgba(255,119,68,0.15)", dot: "🟠" },
  tibio:    { label: "Tibio",    color: "#ffbb44", bg: "rgba(255,187,68,0.15)", dot: "🟡" },
  frio:     { label: "Frío",     color: "#4a9eff", bg: "rgba(74,158,255,0.15)", dot: "🔵" }
};

export const LIKELIHOOD_CONFIG = {
  label: (score) => {
    if (score >= 86) return "Prospecto prioritario";
    if (score >= 71) return "Alta probabilidad";
    if (score >= 51) return "Posible cliente";
    if (score >= 31) return "Baja probabilidad";
    return "Muy difícil";
  },
  color: (score) => {
    if (score >= 86) return "#00ff88";
    if (score >= 71) return "#ffbb44";
    if (score >= 51) return "#4a9eff";
    if (score >= 31) return "#ff7744";
    return "#ff4455";
  }
};

export function generateProspectAnalysis(prospect) {
  const playbook = getPlaybook(prospect.industry);
  const scoreBreakdown = buildScoreBreakdown(prospect);
  const opportunityScore = estimateOpportunityScore(prospect);
  const missingFeatures = buildMissingFeatures(prospect, playbook);
  const serviceKeys = topServiceKeys(prospect, missingFeatures, playbook);
  const recommendedServices = serviceKeys.map((key, index) => {
    const base = serviceCatalog[key];
    const multiplier = Object.values(playbook.multipliers)[index] || 1;
    return {
      service: base.service,
      confidence: clamp(base.confidence - index * 3, 68, 99),
      revenue: Math.round(base.revenue * multiplier),
      unit: base.unit,
      icon: base.icon,
      desc: base.desc
    };
  });

  const opportunities = serviceKeys.map((key, index) => {
    const service = recommendedServices[index];
    const priority = index === 0 ? "urgente" : index === 1 ? "alta" : "media";
    return {
      type: key === "whatsapp" ? "social" : key,
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
    (sum, item, index) => sum + Math.round(item.revenue * (2.4 + index * 0.2)),
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
        body: `Hola equipo de ${prospect.name},\n\nRevisé su presencia digital y encontré una oportunidad fuerte para crecer con ${topService.toLowerCase()}.\n\nHallazgos principales:\n${weaknessList.map((item) => `• ${item}`).join("\n")}\n\nSi quieren, les comparto un plan concreto con prioridades, estimado de impacto y siguientes pasos.\n\nCarlos Ramos\nRamosMKT`
      }
    },
    proposalSnapshot: {
      before,
      after,
      summary: `${prospect.name} puede pasar de una presencia digital reactiva a una captación más ordenada y rentable empezando por ${topService.toLowerCase()}.`
    }
  };
}
