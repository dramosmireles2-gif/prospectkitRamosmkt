export const PROJECT_TYPES = {
  iglesia:    { label: "Iglesia / Ministerio",   hook: "¿Tu iglesia ya tiene sitio web?",            problem: "Comunicación dispersa, sin plataforma central", solution: "Sitio web + agenda + galería + donaciones", cta: "Digitaliza tu comunidad" },
  boutique:   { label: "Boutique / Renta",        hook: "¿Aún administras tus rentas manualmente?",   problem: "Inventario en Excel, citas por WhatsApp",         solution: "Sistema propio de reservas e inventario",     cta: "Automatiza tu boutique" },
  restaurante:{ label: "Restaurante / Cafetería", hook: "¿Tus clientes pueden ordenar en línea?",     problem: "Sin menú digital ni pedidos online",              solution: "Menú + pedidos + reservas en tu propia app",  cta: "Moderniza tu restaurante" },
  clinica:    { label: "Clínica / Salud",         hook: "¿Tus pacientes agendan por WhatsApp?",       problem: "Citas manuales, sin historial digital",           solution: "Sistema de citas + expediente + recordatorios",cta: "Digitaliza tu clínica" },
  ecommerce:  { label: "E-commerce / Tienda",     hook: "¿Tu tienda online ya es tuya?",              problem: "Dependencia de Marketplace, sin control",         solution: "Tienda propia + catálogo + pagos integrados", cta: "Tu tienda, tus reglas" },
  sistema:    { label: "Sistema / Admin",         hook: "¿Sigues usando Excel para esto?",            problem: "Procesos manuales, errores, pérdida de tiempo",   solution: "Sistema a la medida + panel de control",      cta: "Deja de hacer esto manual" },
  invitacion: { label: "Invitación Digital",      hook: "Las invitaciones de papel quedaron atrás.",  problem: "Invitaciones físicas: caras, lentas, sin datos",  solution: "Invitación digital + RSVP + contador",        cta: "Invita diferente" },
  fitness:    { label: "Gym / Fitness",           hook: "¿Tu gym no tiene app propia?",               problem: "Clases por WhatsApp, pagos en efectivo",          solution: "App de clases + membresías + pagos",          cta: "Profesionaliza tu gym" },
  otro:       { label: "Otro",                    hook: "Tu negocio merece presencia digital.",        problem: "Sin presencia digital profesional",               solution: "Solución digital a la medida",                cta: "Hablemos de tu proyecto" },
};

export function detectProjectType(industry = "", description = "") {
  const text = `${industry} ${description}`.toLowerCase();
  if (text.match(/iglesia|ministerio|pastor|comunidad|culto|worship/)) return "iglesia";
  if (text.match(/boutique|renta|vestido|boda|outfit/)) return "boutique";
  if (text.match(/restaurante|comida|men[uú]|caf[eé]|cafetera|food|delivery/)) return "restaurante";
  if (text.match(/cl[ií]nica|m[eé]dico|salud|doctor|cita|paciente|dental/)) return "clinica";
  if (text.match(/tienda|ecommerce|producto|venta|cat[aá]logo|shop/)) return "ecommerce";
  if (text.match(/sistema|admin|inventario|gesti[oó]n|panel|erp|crm/)) return "sistema";
  if (text.match(/invitaci[oó]n|evento|boda|xv|quince|fiesta|rsvp/)) return "invitacion";
  if (text.match(/gym|fitness|entrenamiento|clase|membres[ií]a/)) return "fitness";
  return "otro";
}
