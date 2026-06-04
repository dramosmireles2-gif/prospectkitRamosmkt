export const PROJECT_TYPES = {
  clinica: {
    label: "Clínica / Salud",
    hook: "¿Cuánto dinero pierde\npor tener la\nsilla vacía?",
    hookAccent: "PIERDE",
    subheadline: "Deja de perder pacientes.\nEmpieza a hacer crecer tu clínica.",
    bullets: [
      { icon: "📈", accent: "Presencia digital", rest: " que aumenta tu facturación." },
      { icon: "📅", accent: "Agenda automatizada", rest: " y accesible desde tu celular." },
      { icon: "🎯", accent: "Atrae tratamientos", rest: " de alto valor." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para clínicas que quieren CRECER",
    problem: "Citas manuales, sin historial digital",
    solution: "Sistema de citas + expediente + recordatorios",
  },
  restaurante: {
    label: "Restaurante / Cafetería",
    hook: "¿Cuántas mesas\nse quedan\nvacías hoy?",
    hookAccent: "VACÍAS",
    subheadline: "Deja de perder comensales.\nEmpieza a llenar tu restaurante.",
    bullets: [
      { icon: "📱", accent: "Menú digital", rest: " y pedidos en línea desde tu celular." },
      { icon: "📣", accent: "Más clientes", rest: " con publicidad local en Meta y Google." },
      { icon: "⭐", accent: "Reputación online", rest: " con reseñas y presencia activa." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para restaurantes que quieren CRECER",
    problem: "Sin menú digital ni pedidos online",
    solution: "Menú + pedidos + reservas en tu propia app",
  },
  boutique: {
    label: "Boutique / Renta",
    hook: "¿Sigues\nmanejando tus\nrentas a mano?",
    hookAccent: "A MANO",
    subheadline: "Automatiza tu boutique.\nVende más sin el caos.",
    bullets: [
      { icon: "🛍️", accent: "Catálogo digital", rest: " con reservas y pagos en línea." },
      { icon: "📲", accent: "Redes sociales", rest: " que convierten seguidores en clientes." },
      { icon: "📊", accent: "Control total", rest: " de inventario desde tu celular." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para boutiques que quieren CRECER",
    problem: "Inventario en Excel, citas por WhatsApp",
    solution: "Sistema propio de reservas e inventario",
  },
  ecommerce: {
    label: "E-commerce / Tienda",
    hook: "¿Tu tienda\nonline todavía\nno es tuya?",
    hookAccent: "NO ES TUYA",
    subheadline: "Deja los marketplaces.\nTen tu propia tienda y tus reglas.",
    bullets: [
      { icon: "🛒", accent: "Tienda propia", rest: " con catálogo, pagos y envíos integrados." },
      { icon: "🎯", accent: "Publicidad", rest: " que trae clientes listos para comprar." },
      { icon: "📦", accent: "Automatiza", rest: " pedidos, inventario y seguimiento." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para tiendas que quieren CRECER",
    problem: "Dependencia de Marketplace, sin control",
    solution: "Tienda propia + catálogo + pagos integrados",
  },
  iglesia: {
    label: "Iglesia / Ministerio",
    hook: "¿Tu iglesia\nya tiene\npresencia digital?",
    hookAccent: "DIGITAL",
    subheadline: "Conecta con tu comunidad.\nLlega a más personas.",
    bullets: [
      { icon: "🌐", accent: "Sitio web", rest: " con agenda, galería y transmisiones." },
      { icon: "📱", accent: "Redes sociales", rest: " que crecen tu comunidad cada semana." },
      { icon: "💬", accent: "Comunicación", rest: " directa con tus miembros en un solo lugar." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para ministerios que quieren CRECER",
    problem: "Comunicación dispersa, sin plataforma central",
    solution: "Sitio web + agenda + galería + donaciones",
  },
  fitness: {
    label: "Gym / Fitness",
    hook: "¿Tu gym\ntodavía no tiene\napp propia?",
    hookAccent: "APP PROPIA",
    subheadline: "Deja de perder miembros.\nProfesionaliza tu negocio.",
    bullets: [
      { icon: "💪", accent: "App de clases", rest: " con reservas y membresías digitales." },
      { icon: "📣", accent: "Atrae nuevos", rest: " miembros con publicidad hipersegmentada." },
      { icon: "📊", accent: "Control total", rest: " de pagos, asistencia y renovaciones." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para gyms que quieren CRECER",
    problem: "Clases por WhatsApp, pagos en efectivo",
    solution: "App de clases + membresías + pagos",
  },
  sistema: {
    label: "Sistema / Admin",
    hook: "¿Cuánto tiempo\npierdes haciendo\nesto manual?",
    hookAccent: "MANUAL",
    subheadline: "Automatiza tus procesos.\nRecupera tiempo y dinero.",
    bullets: [
      { icon: "⚡", accent: "Sistema a la medida", rest: " que elimina tareas repetitivas." },
      { icon: "📊", accent: "Panel de control", rest: " con reportes en tiempo real." },
      { icon: "🔗", accent: "Integración", rest: " con las herramientas que ya usas." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Soluciones digitales para empresas que quieren CRECER",
    problem: "Procesos manuales, errores, pérdida de tiempo",
    solution: "Sistema a la medida + panel de control",
  },
  invitacion: {
    label: "Invitación Digital",
    hook: "Las invitaciones\nde papel ya\nquedaron atrás.",
    hookAccent: "ATRÁS",
    subheadline: "Sorprende a tus invitados.\nInvita diferente.",
    bullets: [
      { icon: "✨", accent: "Invitación digital", rest: " con RSVP y contador regresivo." },
      { icon: "📲", accent: "Comparte en segundos", rest: " por WhatsApp, Instagram y más." },
      { icon: "📊", accent: "Confirmaciones", rest: " en tiempo real desde tu celular." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Invitaciones digitales que marcan la diferencia",
    problem: "Invitaciones físicas: caras, lentas, sin datos",
    solution: "Invitación digital + RSVP + contador",
  },
  otro: {
    label: "Negocio",
    hook: "¿Tu negocio\nmerece más\nclientes?",
    hookAccent: "MÁS",
    subheadline: "Deja de depender del boca a boca.\nHaz crecer tu negocio con marketing digital.",
    bullets: [
      { icon: "🌐", accent: "Presencia digital", rest: " profesional que genera confianza." },
      { icon: "📣", accent: "Publicidad", rest: " que llega a tus clientes ideales." },
      { icon: "📈", accent: "Resultados medibles", rest: " desde el primer mes." },
    ],
    cta: "Agenda una asesoría sin compromiso",
    footer: "Marketing digital para negocios que quieren CRECER",
    problem: "Sin presencia digital profesional",
    solution: "Solución digital a la medida",
  },
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
