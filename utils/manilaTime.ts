const MANILA_OFFSET_MS = 8 * 60 * 60_000; // UTC+8

/**
 * Combines a date string ("YYYY-MM-DD") and a timetz string ("HH:MM:SS+08:00")
 * into a JS Date (UTC instant) representing that Manila wall-clock moment.
 */
export function combineManilaDateTime(
  dateStr: string,
  timetz: string | null
): Date | null {
  if (!timetz) return null;
  const [hh, mm] = timetz.split(":");
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(
    Date.UTC(y, m - 1, d, parseInt(hh, 10), parseInt(mm, 10)) - MANILA_OFFSET_MS
  );
}

/**
 * Returns a "YYYY-MM-DD" string for the given Date in Manila wall time (UTC+8).
 * Use instead of date.toISOString().split("T")[0] which gives UTC date.
 */
export function manilaDateString(d: Date): string {
  const manila = new Date(d.getTime() + MANILA_OFFSET_MS);
  return manila.toISOString().split("T")[0];
}
