import Constants from "expo-constants";
import { Platform, StyleSheet } from "react-native";
import { bold, fs, s } from "@/utils/scale";

export const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#ffffff",
    flex: 1,
  },

  //dashboard styles
  container: {
    backgroundColor: "#850099",
    borderRadius: s(24),
    padding: s(10),
    paddingBottom: s(15),
    paddingTop: s(70),
    minHeight: s(200),
  },
  purplePanel: {
    backgroundColor: "#E6ADEF",
    borderRadius: s(24),
    padding: s(20),
    paddingBottom: s(35),
    minHeight: s(200),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: s(15),
  },
  monthText: {
    fontSize: Platform.OS === "android" ? fs(20) : 28,
    ...bold,
    color: "#B902D6",
  },
  addTaskText: {
    fontSize: Platform.OS === "android" ? fs(13) : 16,
    color: "#ffffff",
  },
  purpleButton: {
    backgroundColor: "#B902D6",
    borderRadius: 50,
    ...Platform.select({
      android: { paddingVertical: s(8), paddingHorizontal: s(12) },
      default: { padding: 15 },
    }),
  },
  dateCarousel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(10),
  },
  dateCarouselContainer: {
    alignSelf: "center",
  },
  activeCard: {
    backgroundColor: "#B902D6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: s(60),
    padding: s(8),
    width: s(90),
    height: s(145),
  },
  inactiveCard: {
    backgroundColor: "#FEE8FE",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: s(50),
    padding: s(10),
    width: s(50),
    height: s(150),
  },
  dateNumberActive: {
    fontSize: fs(50),
    color: "#ffffff",
  },
  dateNumberInactive: {
    fontSize: fs(20),
    color: "#850099",
  },
  dayNameActive: {
    fontSize: fs(13),
    ...bold,
    color: "#ffffff",
  },
  dayNameInactive: {
    fontSize: fs(14),
    ...bold,
    color: "#850099",
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
  },

  // iOS-only: white panel that slides up from the bottom to hold the spinner
  iosPickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingBottom: s(10),
    alignItems: "center",
  },
  // "Done" button inside the iOS picker panel
  doneButton: {
    alignSelf: "flex-end",
    padding: s(16),
    paddingBottom: 0,
  },
  doneButtonText: {
    fontSize: fs(16),
    ...bold,
    color: "#B902D6",
  },

  fetchErrorBanner: {
    backgroundColor: "#FFF5F5",
    borderRadius: s(10),
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
    padding: s(12),
    marginHorizontal: s(16),
    marginBottom: s(8),
  },
  fetchErrorText: {
    color: "#D32F2F",
    fontSize: fs(14),
  },

  //************************* upcoming grouped view ***************************//
  upcomingGroup: {
    marginBottom: s(16),
  },
  upcomingDateHeader: {
    fontSize: fs(13),
    ...bold,
    color: "#850099",
    marginBottom: s(6),
    marginTop: s(4),
  },
  upcomingSection: {
    backgroundColor: "#fcf9fc",
    borderRadius: s(12),
    paddingHorizontal: s(12),
    paddingVertical: s(8),
    marginBottom: s(6),
    boxShadow: "0 4px 16px 4px rgba(185,2,214,0.10)",
  },
  upcomingSectionLabel: {
    fontSize: fs(10),
    color: "#B902D6",
    ...bold,
    marginBottom: s(4),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: s(5),
    borderTopWidth: 1,
    borderTopColor: "#F3E6FF",
  },
  upcomingRowLeft: {
    flex: 1,
  },
  upcomingRowName: {
    fontSize: fs(13),
    ...bold,
    color: "#333",
  },
  upcomingRowSub: {
    fontSize: fs(11),
    color: "#999",
  },
  upcomingRowTime: {
    fontSize: fs(12),
    color: "#850099",
    marginLeft: s(8),
  },

  //************************* appointment card styles *************************//
  apptCard: {
    flexDirection: "row",
    backgroundColor: "#fcf9fc",
    borderRadius: s(16),
    padding: s(16),
    marginBottom: s(12),
    boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.05)",
    borderLeftWidth: 4,
    borderLeftColor: "#B902D6",
  },
  apptLeft: {
    flex: 1,
  },
  apptRight: {
    alignItems: "flex-end",
    gap: s(4),
  },
  apptType: {
    fontSize: fs(11),
    color: "#939292",
    marginBottom: s(4),
  },
  apptTitle: {
    fontSize: fs(15),
    ...bold,
    color: "#850099",
    marginBottom: s(2),
  },
  apptDetail: {
    fontSize: fs(12),
    color: "#555",
  },
  apptNotes: {
    fontSize: fs(11),
    color: "#999",
    marginTop: s(4),
    fontStyle: "italic",
  },
  apptDate: {
    fontSize: fs(11),
    color: "#850099",
    backgroundColor: "#FEE8FE",
    borderRadius: 50,
    paddingHorizontal: s(8),
    paddingVertical: s(3),
    overflow: "hidden",
  },
  apptTime: {
    fontSize: fs(11),
    color: "#555",
  },

  //************************* record locker styles ****************************//
  topPanel: {
    backgroundColor: "#BE01DC",
    borderBottomLeftRadius: s(30),
    borderBottomRightRadius: s(30),
    padding: s(35),
    paddingTop: (Constants.statusBarHeight ?? 0) + s(35),
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
    fontSize: fs(24),
    ...bold,
    color: "#B902D6",
  },
  backButton: {
    width: s(50),
    height: s(50),
    borderRadius: 360,
    backgroundColor: "#F0EEFE",
    alignItems: "center",
    justifyContent: "center",
    margin: s(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backArrow: {
    fontSize: fs(30),
    color: "#B902D6",
  },
  // Search Input for the Record Locker
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: s(24),
    marginHorizontal: s(20),
    paddingHorizontal: s(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  searchIcon: {
    marginRight: s(8),
    color: "#888",
  },
  searchInput: {
    flex: 1,
    paddingVertical: s(10),
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
    width: s(60),
    height: s(60),
    marginRight: s(20),
    alignItems: "center",
    justifyContent: "center",
  },
});
