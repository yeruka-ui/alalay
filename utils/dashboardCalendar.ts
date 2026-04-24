export const DAY_BATCH_SIZE = 5;
const CENTER_INDEX = Math.floor(DAY_BATCH_SIZE / 2);

export type SelectedDateBatchState = {
  selectedDate: Date;
  batchAnchorStart: Date;
};

export type CalendarSelectionTransitionOffsetInput = {
  pressedIndex: number;
  currentSelectedIndex: number | null;
  nextSelectedIndex: number;
  activeCardWidth: number;
  inactiveCardWidth: number;
  gap: number;
};

function getCardCenterPosition(
  index: number,
  selectedIndex: number | null,
  activeCardWidth: number,
  inactiveCardWidth: number,
  gap: number,
): number {
  let leadingOffset = 0;

  for (let currentIndex = 0; currentIndex < index; currentIndex += 1) {
    leadingOffset += currentIndex === selectedIndex ? activeCardWidth : inactiveCardWidth;
    leadingOffset += gap;
  }

  const cardWidth = index === selectedIndex ? activeCardWidth : inactiveCardWidth;

  return leadingOffset + cardWidth / 2;
}

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

export function getSelectedDateBatchState(date: Date): SelectedDateBatchState {
  const selectedDate = startOfDay(date);

  return {
    selectedDate,
    batchAnchorStart: getCenteredBatchStart(selectedDate),
  };
}

export function getCalendarSelectionTransitionOffset(
  input: CalendarSelectionTransitionOffsetInput,
): number {
  const previousCenter = getCardCenterPosition(
    input.pressedIndex,
    input.currentSelectedIndex,
    input.activeCardWidth,
    input.inactiveCardWidth,
    input.gap,
  );
  const nextCenter = getCardCenterPosition(
    input.nextSelectedIndex,
    input.nextSelectedIndex,
    input.activeCardWidth,
    input.inactiveCardWidth,
    input.gap,
  );

  return previousCenter - nextCenter;
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
