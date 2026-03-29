import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./index.styles";

export default function RecordLocker() {
  return (
    <>
      <View style={styles.topPanel}></View>

      <View style={styles.secondPanel}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.record_title}>Record Locker</Text>
      </View>
    </>
  );
}
