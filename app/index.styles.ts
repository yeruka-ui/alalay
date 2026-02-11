import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#850099",
    borderRadius: 24,
    padding: 15,
    paddingTop: 60,
    minHeight: 200,
  },
  purplePanel: {
    backgroundColor: "#E6ADEF",
    borderRadius: 24,
    padding: 20,
    minHeight: 200,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B902D6",
  },
  addTaskText: {
    fontSize: 16,
    color: "#ffffff",
  },
  purpleButton: {
    backgroundColor: "#B902D6",
    borderRadius: 20,
    padding: 10,
  },
  dateCarousel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
  },
  activeCard: {
    backgroundColor: "#B902D6",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    padding: 15,
    width: 90,
    height: 180,
  },
  inactiveCard: {
    backgroundColor: "#FEE8FE",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    padding: 10,
    width: 60,
    height: 150,
  },
  dateNumberActive: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#ffffff",
  },
  dateNumberInactive: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#850099",
  },
  dayNameActive: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  dayNameInactive: {
    fontSize: 14,
    fontWeight: "600",
    color: "#850099",
  },
});
