import { Audio } from "expo-av";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system/legacy";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import MedicationCard, {
  type MedicationItem,
} from "@/components/MedicationCard";
import { analyzeAudio } from "@/utils/ai";
import { styles as sharedStyles } from "@/styles/index.styles";
import { styles } from "@/styles/talk_to_alalay.styles";
import { savePrescription } from "@/utils/database";

type Phase = "idle" | "listening" | "processing" | "results";

const MIN_SCALE = 0.3;
const MAX_SCALE = 1.2;
const METERING_MIN = -60;
const METERING_MAX = -10;

function meterToScale(db: number): number {
  const clamped = Math.max(METERING_MIN, Math.min(METERING_MAX, db));
  const ratio = (clamped - METERING_MIN) / (METERING_MAX - METERING_MIN);
  return MIN_SCALE + ratio * (MAX_SCALE - MIN_SCALE);
}

export default function TalkToAlalay() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [isHearing, setIsHearing] = useState(false);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hearingRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const scale1 = useSharedValue(MIN_SCALE);
  const scale2 = useSharedValue(MIN_SCALE);
  const scale3 = useSharedValue(MIN_SCALE);

  const bar1Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale1.value }],
  }));
  const bar2Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale2.value }],
  }));
  const bar3Style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale3.value }],
  }));

  const resetBars = () => {
    const cfg = { damping: 18, stiffness: 180 };
    scale1.value = withSpring(MIN_SCALE, cfg);
    scale2.value = withSpring(MIN_SCALE, cfg);
    scale3.value = withSpring(MIN_SCALE, cfg);
  };

  const sendToGemini = async (uri: string) => {
    setPhase("processing");
    try {
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const medications = await analyzeAudio(base64Audio, "audio/mp4");
      setMedications(medications);
      setPhase("results");
    } catch (error: any) {
      console.error("Gemini error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
      setPhase("idle");
    }
  };

  const startListening = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Microphone access is needed. Please enable it in Settings.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });

      recording.setProgressUpdateInterval(50);
      recording.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording || status.metering === undefined) return;
        const db = status.metering;

        const hearing = db > -45;
        if (hearing !== hearingRef.current) {
          hearingRef.current = hearing;
          setIsHearing(hearing);
        }

        const t = Date.now() / 1000;
        const target1 = meterToScale(db * 0.75) + Math.sin(t * 2.1) * 0.08;
        const target2 = meterToScale(db * 1.0) + Math.sin(t * 3.7) * 0.08;
        const target3 = meterToScale(db * 0.85) + Math.sin(t * 1.5) * 0.08;

        scale1.value = withSpring(target1, {
          damping: 22,
          stiffness: 280,
          mass: 0.6,
        });
        scale2.value = withSpring(target2, {
          damping: 14,
          stiffness: 380,
          mass: 0.4,
        });
        scale3.value = withSpring(target3, {
          damping: 30,
          stiffness: 200,
          mass: 0.8,
        });
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setPhase("listening");
    } catch (error: any) {
      console.error("Recording start error:", error);
      Alert.alert(
        "Microphone Error",
        error.message || "Could not start recording.",
      );
    }
  };

  const stopListening = async () => {
    resetBars();
    hearingRef.current = false;
    setIsHearing(false);

    try {
      const recording = recordingRef.current;
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recordingRef.current = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        if (uri) {
          sendToGemini(uri);
          return;
        }
      }
    } catch (error: any) {
      console.error("Recording stop error:", error);
    }

    setPhase("idle");
  };

  const handleCirclePress = async () => {
    if (phase === "idle") await startListening();
    else if (phase === "listening") await stopListening();
  };

  const handleUpdateMedication = (
    updated: MedicationItem,
    applyToAll: boolean,
    originalName: string,
  ) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === updated.id) return updated;
        if (applyToAll && m.name === originalName) {
          return {
            ...m,
            name: updated.name,
            dosage: updated.dosage,
            instructions: updated.instructions,
          };
        }
        return m;
      }),
    );
  };

  const handleAddToAlalay = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await savePrescription(medications, undefined, undefined, "manual", startDate);
      Alert.alert("Added!", "Your medications have been saved to Alalay.", [
        { text: "OK", onPress: () => router.navigate("/dashboard") },
      ]);
    } catch (error: any) {
      Alert.alert("Save Error", error.message || "Failed to save medications.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAgain = () => {
    setMedications([]);
    setPhase("idle");
  };

  useEffect(() => {
    return () => {
      recordingRef.current?.stopAndUnloadAsync();
    };
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={sharedStyles.topPanel} />

        <View style={sharedStyles.secondPanel}>
          <TouchableOpacity
            style={sharedStyles.backButton}
            onPress={() => router.navigate("/dashboard")}
          >
            <Text style={sharedStyles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={sharedStyles.record_title} pointerEvents="none">Talk to Alalay</Text>
        </View>

        {phase === "results" ? (
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
                style={[styles.addButton, isSaving && { opacity: 0.6 }]}
                onPress={handleAddToAlalay}
                disabled={isSaving}
              >
                <Text style={styles.bottomButtonText}>{isSaving ? "Saving..." : "Add to Alalay"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleTryAgain}
              >
                <Text style={styles.bottomButtonText}>Try again</Text>
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
          </>
        ) : (
          <View style={styles.content}>
            {phase === "processing" ? (
              <>
                <View style={styles.circle}>
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
                <Text style={styles.title}>Processing...</Text>
                <Text style={styles.subtitle}>Alalay is listening</Text>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleCirclePress}
                  activeOpacity={0.85}
                >
                  <View style={styles.circle}>
                    {phase === "idle" ? (
                      <View style={styles.barsRow}>
                        <View style={[styles.idleBar, { height: 55 }]} />
                        <View style={[styles.idleBar, { height: 95 }]} />
                        <View style={[styles.idleBar, { height: 55 }]} />
                      </View>
                    ) : (
                      <View style={styles.barsRow}>
                        <Animated.View
                          style={[styles.listeningBar, bar1Style]}
                        />
                        <Animated.View
                          style={[styles.listeningBar, bar2Style]}
                        />
                        <Animated.View
                          style={[styles.listeningBar, bar3Style]}
                        />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.title}>
                  {phase === "idle" ? "Talk to Alalay" : "Listening"}
                </Text>
                <Text style={styles.subtitle}>
                  {phase === "idle"
                    ? "Whenever you're ready"
                    : isHearing
                      ? "Hearing you..."
                      : "Tap to stop"}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    </>
  );
}
