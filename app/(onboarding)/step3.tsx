import BackgroundCircle from "@/components/BackgroundCircle";
import MascotPlaceholder from "@/components/MascotPlaceholder";
import { styles } from "@/styles/userOnboarding.styles";
import { upsertOnboardingStep } from "@/utils/database";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Heart Disease",
  "Kidney Disease",
  "Liver Disease",
  "Thyroid Disorder",
  "Arthritis",
  "COPD",
  "Cancer",
  "Epilepsy",
  "Stroke",
  "Anxiety / Depression",
  "Tuberculosis (TB)",
];

export default function OnboardingStep3() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<string[]>([]);
  const [noneSelected, setNoneSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleCondition = (condition: string) => {
    setNoneSelected(false);
    setSelected((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleNone = () => {
    setSelected([]);
    setNoneSelected((prev) => !prev);
  };

  const canContinue = selected.length > 0 || noneSelected;

  const handleNext = async () => {
    setLoading(true);
    try {
      await upsertOnboardingStep({
        health_conditions: noneSelected ? [] : selected,
      });
    } finally {
      setLoading(false);
      router.push("/(onboarding)/done");
    }
  };

  return (
    <View style={styles.screen}>
      <BackgroundCircle
        posX={width * 0.7}
        posY={height * 0.05}
        blurIntensity={25}
        blurTint="light"
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.progressRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
          ))}
        </View>

        <MascotPlaceholder
          message={
            "Do you have any existing health conditions? 🩺\nThis helps me find your medicines more accurately!"
          }
        />

        <View style={{ marginTop: 24 }}>
          <Text style={styles.inputLabel}>Select all that apply</Text>
          <View style={styles.conditionsGrid}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, selected.includes(c) && styles.chipSelected]}
                onPress={() => toggleCondition(c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected.includes(c) && styles.chipTextSelected,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.chip,
                styles.noneChip,
                noneSelected && styles.chipSelected,
              ]}
              onPress={toggleNone}
            >
              <Text
                style={[styles.chipText, noneSelected && styles.chipTextSelected]}
              >
                None of the above
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[
            styles.nextButton,
            (!canContinue || loading) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!canContinue || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.nextButtonText}>Almost done! →</Text>
          )}
        </Pressable>

        <Pressable onPress={handleNext} disabled={loading}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
