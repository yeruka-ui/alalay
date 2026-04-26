export type FrequencyKind = "daily" | "every-other-day" | "weekly";

export type FrequencyDefaults = {
  intakeTimes: string[];
  kind: FrequencyKind;
};

const DEFAULTS: Record<string, FrequencyDefaults> = {
  "Once a day":        { intakeTimes: ["08:00:00+08:00"], kind: "daily" },
  "Twice a day":       { intakeTimes: ["08:00:00+08:00", "20:00:00+08:00"], kind: "daily" },
  "Three times a day": { intakeTimes: ["08:00:00+08:00", "13:00:00+08:00", "20:00:00+08:00"], kind: "daily" },
  "Four times a day":  { intakeTimes: ["08:00:00+08:00", "12:00:00+08:00", "16:00:00+08:00", "20:00:00+08:00"], kind: "daily" },
  "Every other day":   { intakeTimes: ["08:00:00+08:00"], kind: "every-other-day" },
  "Once a week":       { intakeTimes: ["08:00:00+08:00"], kind: "weekly" },
};

export function parseFrequency(label: string): FrequencyDefaults {
  return DEFAULTS[label] ?? { intakeTimes: ["08:00:00+08:00"], kind: "daily" };
}
