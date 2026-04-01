import TabFilterBar from "@/components/tabFilterBar";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
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

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        console.log(result.assets[0].uri); // this is the photo's file path
      }
    }
  };

  const openImageLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        console.log(result.assets[0].uri);
      }
    }
  };

  const openDocumentPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      console.log(result.assets[0].uri);
      console.log(result.assets[0].name);
      console.log(result.assets[0].mimeType);
    }
  };

  const openFilePicker = () => {
    Alert.alert("Add Record", "Choose a source", [
      { text: "Photo Library", onPress: () => openImageLibrary() },
      { text: "Files", onPress: () => openDocumentPicker() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

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
                shadowColor: "#0000007d",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                transform: [
                  {
                    translateY: fabAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
                opacity: fabAnimation,
              }}
            >
              <TouchableOpacity style={styles.addButton} onPress={openCamera}>
                <Feather name="camera" size={24} color={"#ffffff"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={openFilePicker}
              >
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
