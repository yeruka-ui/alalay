import type { MedicationItem } from "@/components/MedicationCard";
import { supabase } from "./supabase";

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
  mimeType: string,
): Promise<MedicationItem[]> {
  return invokeAiFunction("analyze-prescription", { base64, mimeType });
}

export async function analyzeAudio(
  base64: string,
  mimeType: string,
): Promise<MedicationItem[]> {
  return invokeAiFunction("analyze-audio", { base64, mimeType });
}
