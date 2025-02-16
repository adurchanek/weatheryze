export const getXAxisInterval = (
  range: string,
  isSmallScreen: boolean,
): number => {
  switch (range) {
    case "1": // 1 Day Range
      return isSmallScreen ? 3 : 2; // 2-hour interval
    case "3": // 3 Day Range
      return isSmallScreen ? 11 : 5; // 5-hour interval
    case "7": // 7 Day Range
      return isSmallScreen ? 23 : 11; // 11-hour interval
    case "14": // 14 Day Range
      return isSmallScreen ? 47 : 23; // 23-hour interval
    default:
      return 1; // Fallback
  }
};

export const getXAxisFontSize = (
  range: string,
  isSmallScreen: boolean,
): number => {
  switch (range) {
    case "1": // 1 Day Range
      return isSmallScreen ? 10 : 12; // 2-hour interval
    case "3": // 3 Day Range
      return isSmallScreen ? 9 : 12; // 5-hour interval
    case "7": // 7 Day Range
      return isSmallScreen ? 8 : 12; // 11-hour interval
    case "14": // 14 Day Range
      return isSmallScreen ? 8 : 12; // 23-hour interval
    default:
      return isSmallScreen ? 10 : 12; // Fallback
  }
};

export const getDotRadius = (range: string, isSmallScreen: boolean): number => {
  switch (range) {
    case "1": // 1 Day Range
      return 4;
    case "3": // 3 Day Range
      return isSmallScreen ? 1.5 : 2.5;
    case "7": // 7 Day Range
    case "14": // 14 Day Range
      return 0; // No radius for larger ranges
    default:
      return 0; // Fallback
  }
};

export function getDayLabelInterval(
  range: string,
  isSmallScreen: boolean,
): number {
  switch (range) {
    case "1":
      return 1;

    case "3":
      return isSmallScreen ? 2 : 4;

    case "7":
      return isSmallScreen ? 1 : 2;

    case "14":
      return 1;

    default:
      return 1;
  }
}
