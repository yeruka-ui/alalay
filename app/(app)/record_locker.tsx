import TabFilterBar from "@/components/tabFilterBar";
import type { MedicalRecord } from "@/types/database";
import {
  getMedicalRecords,
  saveMedicalRecord,
  uploadFile,
} from "@/utils/database";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "@/styles/index.styles";

export default function RecordLocker() {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = [
    { id: "all", label: "All", icon: "file-text" },
    { id: "ids", label: "IDs", icon: "file-text" },
    { id: "prescriptions", label: "Rx", icon: "file-text" },
    { id: "lab_results", label: "Results", icon: "file-text" },
  ];
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;

  const tabToRecordType: Record<string, string | undefined> = {
    all: undefined,
    ids: "medical_id",
    prescriptions: "prescription",
    lab_results: "lab_result",
  };

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMedicalRecords(tabToRecordType[activeTab]);
      setRecords(data);
    } catch {
      // User may not be logged in
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const saveFileAsRecord = async (
    uri: string,
    fileName: string,
    recordType:
      | "prescription"
      | "lab_result"
      | "medical_id"
      | "other" = "other",
  ) => {
    try {
      const fileUrl = await uploadFile("medical-records", uri, fileName);
      await saveMedicalRecord(recordType, fileUrl, fileName);
      Alert.alert("Saved!", "Record has been added.");
      fetchRecords();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save record.");
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        saveFileAsRecord(uri, "photo.jpg");
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
        const uri = result.assets[0].uri;
        saveFileAsRecord(uri, "image.jpg");
      }
    }
  };

  const openDocumentPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      saveFileAsRecord(asset.uri, asset.name ?? "document");
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
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
        {/* Records List */}
        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#B902D6" />
          </View>
        ) : records.length > 0 ? (
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {records.map((record) => (
              <View
                key={record.id}
                style={{
                  backgroundColor: "#FFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Feather
                  name={
                    record.record_type === "prescription"
                      ? "file-text"
                      : record.record_type === "medical_id"
                        ? "credit-card"
                        : "clipboard"
                  }
                  size={22}
                  color="#B902D6"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "600", color: "#333" }}
                  >
                    {record.title ?? "Untitled Record"}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                    {record.record_type.replace("_", " ")} ·{" "}
                    {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "#999", fontSize: 15 }}>No records yet</Text>
          </View>
        )}

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
