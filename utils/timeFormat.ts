const TIME_REGEX = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

export function toDbTime(human: string): string | null {
  const match = human.trim().match(TIME_REGEX);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM") {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  return `${String(hours).padStart(2, "0")}:${minutes}:00+08:00`;
}

export function fromDbTime(db: string | null): string {
  if (!db) return "";
  const parts = db.split(":");
  if (parts.length < 2) return db;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const period = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${hours}:${minutes} ${period}`;
}
