import BackgroundCircle from "@/components/BackgroundCircle";
import { styles as loginStyles } from "@/styles/login.styles";
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
    StyleSheet,
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
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        agreed &&
        !loading;

    useEffect(() => {
        console.log("[NAV] signup mount:", Date.now());
    }, []);

    const handleSignup = async () => {
        if (!canSubmit) return;
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError(null);
        const { error: signupError } = await signUpWithEmail(email, password, fullName, role);
        setLoading(false);
        if (signupError) {
            setError(signupError.message);
        }
    };

    return (


        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>


            <KeyboardAvoidingView
                style={loginStyles.screen}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={loginStyles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <BackgroundCircle
                        posX={width * 0}
                        posY={height * -0.07}
                        blur={10}
                    />
                    <Text style={loginStyles.title}>Create Account</Text>

                    {error && (
                        <View style={[loginStyles.errorBanner]}>
                            <Text style={loginStyles.errorText}>{error}</Text>
                        </View>
                    )}

                    <Text style={loginStyles.label}>Full Name</Text>
                    <TextInput
                        style={[signupStyles.input, fullNameFocused && loginStyles.inputFocused]}
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

                    <Text style={loginStyles.label}>Email</Text>
                    <TextInput
                        style={[signupStyles.input, emailFocused && loginStyles.inputFocused]}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                        textContentType="emailAddress"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={loginStyles.label}>Password</Text>
                    <TextInput
                        style={[signupStyles.input, passwordFocused && loginStyles.inputFocused]}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password-new"
                        textContentType="newPassword"
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                    />

                    {/* <Text style={loginStyles.label}>Confirm Password</Text> */}
                    <TextInput
                        style={[signupStyles.input, confirmPasswordFocused && loginStyles.inputFocused]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoComplete="password-new"
                        textContentType="newPassword"
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        placeholder="Confirm Password"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={loginStyles.label}>Signing Up as</Text>
                    <Pressable
                        style={[signupStyles.input, { justifyContent: 'center' }, isRoleDropdownOpen && loginStyles.inputFocused]}
                        onPress={() => setIsRoleDropdownOpen(true)}
                    >
                        <Text style={{ color: role ? "#333" : "#9CA3AF", fontSize: 16 }}>
                            {role || "Select Role"}
                        </Text>
                    </Pressable>

                    <Modal visible={isRoleDropdownOpen} transparent animationType="fade">
                        <Pressable style={signupStyles.modalOverlay} onPress={() => setIsRoleDropdownOpen(false)}>
                            <View style={signupStyles.dropdownContainer}>
                                <Text style={signupStyles.dropdownTitle}>Select Role</Text>

                                <Pressable
                                    style={[signupStyles.dropdownOption, role === "Guardian" && signupStyles.dropdownOptionSelected]}
                                    onPress={() => { setRole("Guardian"); setIsRoleDropdownOpen(false); }}
                                >
                                    <Text style={[signupStyles.dropdownOptionText, role === "Guardian" && signupStyles.dropdownOptionTextSelected]}>Guardian</Text>
                                </Pressable>

                                <View style={signupStyles.dropdownDivider} />

                                <Pressable
                                    style={[signupStyles.dropdownOption, role === "Patient" && signupStyles.dropdownOptionSelected]}
                                    onPress={() => { setRole("Patient"); setIsRoleDropdownOpen(false); }}
                                >
                                    <Text style={[signupStyles.dropdownOptionText, role === "Patient" && signupStyles.dropdownOptionTextSelected]}>Patient</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Modal>

                    <Pressable
                        style={signupStyles.checkboxContainer}
                        onPress={() => setAgreed(!agreed)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: agreed }}
                    >
                        <Text style={signupStyles.checkboxText}>
                            By clicking Create Account, You agree to the <Text style={signupStyles.checkboxTextBold}>Terms & Conditions</Text> and <Text style={signupStyles.checkboxTextBold}>Privacy Policy</Text>
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            loginStyles.primaryButton,
                            !canSubmit && loginStyles.primaryButtonDisabled,
                        ]}
                        onPress={handleSignup}
                        disabled={!canSubmit}
                        accessibilityRole="button"
                    >
                        {loading ? (
                            <ActivityIndicator color="#DD00FF" />
                        ) : (
                            <Text style={loginStyles.primaryButtonText}>Create Account</Text>
                        )}
                    </Pressable>

                    <Pressable
                        style={signupStyles.signInButton}
                        onPress={() => router.push("/(auth)/login")}
                        accessibilityRole="button"
                    >
                        <Text style={loginStyles.signUpText}>
                            Already have an account? <Text style={loginStyles.signUpTextBold}>Sign In</Text>
                        </Text>
                    </Pressable>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const signupStyles = StyleSheet.create({
    input: {
        height: 52,
        backgroundColor: "#F0F0F0",
        borderRadius: 26,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#333",
        marginBottom: 16,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        // justifyContent: "center",
        marginBottom: 24,
        marginTop: 8,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        marginRight: 10,
        justifyContent: "center",
        alignItems: "center",

    },
    checkboxChecked: {
        backgroundColor: "#ffffff",
    },
    checkboxInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#DD00FF",
    },
    checkboxText: {
        color: "#ffffff",
        fontSize: 12,
        flex: 1,
        textAlign: "center"
    },
    checkboxTextBold: {
        fontWeight: "700",
    },
    signInButton: {
        height: 52,
        borderWidth: 1,
        borderColor: "transparent", // Dark purple border matching the screenshot closely
        backgroundColor: "transparent",
        borderRadius: 26,
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    dropdownContainer: {
        width: "80%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
        textAlign: "center",
    },
    dropdownOption: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    dropdownOptionSelected: {
        backgroundColor: "rgba(142, 2, 184, 0.1)",
    },
    dropdownOptionText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },
    dropdownOptionTextSelected: {
        color: "#8E02B8",
        fontWeight: "bold",
    },
    dropdownDivider: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 4,
    }
});
