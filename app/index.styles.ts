import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#850099",
    borderRadius: 24,
    padding: 10,
    paddingBottom: 15,
    paddingTop: 70,
    minHeight: 200,
  },
  purplePanel: {
    backgroundColor: "#E6ADEF",
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
  monthText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#B902D6",
  },
  addTaskText: {
    fontSize: 16,
    color: "#ffffff",
  },
  purpleButton: {
    backgroundColor: "#B902D6",
    borderRadius: 50,
    padding: 15,
  },
  dateCarousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activeCard: {
    backgroundColor: "#B902D6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    padding: 8,
    width: 90,
    height: 145,
  },
  inactiveCard: {
    backgroundColor: "#FEE8FE",
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
    color: "#850099",
  },
  dayNameActive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
  dayNameInactive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#850099",
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dropdownArrow: {
    fontSize: 16,
    color: "#B902D6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    width: "80%",
    maxHeight: "70%",
    flexDirection: "row", // Two columns side-by-side
    gap: 16,
  },
  // Single column picker for sequential month/year selection
  dropdownMenuSingle: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  // Title for the picker ("Select Month" or "Select Year")
  pickerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B902D6",
    textAlign: "center",
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E6ADEF",
    marginBottom: 12,
  },
  // Container for back button and title (no border, let pickerTitle handle it)
  pickerTitleContainer: {
    marginBottom: 0,
  },
  // Back button to return to previous step
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  // Back button text style
  backButtonText: {
    fontSize: 16,
    color: "#B902D6",
    fontWeight: "600",
  },
  // Individual column for month or year picker
  pickerColumn: {
    flex: 1, // Each column takes equal width
  },
  // Header text for "Month" and "Year"
  pickerHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B902D6",
    textAlign: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#E6ADEF",
    marginBottom: 8,
  },
  // Scrollable area for each column
  pickerScroll: {
    maxHeight: "100%",
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E6ADEF",
  },
  // Highlight style for selected month/year
  selectedItem: {
    backgroundColor: "#E6ADEF",
  },
  dropdownItemText: {
    fontSize: 18,
    color: "#850099",
    textAlign: "center",
  },
  // Text style for selected month/year
  selectedItemText: {
    fontWeight: "bold",
    color: "#B902D6",
  },
});
