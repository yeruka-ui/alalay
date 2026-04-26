import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type ActionItem = {
  id: string;
  icon: string;
  onPress: () => void;
};

type Props = {
  actions?: ActionItem[];
};

export default function FloatingActionMenu({ actions }: Props) {
  const router = useRouter();
  const isOpenRef = useRef(false);

  const defaultActions: ActionItem[] = [
    {
      id: "camera",
      icon: "camera",
      onPress: () => router.navigate("/prescription_camera"),
    },
    {
      id: "document",
      icon: "file-text",
      onPress: () => router.navigate("/record_locker"),
    },
    {
      id: "mic",
      icon: "mic",
      onPress: () => router.navigate("/talk_to_alalay"),
    },
  ];

  const activeActions = actions || defaultActions;

  const [overlayActive, setOverlayActive] = useState(false);

  // Single animation value drives everything
  const progress = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number) => {
    progress.stopAnimation();
    Animated.timing(progress, {
      toValue,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const openMenu = () => {
    isOpenRef.current = true;
    setOverlayActive(true);
    animateTo(1);
  };

  const closeMenu = () => {
    isOpenRef.current = false;
    setOverlayActive(false);
    animateTo(0);
  };

  const toggleMenu = () => {
    if (isOpenRef.current) closeMenu();
    else openMenu();
  };

  // Main button rotation
  const mainRotation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  // Position offsets for the three action buttons
  // Based on the reference image layout:
  // - Mic: top-right (above main button)
  // - Document: middle-left (left and above main button)
  // - Camera: bottom-left (left of main button)
  const buttonPositions = [
    { translateX: -80, translateY: -30 }, // camera — bottom-left
    { translateX: 0, translateY: -80 }, // document — middle-left
    { translateX: 80, translateY: -30 }, // mic — top-right area
  ];

  return (
    <>
      {/* Blurred overlay when menu is open */}
      <TouchableWithoutFeedback onPress={closeMenu}>
        <Animated.View
          pointerEvents={overlayActive ? "auto" : "none"}
          style={[styles.overlay, { opacity: progress }]}
        >
          <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableWithoutFeedback>

      <View style={styles.container} pointerEvents="box-none">
        {/* Action buttons */}
        {activeActions.map((action, index) => {
          const { translateX, translateY } = buttonPositions[index] || {
            translateX: 0,
            translateY: -(index + 1) * 70,
          };

          const animatedTranslateX = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, translateX],
          });
          const animatedTranslateY = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, translateY],
          });
          const scale = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          });
          const opacity = progress.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
          });

          return (
            <Animated.View
              key={action.id}
              style={[
                styles.actionButton,
                {
                  transform: [
                    { translateX: animatedTranslateX },
                    { translateY: animatedTranslateY },
                    { scale },
                  ],
                  opacity,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionTouchable}
                onPress={() => {
                  action.onPress();
                  closeMenu();
                }}
                activeOpacity={0.7}
              >
                <Feather name={action.icon as any} size={24} color="#B902D6" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main hamburger/close button */}
        <Animated.View style={{ transform: [{ rotate: mainRotation }] }}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <Feather
              name={overlayActive ? "x" : "menu"}
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
  container: {
    // position: "absolute",
    bottom: 30,
    right: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    // height: 30,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#B902D6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B902D6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    position: "absolute",
  },
  actionTouchable: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE8FE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E6ADEF",
    shadowColor: "#B902D6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
