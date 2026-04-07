import { Audio } from "expo-av";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { styles as sharedStyles } from "../styles/index.styles";
import { styles } from "../styles/talk_to_alalay.styles";

type Phase = "idle" | "listening";

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
  const hearingRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Shared values live on the UI thread — no bridge crossing on update
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

        // Only re-render when hearing state actually flips
        const hearing = db > -45;
        if (hearing !== hearingRef.current) {
          hearingRef.current = hearing;
          setIsHearing(hearing);
        }

        const t = Date.now() / 1000;
        const target1 = meterToScale(db * 0.75) + Math.sin(t * 2.1) * 0.08;
        const target2 = meterToScale(db * 1.0)  + Math.sin(t * 3.7) * 0.08;
        const target3 = meterToScale(db * 0.85) + Math.sin(t * 1.5) * 0.08;

        // Each bar has different spring physics — runs on UI thread, zero bridge cost
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
        recordingRef.current = null;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error: any) {
      console.error("Recording stop error:", error);
    }

    setPhase("idle");
  };

  const handleCirclePress = async () => {
    if (phase === "idle") await startListening();
    else if (phase === "listening") await stopListening();
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

        <View style={styles.content}>
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
        </View>
      </View>
    </>
  );
}
