import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
    gap: 20,
  },
  circle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#EBC5F4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#490b52bf",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  idleBar: {
    width: 26,
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  listeningBar: {
    width: 26,
    height: 60,
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#B902D6",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaaaaa",
    marginTop: -10,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  retakeButton: {
    flex: 1,
    backgroundColor: "#850099",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
