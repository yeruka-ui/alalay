export type CalendarDayAnimationMode = "fade" | "morph";

export function getCalendarDayAnimationMode(platformOS: string): CalendarDayAnimationMode {
  return platformOS === "android" ? "fade" : "morph";
}
