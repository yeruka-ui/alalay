import Constants from "expo-constants";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#ffffff",
    flex: 1,
  },

  //dashboard styles
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
    fontFamily: "System",
    fontWeight: "500",
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
    justifyContent: "center",
    gap: 10,
  },
  dateCarouselContainer: {
    alignSelf: "center",
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
    color: "#B902D6",
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

  //************************* record locker styles ****************************//
  topPanel: {
    backgroundColor: "#BE01DC",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 35,
    paddingTop: (Constants.statusBarHeight ?? 0) + 35,
  },
  //Panel for the Back Button and the Record Locker Title
  secondPanel: {
    flexDirection: "row",
    alignItems: "center",
  },
  record_title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#B902D6",
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 360,
    backgroundColor: "#F0EEFE",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backArrow: {
    fontSize: 30,
    color: "#B902D6",
  },
  // Search Input for the Record Locker
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
    color: "#888",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  tabAndAddContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#CA0DE7",
    shadowColor: "#0000007d",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 30,
    width: 60,
    height: 60,
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
