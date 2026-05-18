import type { MedicationItem } from "@/components/MedicationCard";

const TIMES_BY_FREQUENCY: Record<number, string[]> = {
  1: ["8:00 AM"],
  2: ["8:00 AM", "8:00 PM"],
  3: ["8:00 AM", "1:00 PM", "8:00 PM"],
  4: ["8:00 AM", "12:00 PM", "4:00 PM", "8:00 PM"],
};

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

  let arr: unknown[];
  if (Array.isArray(parsed)) {
    arr = parsed;
  } else if (parsed !== null && typeof parsed === "object") {
    const nested = Object.values(parsed as Record<string, unknown>).find(
      (v) => Array.isArray(v),
    );
    arr = nested ? (nested as unknown[]) : [parsed];
  } else {
    arr = [parsed];
  }

  const items: MedicationItem[] = [];

  arr.forEach((item: Record<string, unknown>, srcIndex: number) => {
    const name =
      typeof item.name === "string" ? item.name : "Unknown Medication";
    const dosage =
      typeof item.dosage === "string" ? item.dosage : undefined;
    const instructions =
      typeof item.instructions === "string" ? item.instructions : "";
    const days =
      typeof item.days === "number" && item.days > 0
        ? Math.round(item.days)
        : 7;
    const confidence =
      includeConfidence
        ? item.confidence === "low" ||
          item.confidence === "medium" ||
          item.confidence === "high"
          ? (item.confidence as "low" | "medium" | "high")
          : "medium"
        : undefined;

    const freq =
      typeof item.frequency === "number" && item.frequency >= 1
        ? Math.min(Math.round(item.frequency), 4)
        : 1;

    const times = TIMES_BY_FREQUENCY[freq] ?? TIMES_BY_FREQUENCY[1];

    times.forEach((time, timeIndex) => {
      items.push({
        id: `${Date.now()}-${srcIndex}-${timeIndex}`,
        name,
        instructions,
        time,
        dosage,
        days,
        ...(includeConfidence && confidence ? { confidence } : {}),
      });
    });
  });

  return items;
}
