import BackgroundCircle from "@/components/BackgroundCircle";
import { styles } from "@/styles/onboard.styles";
import { useRouter } from "expo-router";
import {
    Pressable,
    Text,
    useWindowDimensions,
    View
} from "react-native";

export default function Onboard() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();

    return (
        <View style={styles.screen}>
            {/* The background circle is massive and mostly positioned to envelope the top half */}
            <BackgroundCircle
                posX={width * 0}
                posY={height * 0.6}
                scaleX={0.7}
                scaleY={1.4}
                blur={30}
                colors={["#c300e1", "#DD00FF"]}
            />

            <View style={styles.contentContainer}>

                <View style={styles.topSection}>
                    <Text style={styles.title}>Alalay</Text>
                </View>

                <View style={styles.bottomSection}>
                    <Text style={styles.subtitle}>Pag may Alalay, mas mahaba ang buhay.</Text>

                    <Pressable
                        style={styles.primaryButton}
                        onPress={() => router.push("/(auth)/login")}
                        accessibilityRole="button"
                    >
                        <Text style={styles.primaryButtonText}>Sign in</Text>
                    </Pressable>

                    <Pressable
                        style={styles.secondaryButton}
                        onPress={() => router.push("/(auth)/signup")}
                        accessibilityRole="button"
                    >
                        <Text style={styles.secondaryButtonText}>Create Account</Text>
                    </Pressable>
                </View>

            </View>
        </View>
    );
}
