import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 32,
    paddingVertical: 50,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 40,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    backgroundColor: "#ffffff",
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  inputFocused: {
    backgroundColor: "#ffffff",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 26,
    marginBottom: 20,
    height: 52,
  },
  passwordRowFocused: {
    backgroundColor: "#ffffff",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
  },
  eyeToggle: {
    paddingHorizontal: 16,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    height: 52,
    backgroundColor: "#ffffff",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#DD00FF",
    fontSize: 16,
  },
  forgotText: {
    fontSize: 15,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  dividerText: {
    fontSize: 15,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 24,
  },
  googleButton: {
    height: 52,
    backgroundColor: "#EBEBEB",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  googleButtonText: {
    fontSize: 15,
    color: "#B902D6",
  },
  appleButton: {
    height: 52,
    backgroundColor: "#EBEBEB",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  appleButtonText: {
    fontSize: 15,
    color: "#B902D6",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 15,
    color: "#ffffff",
  },
  signUpTextBold: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  errorBanner: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
});
