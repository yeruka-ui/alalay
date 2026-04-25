import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },

  // ── Progress dots ───────────────────────────────────────────
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E6ADEF",
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: "#B902D6",
  },

  // ── Inputs ──────────────────────────────────────────────────
  inputLabel: {
    fontSize: 14,
    color: "#850099",
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    height: 52,
    backgroundColor: "#F5E6FF",
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 4,
  },
  textInputFocused: {
    borderColor: "#B902D6",
    backgroundColor: "#FEE8FE",
  },

  // ── Birthday button ─────────────────────────────────────────
  dateButton: {
    height: 52,
    backgroundColor: "#F5E6FF",
    borderRadius: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dateButtonPlaceholder: {
    color: "#9CA3AF",
  },

  // ── Health condition chips ───────────────────────────────────
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5E6FF",
    borderWidth: 1.5,
    borderColor: "#E6ADEF",
  },
  chipSelected: {
    backgroundColor: "#B902D6",
    borderColor: "#B902D6",
  },
  chipText: {
    fontSize: 13,
    color: "#850099",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  noneChip: {
    borderStyle: "dashed",
  },

  // ── Buttons ──────────────────────────────────────────────────
  nextButton: {
    height: 56,
    backgroundColor: "#B902D6",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  nextButtonDisabled: {
    opacity: 0.45,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipText: {
    textAlign: "center",
    color: "#939292",
    fontSize: 14,
    marginTop: 14,
  },

  // ── Done screen ──────────────────────────────────────────────
  doneInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#850099",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  doneSubtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
});
