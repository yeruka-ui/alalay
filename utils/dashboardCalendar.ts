export const DAY_BATCH_SIZE = 5;
const CENTER_INDEX = Math.floor(DAY_BATCH_SIZE / 2);

export function startOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

export function addDays(date: Date, days: number): Date {
  const shiftedDate = startOfDay(date);
  shiftedDate.setDate(shiftedDate.getDate() + days);
  return shiftedDate;
}

export function createDateBatch(startDate: Date): Date[] {
  const normalizedStartDate = startOfDay(startDate);

  return Array.from({ length: DAY_BATCH_SIZE }, (_, index) =>
    addDays(normalizedStartDate, index),
  );
}

export function getCenteredBatchStart(date: Date): Date {
  return addDays(date, -CENTER_INDEX);
}

export function getBatchStartForOffset(startDate: Date, pageOffset: number): Date {
  return addDays(startDate, pageOffset * DAY_BATCH_SIZE);
}

export function shiftBatchStart(startDate: Date, direction: -1 | 1): Date {
  return getBatchStartForOffset(startDate, direction);
}

export function isSameDay(leftDate: Date, rightDate: Date): boolean {
  return leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate();
}
