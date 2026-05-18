import type { MedicationItem } from "@/components/MedicationCard";
import { supabase } from "./supabase";
import { callOllamaVision, OllamaError, OLLAMA_PRESCRIPTION_PROMPT, STRICT_RETRY_PREFIX } from "./ollama";
import { MedicationParseError, parseMedications } from "./parseMedications";

type AiErrorCode =
  | "QUOTA"
  | "UNAVAILABLE"
  | "INVALID_INPUT"
  | "UPSTREAM"
  | "AUTH"
  | "UNKNOWN";

function mapAiError(code: AiErrorCode): string {
  switch (code) {
    case "QUOTA":
      return "Quota limit reached. Wait a minute and try again.";
    case "UNAVAILABLE":
      return "AI service temporarily unavailable. Try again in a moment.";
    case "INVALID_INPUT":
      return "Could not process the provided file.";
    case "AUTH":
      return "Your session expired. Sign out and sign in again.";
    default:
      return "Something went wrong analyzing the content. Please try again.";
  }
}

async function invokeAiFunction(
  functionName: "analyze-prescription" | "analyze-audio",
  body: Record<string, string>,
): Promise<MedicationItem[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error(mapAiError("AUTH"));
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });

  if (error) {
    const ctx = (error as any)?.context;
    let status: number | undefined;
    let bodyText: string | undefined;
    if (ctx && typeof ctx.status === "number") status = ctx.status;
    if (ctx && typeof ctx.text === "function") {
      try { bodyText = await ctx.text(); } catch {}
    }
    console.error(`[ai] ${functionName} invoke error:`, { status, bodyText, error });

    if (status === 401) throw new Error(mapAiError("AUTH"));
    if (status === 413) throw new Error(mapAiError("INVALID_INPUT"));

    try {
      const parsed = JSON.parse(bodyText ?? "");
      if (parsed?.code) throw new Error(mapAiError((parsed.code as AiErrorCode) ?? "UNKNOWN"));
    } catch {}

    throw new Error(mapAiError("UNKNOWN"));
  }

  if (data?.error) {
    console.error(`[ai] ${functionName} upstream error:`, data.error);
    throw new Error(mapAiError((data.error.code as AiErrorCode) ?? "UNKNOWN"));
  }

  console.log(`[ai] ${functionName} response:`, JSON.stringify(data, null, 2));

  return data.medications as MedicationItem[];
}

export async function analyzePrescription(
  base64: string,
  // mimeType kept for signature compatibility; Ollama infers format from image data
  _mimeType: string,
): Promise<MedicationItem[]> {
  try {
    let { text, truncated } = await callOllamaVision(base64, OLLAMA_PRESCRIPTION_PROMPT);

    if (truncated) {
      console.log("[ai] OCR output truncated — retrying with numCtx=16384");
      try {
        ({ text, truncated } = await callOllamaVision(
          base64,
          OLLAMA_PRESCRIPTION_PROMPT,
          { numCtx: 16384 },
        ));
        if (truncated) console.log("[ai] Output still truncated at numCtx=16384 — parsing partial result");
      } catch (retryErr) {
        console.log("[ai] Context retry failed — parsing partial result:", retryErr);
      }
    }

    return parseMedications(text, true);
  } catch (err) {
    if (err instanceof MedicationParseError) {
      console.log("[ai] OCR refused — retrying with strict prompt");
      try {
        const { text } = await callOllamaVision(
          base64,
          STRICT_RETRY_PREFIX + OLLAMA_PRESCRIPTION_PROMPT,
        );
        return parseMedications(text, true);
      } catch (retryErr) {
        console.log("[ai] OCR retry also failed:", retryErr);
        if (retryErr instanceof OllamaError) throw new Error(mapAiError(retryErr.code));
        throw new Error(mapAiError("INVALID_INPUT"));
      }
    }
    if (err instanceof OllamaError) throw new Error(mapAiError(err.code));
    if (err instanceof SyntaxError) throw new Error(mapAiError("INVALID_INPUT"));
    throw new Error(mapAiError("UNKNOWN"));
  }
}

export async function analyzeAudio(
  base64: string,
  mimeType: string,
): Promise<MedicationItem[]> {
  return invokeAiFunction("analyze-audio", { base64, mimeType });
}
