import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useWindowDimensions, View } from "react-native";

type Props = {
  mx?: number;
  my?: number;
  posX?: number;
  posY?: number;
  translateX?: number;
  translateY?: number;
  scaleX?: number;
  scaleY?: number;
  colors?: [string, string, ...string[]];
  blur?: number;
  blurIntensity?: number;
  blurTint?: "light" | "dark" | "default";
};

export default function BackgroundCircle({
  mx = 1,
  my = 1,
  posX = 0,
  posY = 0,
  translateX,
  translateY,
  scaleX = 1,
  scaleY = 1,
  colors = ["#DD00FF", "#AD00C8"],
  blur = 30,
  blurIntensity,
  blurTint = "light",
}: Props) {
  const { width, height } = useWindowDimensions();

  // Calculate a single consistent size to guarantee it forms a perfect square
  const size = Math.max(width * mx, height * my);

  // If no translation is provided, center it by default based on the provided logic
  const finalTranslateX = translateX ?? (((width - size) / 2) - posX);
  const finalTranslateY = translateY ?? (((height - size) / 2) - posY);

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      <LinearGradient
        colors={colors}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [
            { translateX: finalTranslateX },
            { translateY: finalTranslateY },
            { scaleX },
            { scaleY }
          ],
          // filter: `blur(${blur}px)` might be ignored on Native Android, but won't crash unless it's on an incompatible view.
          // For safe measure:
          ...(blur ? { filter: `blur(${blur}px)` as any } : {}),
        }}
      />

      {blurIntensity != null && (
        <BlurView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          intensity={blurIntensity}
          tint={blurTint}
        />
      )}
    </View>
  );
}
