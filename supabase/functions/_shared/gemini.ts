export type MedicationItem = {
  id: string;
  name: string;
  instructions: string;
  time: string;
  dosage?: string;
  confidence?: "low" | "medium" | "high";
};

export type AiErrorCode =
  | "QUOTA"
  | "UNAVAILABLE"
  | "INVALID_INPUT"
  | "UPSTREAM"
  | "UNKNOWN";

export class GeminiError extends Error {
  code: AiErrorCode;
  status: number;
  constructor(code: AiErrorCode, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

type GeminiPart =
  | { inlineData: { mimeType: string; data: string } }
  | { text: string };

export async function callGemini(parts: GeminiPart[]): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new GeminiError("UNKNOWN", "GEMINI_API_KEY not configured", 500);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 429) {
      throw new GeminiError("QUOTA", "Quota limit reached", 429);
    }
    if (response.status === 503) {
      throw new GeminiError("UNAVAILABLE", "Model temporarily unavailable", 503);
    }
    throw new GeminiError(
      "UPSTREAM",
      `Gemini error: ${response.status} ${body}`,
      response.status >= 400 && response.status < 600 ? response.status : 502,
    );
  }

  const result = await response.json();
  const text: string | undefined =
    result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new GeminiError("UPSTREAM", "Empty response from Gemini", 502);
  }
  return text;
}

export function parseMedications(
  text: string,
  includeConfidence: boolean,
): MedicationItem[] {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
  }

  const parsed: unknown = JSON.parse(cleaned);
  const arr = Array.isArray(parsed) ? parsed : [parsed];

  return arr.map(
    (item: Record<string, unknown>, index: number): MedicationItem => ({
      id: `${Date.now()}-${index}`,
      name: typeof item.name === "string" ? item.name : "Unknown Medication",
      instructions:
        typeof item.instructions === "string" ? item.instructions : "",
      time: typeof item.time === "string" ? item.time : "",
      dosage: typeof item.dosage === "string" ? item.dosage : undefined,
      ...(includeConfidence && {
        confidence:
          item.confidence === "low" ||
            item.confidence === "medium" ||
            item.confidence === "high"
            ? item.confidence
            : "medium",
      }),
    }),
  );
}
