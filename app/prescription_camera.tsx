import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MedicationCard, {
  type MedicationItem,
} from "../components/MedicationCard";
import { styles as sharedStyles } from "./index.styles";

type ScreenPhase = "capture" | "loading" | "results";

export default function PrescriptionCamera() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [screenPhase, setScreenPhase] = useState<ScreenPhase>("capture");
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("Uploading image...");

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

  const parseMedications = (text: string): MedicationItem[] => {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed) ? parsed : [parsed];

    return arr.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      name: item.name || "Unknown Medication",
      instructions: item.instructions || "",
      time: item.time || "",
      dosage: item.dosage,
    }));
  };

  const uploadToVLM = async (
    uri: string,
    base64Data: string,
    mimeType: string
  ) => {
    setImageUri(uri);
    setScreenPhase("loading");
    setMedications([]);

    try {
      const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) {
        throw new Error(
          "Gemini API key missing in .env (EXPO_PUBLIC_GEMINI_API_KEY)"
        );
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: { mimeType, data: base64Data },
                  },
                  {
                    text: `Analyze this prescription image. Extract each medication into a JSON array.
IMPORTANT: Create a SEPARATE entry for EACH time slot. If a medication is taken 3 times a day, output 3 separate objects with the same name but different times.
Each object must have: "name" (string), "instructions" (string, e.g. "after eating"), "time" (string, e.g. "9:00 AM"), "dosage" (string, e.g. "500mg").
If time is not visible, infer reasonable defaults based on frequency (e.g. once daily: "8:00 AM", twice daily: "8:00 AM" and "8:00 PM", three times daily: "8:00 AM", "1:00 PM", "8:00 PM").
Return ONLY the JSON array, no other text.
Example for "Paracetamol 500mg 3 times a day after eating":
[{"name":"Paracetamol","instructions":"after eating","time":"8:00 AM","dosage":"500mg"},{"name":"Paracetamol","instructions":"after eating","time":"1:00 PM","dosage":"500mg"},{"name":"Paracetamol","instructions":"after eating","time":"8:00 PM","dosage":"500mg"}]`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text ??
        "No text extracted.";

      const items = parseMedications(text);
      setMedications(items);
      setScreenPhase("results");
    } catch (error: any) {
      console.error("VLM Error:", error);
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

  const handleAddToAlalay = () => {
    Alert.alert(
      "Added!",
      "Your medications have been added to Alalay.",
      [{ text: "OK", onPress: () => router.back() }]
    );
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
            onPress={() => router.back()}
          >
            <Text style={sharedStyles.backArrow}>‹</Text>
          </TouchableOpacity>
        </View>

        {screenPhase === "results" ? (
          /* ── Results phase: medication card list ── */
          <>
            <ScrollView
              style={styles.resultsContainer}
              contentContainerStyle={styles.resultsContent}
            >
              {medications.map((med) => (
                <MedicationCard
                  key={med.id}
                  item={med}
                  onEdit={() => {}}
                  onSave={handleUpdateMedication}
                />
              ))}
            </ScrollView>

            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddToAlalay}
              >
                <Text style={styles.bottomButtonText}>Add to Alalay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
              >
                <Text style={styles.bottomButtonText}>Retake photo</Text>
              </TouchableOpacity>
            </View>
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
});
