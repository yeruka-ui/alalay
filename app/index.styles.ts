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

  // record locker styles
  topPanel: {
    backgroundColor: "#BE01DC",
    borderRadius: 30,
    padding: 35,
  },
  secondPanel: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
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
});
