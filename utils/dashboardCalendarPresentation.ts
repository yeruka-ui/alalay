type CalendarDayPresentationInput = {
  isCollapsed: boolean;
  isSelected: boolean;
  activeCardWidth: number;
  inactiveCardWidth: number;
};

type CalendarDayPresentation = {
  width: number;
  height: number;
  borderRadius: number;
  padding: number;
  numberFontSize: number;
  showDayLabel: boolean;
};

const COLLAPSED_DAY_SIZE = 40;

export function getCalendarDayPresentation({
  isCollapsed,
  isSelected,
  activeCardWidth,
  inactiveCardWidth,
}: CalendarDayPresentationInput): CalendarDayPresentation {
  if (isCollapsed) {
    return {
      width: COLLAPSED_DAY_SIZE,
      height: COLLAPSED_DAY_SIZE,
      borderRadius: COLLAPSED_DAY_SIZE / 2,
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
