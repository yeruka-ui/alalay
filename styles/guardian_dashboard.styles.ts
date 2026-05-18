import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#ffffff",
    flex: 1,
  },

  // Guardian dashboard styles (Teal/Blue theme)
  container: {
    backgroundColor: "#006064", // Deep Teal
    borderRadius: 24,
    padding: 10,
    paddingBottom: 15,
    paddingTop: 70,
    minHeight: 200,
  },
  tealPanel: {
    backgroundColor: "#B2EBF2", // Light Teal
    borderRadius: 24,
    padding: 20,
    paddingBottom: 35,
    minHeight: 200,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 15,
  },
  patientNameText: {
    fontSize: 24,
    fontFamily: "System",
    fontWeight: "700",
    color: "#00838F",
  },
  subHeaderText: {
    fontSize: 14,
    color: "#006064",
    marginBottom: 4,
  },
  monthText: {
    fontSize: 20,
    fontFamily: "System",
    fontWeight: "500",
    color: "#0097A7",
    marginTop: 10,
  },
  contactButton: {
    backgroundColor: "#0097A7",
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
  },
  dateCarousel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dateCarouselContainer: {
    alignSelf: "center",
    marginTop: 10,
  },
  activeCard: {
    backgroundColor: "#0097A7",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    padding: 8,
    width: 90,
    height: 145,
  },
  inactiveCard: {
    backgroundColor: "#E0F7FA",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    padding: 10,
    width: 50,
    height: 150,
  },
  dateNumberActive: {
    fontSize: 50,
    color: "#ffffff",
  },
  dateNumberInactive: {
    fontSize: 20,
    color: "#006064",
  },
  dayNameActive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  dayNameInactive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#006064",
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#0097A7",
  },
  
  // Adherence Summary
  adherenceContainer: {
    backgroundColor: "#E0F7FA",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adherenceStat: {
    alignItems: "center",
  },
  adherenceLabel: {
    fontSize: 12,
    color: "#006064",
    marginBottom: 4,
  },
  adherenceValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#00838F",
  },
  
  // iOS-only: white panel that slides up from the bottom to hold the spinner
  iosPickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  // "Done" button inside the iOS picker panel
  doneButton: {
    alignSelf: "flex-end",
    padding: 16,
    paddingBottom: 0,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0097A7",
  },

  fetchErrorBanner: {
    backgroundColor: "#FFF5F5",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  fetchErrorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#00838F",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
});
