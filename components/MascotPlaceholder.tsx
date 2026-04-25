import { StyleSheet, Text, View } from "react-native";

type Props = {
  message: string;
};

// Placeholder mascot — replace circle + emoji with actual mascot image later
export default function MascotPlaceholder({ message }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.face}>( ˶ˆ꒳ˆ˵ )</Text>
        <Text style={styles.label}>Alalay</Text>
      </View>
      <View style={styles.connector} />
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E6ADEF",
    borderWidth: 3,
    borderColor: "#B902D6",
    justifyContent: "center",
    alignItems: "center",
  },
  face: {
    fontSize: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#850099",
    marginTop: 2,
  },
  connector: {
    width: 2,
    height: 12,
    backgroundColor: "#E6ADEF",
  },
  bubble: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E6ADEF",
    padding: 16,
    shadowColor: "#B902D6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "center",
  },
});
