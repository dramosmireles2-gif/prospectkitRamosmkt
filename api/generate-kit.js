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
  const weaknesses = (analysis.weaknesses || []).slice(0, 3).join(", ");

  const prompt = `Eres Carlos Ramos de RamosMKT, experto en ventas digitales para PyMEs en México. Crea mensajes de prospección personalizados para este negocio.

PROSPECTO: ${prospect.name} | ${prospect.industry} | ${prospect.city}
OPORTUNIDAD PRINCIPAL: ${topService}
DEBILIDADES: ${weaknesses}
SCORE: ${analysis.opportunityScore}/100

Devuelve SOLO este JSON (sin markdown):
{
  "channelMessages": {
    "whatsapp": "<mensaje directo, máx 3 párrafos, tono consultivo, incluye emoji de apertura, termina con pregunta>",
    "instagram": "<mensaje corto para DM, máx 2 líneas, casual y directo>",
    "facebook": "<mensaje para página de Facebook, tono profesional, máx 2 párrafos>",
    "email": {
      "subject": "<asunto concreto y relevante, no genérico>",
      "body": "<cuerpo del email profesional, 3-4 párrafos, incluye hallazgos específicos y CTA claro>"
    }
  },
  "proposalSnapshot": {
    "before": ["<situación actual negativa 1>", "<situación actual negativa 2>", "<situación actual negativa 3>"],
    "after": ["<mejora concreta 1>", "<mejora concreta 2>", "<mejora concreta 3>", "<mejora concreta 4>"],
    "summary": "<1 oración impactante sobre la transformación posible>"
  }
}

Reglas:
- Usa el nombre del negocio directamente, no "su empresa"
- Menciona la ciudad o industria para mostrar que investigaste
- Los mensajes deben sonar humanos, no como template
- El before/after debe ser específico para este negocio, no genérico`;

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
    console.error("generate-kit error:", error);
    return res.status(500).json({ error: error.message || "Error generando kit" });
  }
}
