import { router } from "expo-router";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/alalay_chat.styles";
import { styles as sharedStyles } from "../styles/index.styles";

export default function AlalayChat() {
  const [text, onChangeText] = React.useState("");

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
              onPress={() => router.navigate("/dashboard")}
            >
              <Text style={sharedStyles.backArrow}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*Located here is the Chat Panel: Consists of the chat messages and input field*/}
        <SafeAreaProvider>
          <SafeAreaView>
            <TextInput
              style={styles.chatPanel}
              onChangeText={onChangeText}
              value={text}
              placeholder="Start chatting"
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </View>
    </>
  );
}
