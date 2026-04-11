import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/index.styles";

export default function AlalayChat() {
  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          justifyContent: "space-between",
        }}
      >
        <View>
          <View style={styles.topPanel}></View>

          <View style={styles.secondPanel}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
