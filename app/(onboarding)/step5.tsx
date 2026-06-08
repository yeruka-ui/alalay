import BackgroundCircle from "@/components/BackgroundCircle";
import MascotPlaceholder from "@/components/MascotPlaceholder";
import { styles } from "@/styles/userOnboarding.styles";
import { upsertOnboardingStep } from "@/utils/database";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

const RELATIONS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Relative",
  "Friend",
  "Caregiver",
];

export default function OnboardingStep5() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phoneRef = useRef<TextInput>(null);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (name.trim() || relation.trim() || phone.trim()) {
        await upsertOnboardingStep({
          emergency_name: name.trim() || null,
          emergency_relation: relation.trim() || null,
          emergency_phone: phone.trim() || null,
        });
      }
    } finally {
      setLoading(false);
      router.push("/(onboarding)/done");
    }
  };

  return (
    <View style={styles.screen}>
      <BackgroundCircle
        posX={width * -0.1}
        posY={height * 0.12}
        blurIntensity={25}
        blurTint="light"
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.dot, i === 4 && styles.dotActive]} />
            ))}
          </View>

          <MascotPlaceholder
            message={
              "Almost there! 💜\nWho should I contact in an emergency?"
            }
          />

          <View style={{ marginTop: 32, gap: 16 }}>
            <View>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={[styles.textInput, focused === "name" && styles.textInputFocused]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Ana Santos"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                maxLength={200}
                returnKeyType="next"
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>

            {/* Relationship quick-select chips */}
            <View>
              <Text style={styles.inputLabel}>Relationship</Text>
              <View style={[styles.conditionsGrid, { marginTop: 4 }]}>
                {RELATIONS.map((r) => (
                  <Pressable
                    key={r}
                    style={[styles.chip, relation === r && styles.chipSelected]}
                    onPress={() => setRelation((prev) => (prev === r ? "" : r))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        relation === r && styles.chipTextSelected,
                      ]}
                    >
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                ref={phoneRef}
                style={[styles.textInput, focused === "phone" && styles.textInputFocused]}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +63 917 123 4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={20}
                returnKeyType="done"
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
                onSubmitEditing={handleNext}
              />
            </View>
          </View>

          <Pressable
            style={[styles.nextButton, loading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.nextButtonText}>Finish Setup 🎉</Text>
            )}
          </Pressable>

          <Pressable onPress={handleNext} disabled={loading}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
