import { Dimensions } from "react-native";
const { height, width } = Dimensions.get("window");

const COLLAPSE_DELTA_THRESHOLD = 16;
const TOP_EXPAND_OFFSET = (height / 2) - 16;

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

  return isCollapsed;
}
