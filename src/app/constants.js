export const STATUS = {
  NEW: "new",
  ANALYZED: "analyzed",
  KIT_READY: "kit-ready",
  CONTACTED: "contacted"
};

export const STATUS_ORDER = [STATUS.NEW, STATUS.ANALYZED, STATUS.KIT_READY, STATUS.CONTACTED];

export const VIEWS = {
  DASHBOARD: "dashboard",
  PROSPECTS: "prospects",
  PIPELINE: "pipeline",
  DETAIL: "detail",
  ANALYSIS: "analysis",
  KIT: "kitgen",
  ASSETS: "assets"
};

export const PROSPECT_VIEWS = [VIEWS.DETAIL, VIEWS.ANALYSIS, VIEWS.KIT, VIEWS.ASSETS];

export const PIPELINE_STAGES = [
  { id: "lead",        label: "Lead",             color: "#777777", bg: "rgba(119,119,119,0.1)"  },
  { id: "contactado",  label: "Contactado",        color: "#4a9eff", bg: "rgba(74,158,255,0.1)"  },
  { id: "respondio",   label: "Respondió",         color: "#9966ff", bg: "rgba(153,102,255,0.1)" },
  { id: "reunion",     label: "Reunión agendada",  color: "#ffbb44", bg: "rgba(255,187,68,0.1)"  },
  { id: "propuesta",   label: "Propuesta enviada", color: "#ff7744", bg: "rgba(255,119,68,0.1)"  },
  { id: "negociacion", label: "Negociación",       color: "#ff4455", bg: "rgba(255,68,85,0.1)"   },
  { id: "ganado",      label: "Ganado",            color: "#00ff88", bg: "rgba(0,255,136,0.1)"   },
  { id: "perdido",     label: "Perdido",           color: "#444444", bg: "rgba(68,68,68,0.1)"    }
];

export const INDUSTRIES = [
  "Restaurante",
  "Automotriz",
  "Fotografía",
  "Salud",
  "Repostería",
  "Belleza",
  "Fitness",
  "Inmobiliaria",
  "Educación",
  "Legal",
  "Veterinaria",
  "Tecnología"
];

export const ANALYSIS_SOURCE = {
  HEURISTIC: "heuristic",
  AI: "ai"
};

export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  PASSWORD_MIN: 6,
  PHONE_PATTERN: /^\+?[\d\s()-]{7,20}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL_PATTERN: /^(https?:\/\/)?[\w.-]+\.\w{2,}(\/\S*)?$/i
};

export const NEXT_ACTION_TYPES = [
  { id: "llamar",      label: "Llamar",         icon: "📞" },
  { id: "whatsapp",    label: "WhatsApp",        icon: "💬" },
  { id: "email",       label: "Email",           icon: "✉️" },
  { id: "reunion",     label: "Agendar reunión", icon: "📅" },
  { id: "propuesta",   label: "Enviar propuesta",icon: "📋" },
  { id: "seguimiento", label: "Seguimiento",     icon: "🔄" }
];

export const STAGE_CADENCE = {
  lead:        { type: "llamar",      days: 1 },
  contactado:  { type: "seguimiento", days: 2 },
  respondio:   { type: "reunion",     days: 1 },
  reunion:     { type: "propuesta",   days: 3 },
  propuesta:   { type: "seguimiento", days: 2 },
  negociacion: { type: "seguimiento", days: 1 },
  ganado:      null,
  perdido:     null
};
