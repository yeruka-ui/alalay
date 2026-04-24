const COLLAPSE_DELTA_THRESHOLD = 24;
const EXPAND_DELTA_THRESHOLD = 16;
const TOP_EXPAND_OFFSET = 20;

type CalendarCollapseStateInput = {
  currentOffsetY: number;
  previousOffsetY: number;
  isCollapsed: boolean;
};

export function getNextCalendarCollapsedState({
  currentOffsetY,
  previousOffsetY,
  isCollapsed,
}: CalendarCollapseStateInput): boolean {
  const currentOffset = Math.max(currentOffsetY, 0);
  const previousOffset = Math.max(previousOffsetY, 0);
  const deltaY = currentOffset - previousOffset;

  if (currentOffset <= TOP_EXPAND_OFFSET) {
    return false;
  }

  if (!isCollapsed && deltaY >= COLLAPSE_DELTA_THRESHOLD) {
    return true;
  }

  if (isCollapsed && deltaY <= -EXPAND_DELTA_THRESHOLD) {
    return false;
  }

  return isCollapsed;
}
