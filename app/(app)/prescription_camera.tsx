import MedicationCard, {
  type MedicationItem,
} from "@/components/MedicationCard";
import { styles as sharedStyles } from "@/styles/index.styles";
import { analyzePrescription } from "@/utils/ai";
import { savePrescription, uploadFile } from "@/utils/database";
import { validateMedicationName } from "@/utils/medicationValidator";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ScreenPhase = "capture" | "loading" | "results";

export default function PrescriptionCamera() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>("capture");
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("Uploading image...");
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualDraft, setManualDraft] = useState({ name: "", dosage: "", instructions: "", time: "" });

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isLoading = screenPhase === "loading";

  // Cycle through status messages while loading
  useEffect(() => {
    if (!isLoading) {
      setStatusMessage("Uploading image...");
      return;
    }

    const messages = [
      "Uploading image...",
      "Analyzing prescription...",
      "Running OCR model...",
      "Extracting text...",
      "Almost there...",
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setStatusMessage(messages[index]);
    }, 3000);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      clearInterval(interval);
      pulse.stop();
    };
  }, [isLoading]);

  const uploadToVLM = async (
    uri: string,
    base64Data: string,
    mimeType: string
  ) => {
    setImageUri(uri);
    setScreenPhase("loading");
    setMedications([]);

    try {
      const items = await analyzePrescription(base64Data, mimeType);
      const validated = items.map((item) => ({
        ...item,
        suggestion: validateMedicationName(item.name),
      }));
      setMedications(validated);
      setScreenPhase("results");
    } catch (error: any) {
      console.error("[prescription_camera] analyzePrescription failed:", error?.message ?? error);
      Alert.alert("Upload Error", error.message || "Something went wrong.");
      setScreenPhase("capture");
    }
  };

  const handleImagePickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("Error", "Failed to read image data.");
        return;
      }
      const mime =
        asset.mimeType ||
        (asset.uri.endsWith(".png") ? "image/png" : "image/jpeg");
      uploadToVLM(asset.uri, asset.base64, mime);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take a photo of your prescription."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    handleImagePickerResult(result);
  };

  const importFromPhotos = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to import a prescription image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    handleImagePickerResult(result);
  };

  const handleUpdateMedication = (updated: MedicationItem, applyToAll: boolean, originalName: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === updated.id) return updated;
        if (applyToAll && m.name === originalName) {
          return { ...m, name: updated.name, dosage: updated.dosage, instructions: updated.instructions };
        }
        return m;
      })
    );
  };

  const handleAcceptSuggestion = (id: string, suggestedName: string) => {
    setMedications((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      const originalName = target.name;
      return prev.map((m) => {
        if (m.name === originalName) {
          return { ...m, name: suggestedName, suggestion: null };
        }
        return m;
      });
    });
  };

  const handleDismissSuggestion = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, suggestion: null } : m))
    );
  };

  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleAddToAlalay = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Upload prescription image if available
      let uploadedImagePath: string | undefined;
      if (imageUri) {
        try {
          uploadedImagePath = await uploadFile("prescriptions", imageUri, "prescription.jpg");
        } catch {
          // Continue without image upload — medications still get saved
        }
      }

      await savePrescription(medications, uploadedImagePath, undefined, "camera", startDate);

      Alert.alert("Added!", "Your medications have been saved to Alalay.", [
        { text: "OK", onPress: () => router.navigate("/dashboard") },
      ]);
    } catch (error: any) {
      Alert.alert("Save Error", error.message || "Failed to save medications.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualAdd = () => {
    const { name, time } = manualDraft;
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a medication name.");
      return;
    }
    const newItem: MedicationItem = {
      id: `${Date.now()}-manual`,
      name: name.trim(),
      dosage: manualDraft.dosage.trim() || undefined,
      instructions: manualDraft.instructions.trim(),
      time: time.trim() || "8:00 AM",
      confidence: "high",
      suggestion: validateMedicationName(name.trim()),
    };
    setMedications((prev) => [...prev, newItem]);
    setManualDraft({ name: "", dosage: "", instructions: "", time: "" });
    setManualModalVisible(false);
  };

  const handleRetake = () => {
    setMedications([]);
    setImageUri(null);
    setScreenPhase("capture");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={sharedStyles.screen}>
        {/* Purple header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={sharedStyles.backButton}
            onPress={() => router.navigate("/dashboard")}
          >
            <Text style={sharedStyles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        {screenPhase === "results" ? (
          /* ── Results phase: medication card list ── */
          <>
            {medications.filter((m) => m.confidence === "low").length > 0 && (
              <View style={styles.reviewNotice}>
                <Text style={styles.reviewNoticeText}>
                  ⚠ {medications.filter((m) => m.confidence === "low").length} medication(s) need review
                </Text>
              </View>
            )}
            <ScrollView
              style={styles.resultsContainer}
              contentContainerStyle={styles.resultsContent}
            >
              {medications.map((med) => (
                <MedicationCard
                  key={med.id}
                  item={med}
                  onEdit={() => { }}
                  onSave={handleUpdateMedication}
                  onAcceptSuggestion={handleAcceptSuggestion}
                  onDismissSuggestion={handleDismissSuggestion}
                />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.startDateRow}
              onPress={() => setDatePickerOpen(true)}
            >
              <Feather name="calendar" size={14} color="#850099" style={{ marginRight: 6 }} />
              <Text style={styles.startDateLabel}>Start date: </Text>
              <Text style={styles.startDateValue}>
                {startDate.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.addButton, isSaving && styles.disabledButton]}
                onPress={handleAddToAlalay}
                disabled={isSaving}
              >
                <Text style={styles.bottomButtonText}>
                  {isSaving ? "Saving..." : "Add to Alalay"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
              >
                <Text style={styles.bottomButtonText}>Retake photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => setManualModalVisible(true)}
              >
                <Text style={styles.bottomButtonText}>+ Add manually</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === "ios" && datePickerOpen && (
              <Modal
                visible={datePickerOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setDatePickerOpen(false)}
              >
                <View style={styles.iosPickerContainer}>
                  <TouchableOpacity
                    onPress={() => setDatePickerOpen(false)}
                    style={styles.iosPickerDoneBtn}
                  >
                    <Text style={styles.iosPickerDoneText}>Done</Text>
                  </TouchableOpacity>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="spinner"
                    onChange={(_: DateTimePickerEvent, date?: Date) => {
                      if (date) setStartDate(date);
                    }}
                  />
                </View>
              </Modal>
            )}

            {Platform.OS === "android" && datePickerOpen && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  setDatePickerOpen(false);
                  if (event.type !== "dismissed" && date) setStartDate(date);
                }}
              />
            )}

            <Modal
              visible={manualModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setManualModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalPopup}>
                  <Text style={styles.modalTitle}>Add Medication</Text>

                  <Text style={styles.modalLabel}>Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={manualDraft.name}
                    onChangeText={(t) => setManualDraft({ ...manualDraft, name: t })}
                    placeholder="Medication name"
                  />

                  <Text style={styles.modalLabel}>Dosage</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={manualDraft.dosage}
                    onChangeText={(t) => setManualDraft({ ...manualDraft, dosage: t })}
                    placeholder="e.g. 500mg"
                  />

                  <Text style={styles.modalLabel}>Instructions</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={manualDraft.instructions}
                    onChangeText={(t) => setManualDraft({ ...manualDraft, instructions: t })}
                    placeholder="e.g. after eating"
                  />

                  <Text style={styles.modalLabel}>Time</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={manualDraft.time}
                    onChangeText={(t) => setManualDraft({ ...manualDraft, time: t })}
                    placeholder="e.g. 8:00 AM"
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => {
                        setManualDraft({ name: "", dosage: "", instructions: "", time: "" });
                        setManualModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalSaveBtn} onPress={handleManualAdd}>
                      <Text style={styles.modalSaveText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          /* ── Capture / Loading phase ── */
          <>
            <View style={styles.previewArea}>
              {imageUri ? (
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.previewImage}
                  />
                  {isLoading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#B902D6" />
                      <Animated.Text
                        style={[
                          styles.uploadingText,
                          { opacity: pulseAnim },
                        ]}
                      >
                        {statusMessage}
                      </Animated.Text>
                      <Text style={styles.uploadingHint}>
                        Processing via cloud API...
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Text style={styles.placeholderTitle}>No image selected</Text>
                  <Text style={styles.placeholderSubtitle}>
                    start by clicking a button below
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={takePhoto}
                disabled={isLoading}
              >
                <Feather
                  name="camera"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={importFromPhotos}
                disabled={isLoading}
              >
                <Feather
                  name="image"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionButtonText}>Upload Prescription</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: "#850099",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  previewArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#B902D6",
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: "#999999",
  },
  previewImage: {
    width: "90%",
    height: "80%",
    borderRadius: 16,
    resizeMode: "contain",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  uploadingText: {
    color: "#B902D6",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  uploadingHint: {
    color: "#999999",
    fontSize: 13,
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Results phase styles
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  retakeButton: {
    flex: 1,
    backgroundColor: "#850099",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewNotice: {
    backgroundColor: "#FFF0F0",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  reviewNoticeText: {
    color: "#CC4444",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  manualButton: {
    flex: 1,
    backgroundColor: "#555",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 24,
  },
  modalPopup: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%" as const,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#850099",
    marginBottom: 20,
    textAlign: "center" as const,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#939292",
    marginBottom: 4,
    marginTop: 10,
  },
  modalInput: {
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E6ADEF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fcf9fc",
  },
  modalButtons: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#FEE8FE",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  modalCancelText: {
    color: "#850099",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  modalSaveText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  startDateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  startDateLabel: {
    fontSize: 13,
    color: "#666",
  },
  startDateValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#850099",
  },
  iosPickerContainer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
  },
  iosPickerDoneBtn: {
    alignSelf: "flex-end" as const,
    padding: 16,
  },
  iosPickerDoneText: {
    color: "#B902D6",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
