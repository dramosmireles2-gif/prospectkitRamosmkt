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
  DETAIL: "detail",
  ANALYSIS: "analysis",
  KIT: "kitgen",
  ASSETS: "assets"
};

export const PROSPECT_VIEWS = [VIEWS.DETAIL, VIEWS.ANALYSIS, VIEWS.KIT, VIEWS.ASSETS];

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
