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

export default function OnboardingStep4() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [doctorName, setDoctorName] = useState("");
  const [clinic, setClinic] = useState("");
  const [contact, setContact] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clinicRef = useRef<TextInput>(null);
  const contactRef = useRef<TextInput>(null);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (doctorName.trim() || clinic.trim() || contact.trim()) {
        await upsertOnboardingStep({
          doctor_name: doctorName.trim() || null,
          doctor_clinic: clinic.trim() || null,
          doctor_contact: contact.trim() || null,
        });
      }
    } finally {
      setLoading(false);
      router.push("/(onboarding)/step5");
    }
  };

  return (
    <View style={styles.screen}>
      <BackgroundCircle
        posX={width * 0.75}
        posY={height * 0.08}
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
              <View key={i} style={[styles.dot, i === 3 && styles.dotActive]} />
            ))}
          </View>

          <MascotPlaceholder
            message={
              "Who's your doctor? 🩺\nThis helps me reach out if something comes up!"
            }
          />

          <View style={{ marginTop: 32, gap: 16 }}>
            <View>
              <Text style={styles.inputLabel}>Doctor's Name</Text>
              <TextInput
                style={[styles.textInput, focused === "name" && styles.textInputFocused]}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="e.g. Dr. Jose Reyes"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                maxLength={200}
                returnKeyType="next"
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                onSubmitEditing={() => clinicRef.current?.focus()}
              />
            </View>

            <View>
              <Text style={styles.inputLabel}>Clinic / Hospital</Text>
              <TextInput
                ref={clinicRef}
                style={[styles.textInput, focused === "clinic" && styles.textInputFocused]}
                value={clinic}
                onChangeText={setClinic}
                placeholder="e.g. Makati Medical Center"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                maxLength={200}
                returnKeyType="next"
                onFocus={() => setFocused("clinic")}
                onBlur={() => setFocused(null)}
                onSubmitEditing={() => contactRef.current?.focus()}
              />
            </View>

            <View>
              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                ref={contactRef}
                style={[styles.textInput, focused === "contact" && styles.textInputFocused]}
                value={contact}
                onChangeText={setContact}
                placeholder="e.g. +63 917 123 4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={20}
                returnKeyType="done"
                onFocus={() => setFocused("contact")}
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
              <Text style={styles.nextButtonText}>Continue →</Text>
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
