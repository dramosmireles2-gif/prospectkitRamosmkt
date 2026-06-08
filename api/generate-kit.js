import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prospect, analysis } = req.body;
  if (!prospect?.name || !analysis) {
    return res.status(400).json({ error: "prospect y analysis requeridos" });
  }

  const topService = analysis.recommendedServices?.[0]?.service || "estrategia digital";
  const topPrice = analysis.recommendedServices?.[0]?.revenue || "";
  const topUnit = analysis.recommendedServices?.[0]?.unit || "";
  const weaknesses = (analysis.weaknesses || []).slice(0, 3).join(", ");
  const upsell = analysis.recommendedServices?.[1]?.service || "";

  const prompt = `Eres Carlos Ramos de RamosGrowth (ramosmkt.lat), agencia tecnológica en Reynosa, Tam. Creas mensajes de prospección personalizados y directos para PyMEs mexicanas.

PROSPECTO: ${prospect.name} | ${prospect.industry} | ${prospect.city}
SERVICIO PRINCIPAL A VENDER: ${topService}${topPrice ? ` — desde $${topPrice.toLocaleString()} MXN${topUnit}` : ""}
UPSELL NATURAL: ${upsell}
DEBILIDADES DETECTADAS: ${weaknesses}
SCORE: ${analysis.opportunityScore}/100

Devuelve SOLO este JSON (sin markdown):
{
  "channelMessages": {
    "whatsapp": "<mensaje directo, máx 3 párrafos cortos, tono consultivo no vendedor, emoji de apertura, termina con pregunta concreta, firma Carlos / RamosGrowth>",
    "instagram": "<DM casual, máx 2 líneas, directo y humano, sin emojis exagerados>",
    "facebook": "<mensaje profesional para página, máx 2 párrafos, menciona hallazgo específico del negocio>",
    "email": {
      "subject": "<asunto concreto con el nombre del negocio, no genérico>",
      "body": "<email profesional 3-4 párrafos: apertura con hallazgo específico, 2-3 puntos del diagnóstico, CTA claro con precio o siguiente paso, firma Carlos Ramos / RamosGrowth / ramosmkt.lat / +52 814 807 8309>"
    }
  },
  "proposalSnapshot": {
    "before": ["<situación actual negativa 1 específica>", "<situación actual 2>", "<situación actual 3>"],
    "after": ["<mejora concreta 1 con ${topService}>", "<mejora 2>", "<mejora 3>", "<mejora 4 con ${upsell || 'siguiente servicio'}>"],
    "summary": "<1 oración de transformación específica para este negocio>"
  }
}

Reglas:
- Usa el nombre exacto del negocio, no "su empresa" ni "tu negocio"
- Menciona la ciudad o industria para mostrar que investigaste
- Los mensajes deben sonar humanos, no como plantilla corporativa
- El before/after debe ser específico para ${prospect.name}, no genérico
- En el email incluye el precio del servicio principal como referencia`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }]
    });

    const raw = message.content[0].text.trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}") + 1;
    const kit = JSON.parse(raw.slice(jsonStart, jsonEnd));

    return res.status(200).json({ kit });
  } catch (error) {
    console.error("generate-kit error:", {
      message: error.message,
      status: error.status,
      type: error.type,
      name: error.name
    });
    return res.status(500).json({
      error: "Claude no pudo generar el kit. Se usará fallback local.",
      detail: error.message
    });
  }
}
