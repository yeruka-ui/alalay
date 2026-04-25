import BackgroundCircle from "@/components/BackgroundCircle";
import MascotPlaceholder from "@/components/MascotPlaceholder";
import { styles } from "@/styles/userOnboarding.styles";
import { upsertOnboardingStep } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function OnboardingStep1() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [name, setName] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data?.user?.user_metadata;
      if (meta?.full_name) setName(meta.full_name);
    });
  }, []);

  const canContinue = name.trim().length >= 2;

  const handleNext = async () => {
    if (!canContinue) return;
    setLoading(true);
    try {
      await upsertOnboardingStep({ full_name: name.trim() });
    } finally {
      setLoading(false);
      router.push("/(onboarding)/step2");
    }
  };

  return (
    <View style={styles.screen}>
      <BackgroundCircle
        posX={width * 0.6}
        posY={height * -0.05}
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
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
            ))}
          </View>

          <MascotPlaceholder message={"Hi! I'm Alalay. 👋\nWhat should I call you?"} />

          <View style={{ marginTop: 32 }}>
            <Text style={styles.inputLabel}>Your Full Name</Text>
            <TextInput
              style={[styles.textInput, nameFocused && styles.textInputFocused]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Maria Santos"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>

          <Pressable
            style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!canContinue || loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.nextButtonText}>Continue →</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
