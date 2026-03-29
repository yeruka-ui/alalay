import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  // tabs = the array from index.tsx
  // activeTab = "pending" (or whatever is selected)
  // onTabChange = setActiveTab function from index.tsx

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={isActive ? styles.activeTab : styles.inactiveTab}
          >
            <Feather name={tab.icon as any} size={20} />
            <Text>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  activeTab: {
    alignItems: "center",
    backgroundColor: "#E6ADEF",
    borderRadius: 20,
    padding: 10,
  },
  inactiveTab: {
    alignItems: "center",
    padding: 10,
  },
});
