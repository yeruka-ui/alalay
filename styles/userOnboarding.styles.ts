import { StyleSheet } from "react-native";
import { bold, fs, s } from "@/utils/scale";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: s(24),
    paddingBottom: s(48),
  },

  // ── Progress dots ───────────────────────────────────────────
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: s(60),
    marginBottom: s(32),
    gap: s(8),
  },
  dot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: "#E6ADEF",
  },
  dotActive: {
    width: s(24),
    borderRadius: s(4),
    backgroundColor: "#B902D6",
  },

  // ── Inputs ──────────────────────────────────────────────────
  inputLabel: {
    fontSize: fs(14),
    color: "#850099",
    ...bold,
    marginBottom: s(8),
    marginLeft: s(4),
  },
  textInput: {
    height: s(52),
    backgroundColor: "#F5E6FF",
    borderRadius: s(26),
    paddingHorizontal: s(20),
    fontSize: fs(16),
    color: "#333",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: s(4),
  },
  textInputFocused: {
    borderColor: "#B902D6",
    backgroundColor: "#FEE8FE",
  },

  // ── Birthday button ─────────────────────────────────────────
  dateButton: {
    height: s(52),
    backgroundColor: "#F5E6FF",
    borderRadius: s(26),
    paddingHorizontal: s(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonText: {
    fontSize: fs(16),
    color: "#333",
  },
  dateButtonPlaceholder: {
    color: "#9CA3AF",
  },

  // ── Health condition chips ───────────────────────────────────
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(8),
    marginTop: s(4),
  },
  chip: {
    paddingHorizontal: s(16),
    paddingVertical: s(10),
    borderRadius: s(20),
    backgroundColor: "#F5E6FF",
    borderWidth: 1.5,
    borderColor: "#E6ADEF",
  },
  chipSelected: {
    backgroundColor: "#B902D6",
    borderColor: "#B902D6",
  },
  chipText: {
    fontSize: fs(13),
    color: "#850099",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  noneChip: {
    borderStyle: "dashed",
  },

  // ── Drug allergy input row ───────────────────────────────────
  allergyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
    marginBottom: s(8),
  },
  allergyAddBtn: {
    height: s(52),
    paddingHorizontal: s(18),
    backgroundColor: "#B902D6",
    borderRadius: s(26),
    justifyContent: "center",
    alignItems: "center",
  },
  allergyAddBtnText: {
    color: "#ffffff",
    fontSize: fs(14),
    ...bold,
  },

  // ── Buttons ──────────────────────────────────────────────────
  nextButton: {
    height: s(56),
    backgroundColor: "#B902D6",
    borderRadius: s(28),
    justifyContent: "center",
    alignItems: "center",
    marginTop: s(32),
  },
  nextButtonDisabled: {
    opacity: 0.45,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: fs(16),
    ...bold,
  },
  skipText: {
    textAlign: "center",
    color: "#939292",
    fontSize: fs(14),
    marginTop: s(14),
  },

  // ── Done screen ──────────────────────────────────────────────
  doneInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: s(24),
    paddingBottom: s(40),
  },
  doneTitle: {
    fontSize: fs(28),
    ...bold,
    color: "#850099",
    marginTop: s(24),
    marginBottom: s(8),
    textAlign: "center",
  },
  doneSubtitle: {
    fontSize: fs(16),
    color: "#555",
    textAlign: "center",
    lineHeight: fs(24),
    marginBottom: s(40),
  },
});
