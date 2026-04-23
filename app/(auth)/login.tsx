import BackgroundCircle from "@/components/BackgroundCircle";
import { styles } from "@/styles/onboard.styles";
import {
  getRememberedIdentifier,
  saveRememberedIdentifier,
  signInWithEmail,
} from "@/utils/auth";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const { successMessage } = useLocalSearchParams<{ successMessage?: string }>();
  const [visibleSuccessMessage, setVisibleSuccessMessage] = useState<string | undefined>(
    successMessage as string | undefined
  );
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotInfo, setForgotInfo] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    if (!visibleSuccessMessage) return;
    const timer = setTimeout(() => setVisibleSuccessMessage(undefined), 10000);
    return () => clearTimeout(timer);
  }, [visibleSuccessMessage]);

  useEffect(() => {
    getRememberedIdentifier().then((saved) => {
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    });
  }, []);

  const emailValid = EMAIL_REGEX.test(email);
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && passwordValid && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    const { error: authError } = await signInWithEmail(email, password);

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    await saveRememberedIdentifier(rememberMe ? email : null);
    setLoading(false);
  }

  async function handleForgotPassword() {
    setForgotInfo(null);
    setError("");
    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email before requesting a reset.");
      return;
    }
    setForgotLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: "alalay://auth/reset-password" }
    );
    setForgotLoading(false);
    if (resetError) {
      setError("Could not send reset email. Try again later.");
      return;
    }
    setForgotInfo("Password reset email sent. Check your inbox.");
  }


  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BackgroundCircle
            posX={width * 0}
            posY={height * -0.25}
            blurIntensity={30}
            blurTint="light"
          />
          <Text style={styles.authTitle}>Sign in</Text>

          {!!visibleSuccessMessage && (
            <View style={styles.successBanner} accessibilityRole="alert">
              <Text style={styles.successText}>{visibleSuccessMessage}</Text>
            </View>
          )}
          {!!forgotInfo && (
            <View style={styles.successBanner} accessibilityRole="alert">
              <Text style={styles.successText}>{forgotInfo}</Text>
            </View>
          )}
          {!!error && (
            <View
              style={styles.errorBanner}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* <Text style={styles.label}>Email</Text> */}
          <TextInput
            style={[styles.authInput, emailFocused && styles.inputFocused]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            accessibilityLabel="Email"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
          />

          {/* <Text style={styles.label}>Password</Text> */}
          <View
            style={[
              styles.passwordRow,
              passwordFocused && styles.passwordRowFocused,
            ]}
          >
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              accessibilityLabel="Password"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
            />
            <Pressable
              style={styles.eyeToggle}
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          </View>

          <Pressable
            style={[
              styles.authButton,
              !canSubmit && styles.authButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            {loading ? (
              <ActivityIndicator color="#DD00FF" />
            ) : (
              <Text style={styles.authButtonText}>Sign in</Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleForgotPassword}
            disabled={forgotLoading}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
          >
            <Text style={[styles.forgotText, forgotLoading && { opacity: 0.5 }]}>
              {forgotLoading ? "Sending…" : "Forgot Password?"}
            </Text>
          </Pressable>

          <Text style={styles.dividerText}>Or</Text>

          <Pressable
            style={styles.googleButton}
            onPress={() => console.log("Google sign-in stub")}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            style={styles.appleButton}
            onPress={() => console.log("Apple sign-in stub")}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </Pressable>

          <Pressable
            style={styles.signUpRow}
            onPress={() => {
              console.log("[NAV] login→signup press:", Date.now());
              try { router.push("/(auth)/signup"); } catch { console.log("Sign up stub"); }
            }}
          >
            <Text style={styles.signUpText}>{"Don't have an account? "}<Text style={styles.signUpTextBold}>Sign Up</Text></Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
