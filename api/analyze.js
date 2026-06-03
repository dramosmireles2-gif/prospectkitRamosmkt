import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RMKT_CATALOG = `
CATÁLOGO RMKT (usa SOLO estos servicios en recommendedServices):
- Landing Express: $1,500 MXN único | 1 página conversión, WhatsApp, mapa, móvil | icon: 🚀
- Web Profesional: $3,500 MXN único | multipágina, catálogo, dominio+hosting 1 año | icon: 🌐
- Web Empresarial: $7,500 MXN único | CMS, blog, SEO técnico, soporte 2 meses | icon: 🏢
- Meta Ads: $2,000–$5,000 MXN/mes | Facebook+Instagram, creativos, reportes | icon: 📣
- Google Ads: $2,500–$6,000 MXN/mes | búsqueda+display, conversiones, reportes | icon: 🔍
- Chatbot de captación: $500 MXN/mes | bot WhatsApp/web, califica prospectos, agenda 24/7 | icon: 🤖
- Automatizaciones: $500–$1,500 MXN/mes | seguimiento leads, recordatorios, integraciones | icon: ⚙️
- Ecommerce Completo: desde $8,000 MXN único | carrito, pagos, panel pedidos | icon: 🛒
- Sistema Administrativo: desde $8,000 MXN único | inventario, órdenes, clientes, reportes | icon: 📊
- CRM Personalizado: desde $8,000 MXN único | pipeline, historial, recordatorios | icon: 🎯
- Dashboard de Negocio: desde $5,000 MXN único | métricas tiempo real, KPIs | icon: 📈
- Sistema de Reservaciones: desde $5,000 MXN único | agenda digital, confirmaciones automáticas | icon: 📅
- App Móvil: desde $20,000 MXN único | iOS+Android, App Store+Play, notificaciones push | icon: 📱
- Plan de Mantenimiento: $500–$1,500 MXN/mes | soporte, actualizaciones, mejoras | icon: 🔧
- Pack de Lanzamiento Digital: $6,000 MXN único | Web Pro + Meta Ads 1er mes + Chatbot | icon: 🎯

PAQUETES POR NICHO (precio de entrada):
- Restaurante/Café: $2,500 Starter → $6,000 Pro → $12,000 Premium
- Clínica/Dental/Salud: $2,500 Starter → $6,500 Pro → $11,000 Premium
- Boutique/Moda/Tienda: $2,500 Starter → $7,000 Pro → $14,000 Premium
- Gimnasio/Fitness: $2,500 Starter → $6,500 Pro → $13,000 Premium
- Iglesia/Templo: $2,500 Starter → $5,500 Pro → $10,000 Premium
`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prospect } = req.body;
  if (!prospect?.name) {
    return res.status(400).json({ error: "prospect.name requerido" });
  }

  const prompt = `Eres Carlos Ramos de RamosMKT, agencia digital en Reynosa, Tamaulipas. Analiza este prospecto y recomienda los servicios más adecuados de tu catálogo real.

PROSPECTO:
- Nombre: ${prospect.name}
- Industria: ${prospect.industry}
- Ciudad: ${prospect.city}
- Sitio web: ${prospect.website || "No tiene"}
- Instagram: ${prospect.instagram || "No tiene"}
- Facebook: ${prospect.facebook || "No tiene"}
- WhatsApp: ${prospect.whatsapp || "No tiene"}
- Notas: ${prospect.notes || "Sin notas"}

${RMKT_CATALOG}

CRITERIO DE RECOMENDACIÓN:
- Si no tiene web → Landing Express ($1,500) como entrada, Web Profesional como upsell inmediato
- Si tiene web básica → Web Profesional o Empresarial según complejidad
- Siempre considera Meta Ads si hay presencia social o potencial local
- Recomienda Chatbot si el negocio recibe muchos mensajes (salud, belleza, restaurante)
- Sistema de Reservaciones para negocios con citas (clínicas, salones, restaurantes, gimnasios)
- Ecommerce para tiendas con catálogo físico
- revenue.min = suma de precios de los servicios recomendados
- revenue.max = suma si contratan todo el ecosistema recomendado

Devuelve SOLO este JSON (sin markdown):
{
  "opportunityScore": <número 40-96>,
  "scoreLabel": <"Oportunidad crítica"|"Alta oportunidad"|"Buen potencial"|"Potencial moderado">,
  "scoreBreakdown": [
    {"label": "Calidad del sitio web", "value": <0-100>, "note": "<observación específica>"},
    {"label": "Experiencia móvil", "value": <0-100>, "note": "<observación específica>"},
    {"label": "Presencia en redes", "value": <0-100>, "note": "<observación específica>"},
    {"label": "Oportunidades de conversión", "value": <0-100>, "note": "<observación específica>"},
    {"label": "Funcionalidades clave", "value": <0-100>, "note": "<observación específica>"}
  ],
  "missingFeatures": [
    {"name": "<feature faltante>", "critical": <true|false>}
  ],
  "recommendedServices": [
    {"service": "<nombre exacto del catálogo>", "confidence": <60-99>, "revenue": <precio MXN>, "unit": "<unidad>", "icon": "<emoji>", "desc": "<descripción 1 línea>"}
  ],
  "opportunities": [
    {"type": "<web|ads|chatbot|reservaciones|ecommerce|sistema>", "title": "<título>", "desc": "<descripción concreta>", "priority": "<urgente|alta|media>", "impact": <50-95>}
  ],
  "actionPlan": [
    {"action": "<acción concreta>", "impact": "<Muy alto|Alto|Medio>", "effort": "<Bajo|Medio|Alto>", "tag": "<Quick Win|Revenue|Proyecto|Retención>"}
  ],
  "revenue": {"min": <MXN total>, "max": <MXN total ecosistema>},
  "weaknesses": ["<debilidad concreta y específica>"],
  "source": "claude"
}

Reglas:
- scoreBreakdown: valor BAJO = mala situación actual = alta oportunidad para RMKT
- missingFeatures: máximo 6, critical=true si bloquea conversiones
- recommendedServices: exactamente 4, del más urgente al más estratégico
- weaknesses: máximo 6, específicas para este negocio`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }]
    });

    const raw = message.content[0].text.trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}") + 1;
    const analysis = JSON.parse(raw.slice(jsonStart, jsonEnd));
    analysis.version = 2;

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error("analyze error:", error);
    return res.status(500).json({ error: error.message || "Error generando análisis" });
  }
}
