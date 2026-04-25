import BackgroundCircle from "@/components/BackgroundCircle";
import MascotPlaceholder from "@/components/MascotPlaceholder";
import { styles } from "@/styles/userOnboarding.styles";
import { markOnboardingComplete } from "@/utils/database";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function OnboardingDone() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      await markOnboardingComplete();
    } finally {
      setLoading(false);
      router.replace("/dashboard");
    }
  };

  return (
    <View style={[styles.screen, styles.doneInner]}>
      <BackgroundCircle
        posX={width * 0.5}
        posY={height * -0.1}
        blurIntensity={30}
        blurTint="light"
      />
      <BackgroundCircle
        posX={width * -0.1}
        posY={height * 0.55}
        blurIntensity={25}
        blurTint="light"
      />

      <MascotPlaceholder
        message={
          "You're all set! 🎉 I'm ready to help you manage your medications. Let's go!"
        }
      />

      <Text style={styles.doneTitle}>Welcome to Alalay!</Text>
      <Text style={styles.doneSubtitle}>
        I'll help you keep track of your medicines and make sure you never miss a
        dose.
      </Text>

      <Pressable
        style={[
          styles.nextButton,
          { width: "100%" },
          loading && styles.nextButtonDisabled,
        ]}
        onPress={handleStart}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.nextButtonText}>Let's Go! 🚀</Text>
        )}
      </Pressable>
    </View>
  );
}
