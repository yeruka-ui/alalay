import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import MedicationCard, {
  type MedicationItem,
} from "../components/MedicationCard";
import { styles as sharedStyles } from "../styles/index.styles";
import { styles } from "../styles/talk_to_alalay.styles";

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

  const parseMedications = (text: string): MedicationItem[] => {
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

  const sendToGemini = async (uri: string) => {
    setPhase("processing");
    try {
      const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!geminiKey) throw new Error("Gemini API key missing in .env");

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: "audio/mp4", data: base64Audio } },
                  {
                    text: `The user has spoken a description of their medication(s). Listen to the audio and extract each medication into a JSON array.
IMPORTANT: Create a SEPARATE entry for EACH time slot. If a medication is taken 3 times a day, output 3 separate objects with the same name but different times.
Each object must have: "name" (string), "instructions" (string, e.g. "after eating"), "time" (string, e.g. "9:00 AM"), "dosage" (string, e.g. "500mg").
If time is not mentioned, infer reasonable defaults based on frequency (once daily: "8:00 AM", twice daily: "8:00 AM" and "8:00 PM", three times daily: "8:00 AM", "1:00 PM", "8:00 PM").
Return ONLY the JSON array, no other text.
Example: [{"name":"Paracetamol","instructions":"after eating","time":"8:00 AM","dosage":"500mg"}]`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Quota limit reached. Wait a minute and try again, or enable billing on your Google AI account.");
        }
        if (response.status === 503) {
          throw new Error("Gemini model is temporarily unavailable. Try again in a moment.");
        }
        const err = await response.text();
        throw new Error(`Gemini error: ${response.status} ${err}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      setMedications(parseMedications(text));
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
        Alert.alert("Permission Required", "Microphone access is needed. Please enable it in Settings.");
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
        const target2 = meterToScale(db * 1.0)  + Math.sin(t * 3.7) * 0.08;
        const target3 = meterToScale(db * 0.85) + Math.sin(t * 1.5) * 0.08;

        scale1.value = withSpring(target1, { damping: 22, stiffness: 280, mass: 0.6 });
        scale2.value = withSpring(target2, { damping: 14, stiffness: 380, mass: 0.4 });
        scale3.value = withSpring(target3, { damping: 30, stiffness: 200, mass: 0.8 });
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setPhase("listening");
    } catch (error: any) {
      console.error("Recording start error:", error);
      Alert.alert("Microphone Error", error.message || "Could not start recording.");
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
    originalName: string
  ) => {
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
    Alert.alert("Added!", "Your medications have been added to Alalay.", [
      { text: "OK", onPress: () => router.back() },
    ]);
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
            onPress={() => router.back()}
          >
            <Text style={sharedStyles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={sharedStyles.record_title}>Talk to Alalay</Text>
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
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.addButton} onPress={handleAddToAlalay}>
                <Text style={styles.bottomButtonText}>Add to Alalay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retakeButton} onPress={handleTryAgain}>
                <Text style={styles.bottomButtonText}>Try again</Text>
              </TouchableOpacity>
            </View>
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
                <TouchableOpacity onPress={handleCirclePress} activeOpacity={0.85}>
                  <View style={styles.circle}>
                    {phase === "idle" ? (
                      <View style={styles.barsRow}>
                        <View style={[styles.idleBar, { height: 55 }]} />
                        <View style={[styles.idleBar, { height: 95 }]} />
                        <View style={[styles.idleBar, { height: 55 }]} />
                      </View>
                    ) : (
                      <View style={styles.barsRow}>
                        <Animated.View style={[styles.listeningBar, bar1Style]} />
                        <Animated.View style={[styles.listeningBar, bar2Style]} />
                        <Animated.View style={[styles.listeningBar, bar3Style]} />
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
