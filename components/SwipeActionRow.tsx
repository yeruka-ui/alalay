import { Feather } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

type Props = {
  children: React.ReactNode;
  onTake: () => void;
  onEdit: () => void;
  status?: "pending" | "taken";
};

export default function SwipeActionRow({ children, onTake, onEdit, status }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const handleLeftOpen = () => {
    if (onEdit) {
      onEdit();
    }
    swipeableRef.current?.close();
  };

  const handleRightOpen = () => {
    if (status === "pending" && onTake) {
      onTake();
    }
    swipeableRef.current?.close();
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.rightAction}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Feather name="edit-2" size={24} color="#FFF" />
          <Text style={styles.actionText}>Edit</Text>
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.leftAction}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Text style={styles.actionText}>Take</Text>
          <Feather name="check" size={24} color="#FFF" />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={status === "pending" ? renderRightActions : undefined}
      onSwipeableLeftOpen={handleLeftOpen}
      onSwipeableRightOpen={status === "pending" ? handleRightOpen : undefined}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "flex-end",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  rightAction: {
    flex: 1,
    backgroundColor: "#B902D6",
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
