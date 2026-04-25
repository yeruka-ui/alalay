
type CalendarDayPresentationInput = {
  isCollapsed: boolean;
  isSelected: boolean;
  activeCardWidth: number;
  inactiveCardWidth: number;
  collapsedDaySize: number;
};

type CalendarDayPresentation = {
  width: number;
  height: number;
  borderRadius: number;
  padding: number;
  numberFontSize: number;
  showDayLabel: boolean;
};

export const COLLAPSED_SELECTED_DAY_HEIGHT = 58;

export function getCalendarDayPresentation({
  isCollapsed,
  isSelected,
  activeCardWidth,
  inactiveCardWidth,
  collapsedDaySize,
}: CalendarDayPresentationInput): CalendarDayPresentation {
  if (isCollapsed) {
    if (isSelected) {
      return {
        width: activeCardWidth,
        height: COLLAPSED_SELECTED_DAY_HEIGHT,
        borderRadius: COLLAPSED_SELECTED_DAY_HEIGHT / 2,
        padding: 0,
        numberFontSize: 18,
        showDayLabel: false,
      };
    }

    return {
      width: collapsedDaySize,
      height: collapsedDaySize,
      borderRadius: collapsedDaySize / 2,
      padding: 0,
      numberFontSize: isSelected ? 18 : 16,
      showDayLabel: false,
    };
  }

  return {
    width: isSelected ? activeCardWidth : inactiveCardWidth,
    height: isSelected ? 145 : 150,
    borderRadius: isSelected ? 60 : 50,
    padding: isSelected ? 8 : 10,
    numberFontSize: isSelected ? 50 : 20,
    showDayLabel: true,
  };
}
