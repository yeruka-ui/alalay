import { Dimensions, PixelRatio, Platform, type TextStyle } from "react-native";

const BASE_WIDTH = 390; // iPhone 14 logical width — the Android scaling baseline
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ratio = SCREEN_WIDTH / BASE_WIDTH;

/**
 * Scale a layout dimension for Android only.
 * On iOS the original value is returned unchanged so the iOS design is untouched.
 *
 * s(90) on iOS          → 90  (no change)
 * s(90) on Android 412px → 95  (scales up proportionally)
 * s(90) on Android 360px → 83  (scales down on smaller phones)
 */
export const s = (size: number): number => {
  if (Platform.OS !== "android") return size;
  return Math.round(PixelRatio.roundToNearestPixel(size * ratio));
};

/**
 * Scale a font size for Android only.
 * On iOS the original value is returned unchanged.
 *
 * On Android two things inflate text vs iOS:
 *   1. Screen width ratio (our intentional scaling)
 *   2. System font scale — the user's "Text size" accessibility setting,
 *      applied automatically by Android but ignored by iOS.
 * We divide by fontScale to cancel out (2), then apply a gentle width ratio
 * (capped at 1.1×) for (1).
 */
export const fs = (size: number): number => {
  if (Platform.OS !== "android") return size;
  const fontScale = PixelRatio.getFontScale();
  const adjusted = (size * Math.min(ratio, 1.1)) / fontScale - 2;
  return Math.round(PixelRatio.roundToNearestPixel(adjusted));
};

export const bold: TextStyle =
  Platform.OS === "android"
    ? { fontFamily: "Inter_800ExtraBold" }
    : { fontWeight: "bold" };
