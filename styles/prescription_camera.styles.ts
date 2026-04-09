import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: "#850099",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  previewArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#B902D6",
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: "#999999",
  },
  previewImage: {
    width: "90%",
    height: "80%",
    borderRadius: 16,
    resizeMode: "contain",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  uploadingText: {
    color: "#B902D6",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  uploadingHint: {
    color: "#999999",
    fontSize: 13,
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 50,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
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
