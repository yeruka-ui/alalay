import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callGemini,
  GeminiError,
  parseMedications,
} from "../_shared/gemini.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PROMPT = `Analyze this prescription image. Extract each medication into a JSON array.
IMPORTANT: Create a SEPARATE entry for EACH time slot. If a medication is taken 3 times a day, output 3 separate objects with the same name but different times.
Each object must have: "name" (string), "instructions" (string, e.g. "after eating"), "time" (string, e.g. "9:00 AM"), "dosage" (string, e.g. "500mg"), "confidence" (string: "low", "medium", or "high" — based on how clearly the medication text is visible in the image).
If time is not visible, infer reasonable defaults based on frequency (e.g. once daily: "8:00 AM", twice daily: "8:00 AM" and "8:00 PM", three times daily: "8:00 AM", "1:00 PM", "8:00 PM").
Return ONLY the JSON array, no other text.
Example for "Paracetamol 500mg 3 times a day after eating":
[{"name":"Paracetamol","instructions":"after eating","time":"8:00 AM","dosage":"500mg","confidence":"high"},{"name":"Paracetamol","instructions":"after eating","time":"1:00 PM","dosage":"500mg","confidence":"high"},{"name":"Paracetamol","instructions":"after eating","time":"8:00 PM","dosage":"500mg","confidence":"high"}]`;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: { code: "AUTH", message: "Missing authorization header" } }, 401);
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: { code: "AUTH", message: "Invalid or expired session" } }, 401);
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.base64 !== "string") {
      return jsonResponse({ error: { code: "INVALID_INPUT", message: "base64 is required" } }, 400);
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(body.mimeType)) {
      return jsonResponse(
        { error: { code: "INVALID_INPUT", message: "mimeType must be image/jpeg, image/png, or image/webp" } },
        400,
      );
    }

    // base64 string for a 5MB image is ~6.8M chars — reject above that
    if (body.base64.length > 6_800_000) {
      return jsonResponse({ error: { code: "INVALID_INPUT", message: "Image too large (max 5 MB)" } }, 413);
    }

    const text = await callGemini([
      { inlineData: { mimeType: body.mimeType, data: body.base64 } },
      { text: PROMPT },
    ]);

    const medications = parseMedications(text, true);
    return jsonResponse({ medications });
  } catch (err) {
    if (err instanceof GeminiError) {
      return jsonResponse({ error: { code: err.code, message: err.message } }, err.status);
    }
    return jsonResponse({ error: { code: "UNKNOWN", message: "Internal server error" } }, 500);
  }
});
