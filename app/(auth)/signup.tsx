import BackgroundCircle from "@/components/BackgroundCircle";
import { styles } from "@/styles/onboard.styles";
import { signUpWithEmail } from "@/utils/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    useWindowDimensions,
    View
} from "react-native";

export default function Signup() {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Focus states
    const [fullNameFocused, setFullNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

    // Dropdown state
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const canSubmit =
        fullName.trim().length >= 2 &&
        EMAIL_REGEX.test(email) &&
        password.length >= 8 &&
        password === confirmPassword &&
        role.length > 0 &&
        !loading;

    useEffect(() => {
        console.log("[NAV] signup mount:", Date.now());
    }, []);

    const handleSignup = async () => {
        if (!canSubmit) return;
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);
        setFormError(null);
        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            return;
        }
        setLoading(true);
        const { data, error: signupError } = await signUpWithEmail(email, password, fullName, role);
        setLoading(false);
        if (signupError) {
            const msg = signupError.message.toLowerCase();
            if (msg.includes("already registered") || msg.includes("already in use")) {
                setEmailError("An account with this email already exists.");
            } else if (msg.includes("password")) {
                setPasswordError("Password does not meet requirements.");
            } else {
                setFormError("Something went wrong. Please try again.");
            }
            return;
        }
        if (!data?.session) {
            router.replace({ pathname: "/(auth)/login", params: { successMessage: "Check your email to confirm your account." } });
        }
        // session exists → root guard redirects to /dashboard
    };

    return (


        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>


            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <BackgroundCircle
                        posX={width * 0}
                        posY={height * -0.07}
                        blur={10}
                    />
                    <Text style={styles.authTitle}>Create Account</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={[styles.signupInput, fullNameFocused && styles.inputFocused]}
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        autoComplete="name"
                        textContentType="name"
                        onFocus={() => setFullNameFocused(true)}
                        onBlur={() => setFullNameFocused(false)}
                        placeholder="Full Name"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.signupInput, emailFocused && styles.inputFocused, !!emailError && styles.inputError]}
                        value={email}
                        onChangeText={(v) => { setEmail(v); setEmailError(null); }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        textContentType="emailAddress"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                    />
                    {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={[styles.signupInput, passwordFocused && styles.inputFocused, !!passwordError && styles.inputError]}
                        value={password}
                        onChangeText={(v) => { setPassword(v); setPasswordError(null); }}
                        secureTextEntry
                        autoComplete="password-new"
                        textContentType="newPassword"
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                    />
                    {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}

                    {/* <Text style={styles.label}>Confirm Password</Text> */}
                    <TextInput
                        style={[styles.signupInput, confirmPasswordFocused && styles.inputFocused, !!confirmPasswordError && styles.inputError]}
                        value={confirmPassword}
                        onChangeText={(v) => { setConfirmPassword(v); setConfirmPasswordError(null); }}
                        secureTextEntry
                        autoComplete="password-new"
                        textContentType="newPassword"
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        placeholder="Confirm Password"
                        placeholderTextColor="#9CA3AF"
                    />
                    {!!confirmPasswordError && <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>}

                    <Text style={styles.label}>Signing Up as</Text>
                    <Pressable
                        style={[styles.signupInput, { justifyContent: 'center' }, isRoleDropdownOpen && styles.inputFocused]}
                        onPress={() => setIsRoleDropdownOpen(true)}
                    >
                        <Text style={{ color: role ? "#333" : "#9CA3AF", fontSize: 16 }}>
                            {role || "Select Role"}
                        </Text>
                    </Pressable>

                    <Modal visible={isRoleDropdownOpen} transparent animationType="fade">
                        <Pressable style={styles.modalOverlay} onPress={() => setIsRoleDropdownOpen(false)}>
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownTitle}>Select Role</Text>

                                <Pressable
                                    style={[styles.dropdownOption, role === "Guardian" && styles.dropdownOptionSelected]}
                                    onPress={() => { setRole("Guardian"); setIsRoleDropdownOpen(false); }}
                                >
                                    <Text style={[styles.dropdownOptionText, role === "Guardian" && styles.dropdownOptionTextSelected]}>Guardian</Text>
                                </Pressable>

                                <View style={styles.dropdownDivider} />

                                <Pressable
                                    style={[styles.dropdownOption, role === "Patient" && styles.dropdownOptionSelected]}
                                    onPress={() => { setRole("Patient"); setIsRoleDropdownOpen(false); }}
                                >
                                    <Text style={[styles.dropdownOptionText, role === "Patient" && styles.dropdownOptionTextSelected]}>Patient</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Modal>

                    <View
                        style={styles.checkboxContainer}
                        accessibilityRole="checkbox"
                    >
                        <Text style={styles.checkboxText}>
                            By clicking Create Account, You agree to the <Text style={styles.checkboxTextBold}>Terms & Conditions</Text> and <Text style={styles.checkboxTextBold}>Privacy Policy</Text>
                        </Text>
                    </View>

                    {!!formError && <Text style={[styles.fieldErrorText, { textAlign: "center" }]}>{formError}</Text>}

                    <Pressable
                        style={[
                            styles.authButton,
                            !canSubmit && styles.authButtonDisabled,
                        ]}
                        onPress={handleSignup}
                        disabled={!canSubmit}
                        accessibilityRole="button"
                    >
                        {loading ? (
                            <ActivityIndicator color="#DD00FF" />
                        ) : (
                            <Text style={styles.authButtonText}>Create Account</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={styles.signInButton}
                        onPress={() => router.push("/(auth)/login")}
                        accessibilityRole="button"
                    >
                        <Text style={styles.signUpText}>
                            Already have an account? <Text style={styles.signUpTextBold}>Sign In</Text>
                        </Text>
                    </Pressable>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
