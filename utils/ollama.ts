type OllamaErrorCode =
  | "QUOTA"
  | "UNAVAILABLE"
  | "INVALID_INPUT"
  | "UPSTREAM"
  | "UNKNOWN";

export class OllamaError extends Error {
  code: OllamaErrorCode;
  status: number;
  constructor(code: OllamaErrorCode, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const OLLAMA_PRESCRIPTION_PROMPT = `Analyze this prescription image and extract ALL medications.

STEP 1 — Scan the entire image top to bottom. Count every distinct medication name you can see, even if partially legible.
STEP 2 — Output ONE JSON object per medication. Do NOT stop until every medication from STEP 1 is included.

Each object must have exactly these fields:
- "name": medication name (string)
- "dosage": dose amount e.g. "500mg" (string)
- "instructions": when to take e.g. "after meals" (string, default "after meals" if unclear)
- "frequency": how many times per day as an integer (1, 2, 3, or 4)
- "days": how many days to take it as an integer (default 7 if not stated)
- "confidence": "low", "medium", or "high" based on image readability

RULES:
1. Your ENTIRE response must be a single JSON array. NEVER use {"status":...}, {"error":...}, or any wrapper object.
2. ONE object per medication name. Never duplicate.
3. "frequency" must be an integer (e.g. "3x a day" → 3, "twice daily" → 2, "once daily" → 1).
4. "days" must be an integer (e.g. "for 7 days" → 7, "for a month" → 30).
5. If instructions are unclear, use "after meals".
6. If partially unreadable, still include the entry with confidence "low".
7. Include EVERY medication — missing even one is a critical error.

Examples:
"Lipitor 10mg once daily" → [{"name":"Lipitor","dosage":"10mg","instructions":"after meals","frequency":1,"days":30,"confidence":"medium"}]
"Amoxicillin 500mg 3x a day for 7 days" → [{"name":"Amoxicillin","dosage":"500mg","instructions":"after meals","frequency":3,"days":7,"confidence":"high"}]
"Metformin 500mg twice daily, Amlodipine 5mg once daily, Lipitor 10mg once daily" → [{"name":"Metformin","dosage":"500mg","instructions":"after meals","frequency":2,"days":30,"confidence":"high"},{"name":"Amlodipine","dosage":"5mg","instructions":"after meals","frequency":1,"days":30,"confidence":"high"},{"name":"Lipitor","dosage":"10mg","instructions":"after meals","frequency":1,"days":30,"confidence":"high"}]

Output the JSON array only. No explanation, no status, no other text.`;

export const STRICT_RETRY_PREFIX = `STRICT MODE — your previous attempt failed because you produced a non-array object (e.g. {"error":...} or {"status":...}). Output ONLY the JSON array — no explanations, no thinking, no commentary, no error/status/message fields. Begin your response with [ immediately and end with ]. If you cannot read a medication, still include it with "confidence":"low".

`;

const OLLAMA_MODEL = "gemma4:e4b";
const TIMEOUT_MS = 120_000;
const WARMUP_TIMEOUT_MS = 60_000;

/** Fire-and-forget: loads the model into memory so the first real inference skips the load step. */
export async function warmupOllama(): Promise<void> {
  const url = process.env.EXPO_PUBLIC_OLLAMA_URL;
  if (!url) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WARMUP_TIMEOUT_MS);

  try {
    console.log("[ollama] warming up model...");
    const t0 = Date.now();
    await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: "",
        stream: false,
        keep_alive: "10m",
      }),
      signal: controller.signal,
    });
    console.log(`[ollama] warmup done in ${Date.now() - t0}ms — model is hot`);
  } catch {
    console.log("[ollama] warmup skipped (server unreachable)");
  } finally {
    clearTimeout(timer);
  }
}

export async function callOllamaVision(
  base64: string,
  prompt: string,
  opts?: { numCtx?: number; jsonFormat?: boolean; numPredict?: number },
): Promise<{ text: string; truncated: boolean }> {
  const url = process.env.EXPO_PUBLIC_OLLAMA_URL;
  if (!url) {
    throw new OllamaError("UNKNOWN", "EXPO_PUBLIC_OLLAMA_URL not configured", 500);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const t0 = Date.now();
  let response: Response;
  try {
    response = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        images: [base64],
        stream: false,
        ...(opts?.jsonFormat !== false ? { format: "json" } : {}),
        options: {
          num_predict: -1, // cap output tokens to prevent whitespace bleed
          ...(opts?.numCtx != null ? { num_ctx: opts.numCtx } : {}),
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    console.log(`[ollama] inference failed after ${Date.now() - t0}ms`);
    const isAbort =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("aborted"));
    throw new OllamaError(
      "UNAVAILABLE",
      isAbort ? "Ollama request timed out" : "Could not reach Ollama server",
      503,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new OllamaError(
      "UPSTREAM",
      `Ollama error: ${response.status}`,
      response.status >= 400 && response.status < 600 ? response.status : 502,
    );
  }

  const result = await response.json();
  const wallMs = Date.now() - t0;

  const ns = (n: unknown) => (typeof n === "number" ? Math.round(n / 1e6) : null);
  const loadMs = ns(result?.load_duration);
  const promptMs = ns(result?.prompt_eval_duration);
  const evalMs = ns(result?.eval_duration);
  const totalMs = ns(result?.total_duration) ?? wallMs;
  const promptTokens = result?.prompt_eval_count ?? "?";
  const evalTokens = result?.eval_count ?? "?";
  const tokPerSec =
    typeof result?.eval_count === "number" &&
      typeof result?.eval_duration === "number" &&
      result.eval_duration > 0
      ? (result.eval_count / (result.eval_duration / 1e9)).toFixed(1)
      : "?";
  const imageSizeKb = Math.round((base64.length * 3) / 4 / 1024);

  const doneReason: string = result?.done_reason ?? "unknown";
  const truncated = doneReason === "length";

  console.log(`[ollama] ─── inference complete ───────────────────`);
  console.log(`[ollama] model        : ${OLLAMA_MODEL}`);
  console.log(`[ollama] image size   : ${imageSizeKb} KB`);
  console.log(`[ollama] wall time    : ${wallMs} ms`);
  console.log(`[ollama] total (srv)  : ${totalMs} ms`);
  console.log(`[ollama] model load   : ${loadMs ?? "?"} ms`);
  console.log(`[ollama] prompt eval  : ${promptMs ?? "?"} ms  (${promptTokens} tokens)`);
  console.log(`[ollama] generation   : ${evalMs ?? "?"} ms  (${evalTokens} tokens · ${tokPerSec} tok/s)`);
  console.log(`[ollama] done reason  : ${doneReason}${truncated ? " ⚠️  OUTPUT WAS TRUNCATED — increase num_predict" : ""}`);
  console.log(`[ollama] raw response : ${result?.response}`);
  console.log(`[ollama] ──────────────────────────────────────────`);

  const text: string | undefined = result?.response;
  if (!text) {
    throw new OllamaError("UPSTREAM", "Empty response from Ollama", 502);
  }
  return { text, truncated };
}

// ─── Two-pass prompts ────────────────────────────────────────────────────────

export const OLLAMA_EXTRACT_PROMPT = `Read this prescription image and transcribe every word you can see, exactly as written.

List each medication line by line with its dosage, instructions, and duration.
For text that is hard to read, write your best guess — do not skip anything.

Output the transcribed text only. No JSON, no formatting, no commentary. Do not output any empty lines or whitespace padding. Stop generating immediately after the last word.`;

export const makeOllamaStructurePrompt = (rawText: string) =>
  `You are a pharmacist. From the prescription text below, extract all medications and return a JSON array.

PRESCRIPTION TEXT:
${rawText}

For each medication, create an object with exactly these fields:
- "name": medication name (string)
- "dosage": dose e.g. "500mg" (string, or null if not present)
- "instructions": when/how to take e.g. "after meals" (string, default "after meals")
- "frequency": times per day as integer 1–4. Examples: "once daily"→1, "twice a day"→2, "3x a day"→3, "every 8 hours"→3, "every 6 hours"→4, "QID"→4
- "days": duration in days as integer (default 7 if not stated). Examples: "for 7 days"→7, "for a month"→30, "as needed"→7
- "confidence": "low" if the original text was hard to read, "high" if clear, "medium" otherwise

RULES:
1. Output ONLY a JSON array. No wrapper object, no explanation, no extra keys.
2. ONE object per medication name. Never duplicate.
3. Include every medication mentioned in the text.
4. If a name is unclear, still include it with "confidence":"low".

Output the JSON array only.`;

export async function callOllama(
  prompt: string,
  opts?: { numCtx?: number },
): Promise<{ text: string; truncated: boolean }> {
  const url = process.env.EXPO_PUBLIC_OLLAMA_URL;
  if (!url) {
    throw new OllamaError("UNKNOWN", "EXPO_PUBLIC_OLLAMA_URL not configured", 500);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const t0 = Date.now();
  let response: Response;
  try {
    response = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
        options: {
          num_predict: -1,
          ...(opts?.numCtx != null ? { num_ctx: opts.numCtx } : {}),
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const isAbort =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("aborted"));
    throw new OllamaError(
      "UNAVAILABLE",
      isAbort ? "Ollama request timed out" : "Could not reach Ollama server",
      503,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new OllamaError(
      "UPSTREAM",
      `Ollama error: ${response.status}`,
      response.status >= 400 && response.status < 600 ? response.status : 502,
    );
  }

  const result = await response.json();
  const wallMs = Date.now() - t0;
  const doneReason: string = result?.done_reason ?? "unknown";
  const truncated = doneReason === "length";

  console.log(`[ollama] ─── text inference complete ────────────────`);
  console.log(`[ollama] wall time    : ${wallMs} ms`);
  console.log(`[ollama] done reason  : ${doneReason}${truncated ? " ⚠️  OUTPUT WAS TRUNCATED" : ""}`);
  console.log(`[ollama] raw response : ${result?.response}`);
  console.log(`[ollama] ──────────────────────────────────────────`);

  const text: string | undefined = result?.response;
  if (!text) {
    throw new OllamaError("UPSTREAM", "Empty response from Ollama", 502);
  }
  return { text, truncated };
}
