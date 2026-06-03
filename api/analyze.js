import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prospect } = req.body;
  if (!prospect?.name) {
    return res.status(400).json({ error: "prospect.name requerido" });
  }

  const prompt = `Eres un experto en marketing digital para PyMEs latinoamericanas. Analiza este prospecto y devuelve SOLO un JSON válido, sin texto adicional.

PROSPECTO:
- Nombre: ${prospect.name}
- Industria: ${prospect.industry}
- Ciudad: ${prospect.city}
- Sitio web: ${prospect.website || "No tiene"}
- Instagram: ${prospect.instagram || "No tiene"}
- Facebook: ${prospect.facebook || "No tiene"}
- WhatsApp: ${prospect.whatsapp || "No tiene"}
- Notas: ${prospect.notes || "Sin notas"}

Devuelve exactamente este JSON (sin markdown, sin explicaciones):
{
  "opportunityScore": <número 40-96>,
  "scoreLabel": <"Oportunidad crítica"|"Alta oportunidad"|"Buen potencial"|"Potencial moderado">,
  "scoreBreakdown": [
    {"label": "Calidad del sitio web", "value": <0-100>, "note": "<observación breve>"},
    {"label": "Experiencia móvil", "value": <0-100>, "note": "<observación breve>"},
    {"label": "Presencia en redes", "value": <0-100>, "note": "<observación breve>"},
    {"label": "Oportunidades de conversión", "value": <0-100>, "note": "<observación breve>"},
    {"label": "Funcionalidades clave", "value": <0-100>, "note": "<observación breve>"}
  ],
  "missingFeatures": [
    {"name": "<feature>", "critical": <true|false>}
  ],
  "recommendedServices": [
    {"service": "<nombre>", "confidence": <60-99>, "revenue": <número MXN/mes>, "unit": "/mes", "icon": "<emoji>", "desc": "<descripción 1 línea>"}
  ],
  "opportunities": [
    {"type": "<web|gmb|ads|social|whatsapp|ecom>", "title": "<título>", "desc": "<descripción>", "priority": "<urgente|alta|media>", "impact": <50-95>}
  ],
  "actionPlan": [
    {"action": "<acción concreta>", "impact": "<Muy alto|Alto|Medio>", "effort": "<Bajo|Medio|Alto>", "tag": "<Quick Win|Revenue|Proyecto|Retención>"}
  ],
  "revenue": {"min": <MXN/mes>, "max": <MXN/mes>},
  "weaknesses": ["<debilidad concreta>"],
  "source": "claude"
}

Reglas:
- scoreBreakdown: valores altos = menos gap (ya lo tienen), valores bajos = más oportunidad
- missingFeatures: máximo 6, marca critical=true si es urgente
- recommendedServices: exactamente 4, ordena por impacto esperado
- revenue en pesos mexicanos (MXN), rango realista para PyME local
- weaknesses: máximo 6, concretas y accionables`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1500,
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
