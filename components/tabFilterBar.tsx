import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = {
  id: string;
  label: string;
  icon: string;
};

type Props = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
};

export default function TabFilterBar({ tabs, activeTab, onTabChange }: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [pillWidth, setPillWidth] = useState(0);
  const tabPositions = useRef<number[]>([]);

  useEffect(() => {
    const index = tabs.findIndex((t) => t.id === activeTab);
    const x = tabPositions.current[index] ?? 0;
    Animated.spring(slideAnim, {
      toValue: x,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  return (
    <View style={styles.tabContainer}>
      {/* sliding pill rendered behind the tabs */}
      <Animated.View
        style={[
          styles.slidingPill,
          { width: pillWidth, transform: [{ translateX: slideAnim }] },
        ]}
      />

      {/* tabs row */}
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tab}
            onLayout={(e) => {
              tabPositions.current[index] = e.nativeEvent.layout.x;
              // use first tab's width as the pill width
              if (index === 0) setPillWidth(e.nativeEvent.layout.width);
            }}
          >
            <Feather
              name={tab.icon as any}
              size={20}
              color={isActive ? "#CA0DE7" : "#FD89FB"}
            />
            <Text style={isActive ? styles.labelActive : styles.labelInactive}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: "#F5E6FF",
    margin: 12,
    borderRadius: 50,
    position: "relative",
  },
  slidingPill: {
    position: "absolute",
    top: 4,
    bottom: 4,
    backgroundColor: "#ffffffb6",
    borderRadius: 50,
    shadowColor: "#ad9d9d",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
  labelActive: {
    color: "#CA0DE7",
    fontSize: 12,
  },
  labelInactive: {
    color: "#FD89FB",
    fontSize: 12,
  },
});
