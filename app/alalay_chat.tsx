import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/alalay_chat.styles";
import { styles as sharedStyles } from "../styles/index.styles";

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
        {/*Located here is the Top Panel: Consists of the back button and purple panel*/}
        <View>
          <View style={sharedStyles.topPanel}></View>

          <View style={sharedStyles.secondPanel}>
            <TouchableOpacity
              style={sharedStyles.backButton}
              onPress={() => router.back()}
            >
              <Text style={sharedStyles.backArrow}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*Located here is the Chat Panel: Consists of the chat messages and input field*/}
        <View>
          <View style={styles.chatPanel}></View>
        </View>
      </View>
    </>
  );
}
