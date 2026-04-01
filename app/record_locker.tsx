import TabFilterBar from "@/components/tabFilterBar";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "../styles/index.styles";

export default function RecordLocker() {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { id: "all", label: "All", icon: "file-text" },
    { id: "ids", label: "IDs", icon: "file-text" },
    { id: "prescriptions", label: "Rx", icon: "file-text" },
    { id: "lab_results", label: "Results", icon: "file-text" },
  ];
  const [isFabOpen, setIsFabOpen] = useState(false); // State to track FAB open/close
  const fabAnimation = useRef(new Animated.Value(0)).current; // Animation value for FAB

  useEffect(() => {
    Animated.spring(fabAnimation, {
      toValue: isFabOpen ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [isFabOpen]);

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "space-between",
        }}
      >
        <View>
          <View style={styles.topPanel}></View>

          <View style={styles.secondPanel}>
            <TouchableOpacity style={styles.backButton}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.record_title}>Records</Text>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={18} style={styles.searchIcon} />
            <TextInput
              placeholderTextColor="#888"
              style={styles.searchInput}
              placeholder="Search"
            />
          </View>
        </View>
        <View style={styles.tabAndAddContainer}>
          <View style={{ flex: 1 }}>
            {/* This is the container for the TabFilterBar */}
            <TabFilterBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            ></TabFilterBar>
          </View>
          <View style={{ position: "relative" }}>
            <Animated.View
              style={{
                position: "absolute",
                bottom: 70,
                right: 0,
                alignItems: "center",
                gap: 12,
                transform: [
                  {
                    translateY: fabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
                opacity: fabAnimation,
              }}
            >
              <TouchableOpacity style={styles.addButton}>
                <Feather name="camera" size={24} color={"#ffffff"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
                <Feather name="file-text" size={24} color={"#ffffff"} />
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsFabOpen(!isFabOpen)}
            >
              <Feather
                name={isFabOpen ? "x" : "plus"}
                size={24}
                color={"#ffffff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
