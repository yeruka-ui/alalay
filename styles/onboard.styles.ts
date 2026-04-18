import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 60,
    },
    topSection: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 48,
        fontWeight: "900",
        color: "#ffffff",
        textShadowColor: "rgba(255, 255, 255, 0.8)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        elevation: 5,
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
    },
    subtitle: {
        color: "#c300e1",
        fontSize: 14,
        marginBottom: 16,
    },
    primaryButton: {
        width: "100%",
        backgroundColor: "#c300e1",
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "500",
    },
    secondaryButton: {
        width: "100%",
        backgroundColor: "transparent",
        borderColor: "#c300e1",
        borderWidth: 1,
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#c300e1",
        fontSize: 16,
        fontWeight: "500",
    },
});
