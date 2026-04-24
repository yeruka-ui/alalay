import DateTimePicker from "@react-native-community/datetimepicker";
import BackgroundCircle from "@/components/BackgroundCircle";
import MascotPlaceholder from "@/components/MascotPlaceholder";
import { styles } from "@/styles/userOnboarding.styles";
import { upsertOnboardingStep } from "@/utils/database";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const MAX_DATE = new Date();
const MIN_DATE = new Date(1900, 0, 1);
const DEFAULT_DATE = new Date(2000, 0, 1);

export default function OnboardingStep2() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(DEFAULT_DATE);
  const [loading, setLoading] = useState(false);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selected) setBirthDate(selected);
    } else {
      if (selected) setTempDate(selected);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (birthDate) {
        await upsertOnboardingStep({
          birth_date: birthDate.toISOString().split("T")[0],
        });
      }
    } finally {
      setLoading(false);
      router.push("/(onboarding)/step3");
    }
  };

  return (
    <View style={styles.screen}>
      <BackgroundCircle
        posX={width * -0.1}
        posY={height * 0.1}
        blurIntensity={25}
        blurTint="light"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progressRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>

        <MascotPlaceholder message={"Nice to meet you! 🎂\nWhen's your birthday?"} />

        <View style={{ marginTop: 32 }}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
            <Text
              style={[
                styles.dateButtonText,
                !birthDate && styles.dateButtonPlaceholder,
              ]}
            >
              {birthDate ? formatDate(birthDate) : "Select your birthday"}
            </Text>
            <Text style={{ fontSize: 18 }}>📅</Text>
          </Pressable>
        </View>

        {/* iOS date picker in a bottom sheet modal */}
        {Platform.OS === "ios" && (
          <Modal visible={showPicker} transparent animationType="slide">
            <Pressable
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.4)",
                justifyContent: "flex-end",
              }}
              onPress={() => setShowPicker(false)}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Pressable onPress={() => setShowPicker(false)}>
                    <Text style={{ color: "#939292", fontSize: 16 }}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setBirthDate(tempDate);
                      setShowPicker(false);
                    }}
                  >
                    <Text
                      style={{ color: "#B902D6", fontSize: 16, fontWeight: "600" }}
                    >
                      Done
                    </Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={MAX_DATE}
                  minimumDate={MIN_DATE}
                />
              </View>
            </Pressable>
          </Modal>
        )}

        {/* Android native picker */}
        {Platform.OS === "android" && showPicker && (
          <DateTimePicker
            value={birthDate ?? DEFAULT_DATE}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={MAX_DATE}
            minimumDate={MIN_DATE}
          />
        )}

        <Pressable
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.nextButtonText}>Continue →</Text>
          )}
        </Pressable>

        <Pressable onPress={handleNext} disabled={loading}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
