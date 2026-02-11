import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./index.styles";

export default function Index() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedDate, setSelectedDate] = useState(16);

  const scrollToDate = (index: number) => {
    const cardWidth = 100;
    const activeCardWidth = 160;
    const gap = 16;
    const screenWidth = 400;

    let scrollPosition = 0;

    if (index === 2) {
      scrollPosition =
        (cardWidth + gap) * index + activeCardWidth / 2 - screenWidth / 2;
    } else {
      scrollPosition =
        (cardWidth + gap) * index + cardWidth / 2 - screenWidth / 2;
    }

    scrollViewRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  useEffect(() => {
    setTimeout(() => scrollToDate(2), 100);
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.purplePanel}>
          <View style={styles.header}>
            <Text style={styles.monthText}>January 2026</Text>
            <TouchableOpacity style={styles.purpleButton}>
              <Text style={styles.addTaskText}>+ Add Task</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateCarousel}
          >
            {/* Date 14 */}
            <TouchableOpacity
              style={
                selectedDate === 14 ? styles.activeCard : styles.inactiveCard
              }
              onPress={() => {
                setSelectedDate(14);
                scrollToDate(0);
              }}
            >
              <Text
                style={
                  selectedDate === 14
                    ? styles.dateNumberActive
                    : styles.dateNumberInactive
                }
              >
                14
              </Text>
              <Text
                style={
                  selectedDate === 14
                    ? styles.dayNameActive
                    : styles.dayNameInactive
                }
              >
                Wed
              </Text>
            </TouchableOpacity>

            {/* Date 15 */}
            <TouchableOpacity
              style={
                selectedDate === 15 ? styles.activeCard : styles.inactiveCard
              }
              onPress={() => {
                setSelectedDate(15);
                scrollToDate(1);
              }}
            >
              <Text
                style={
                  selectedDate === 15
                    ? styles.dateNumberActive
                    : styles.dateNumberInactive
                }
              >
                15
              </Text>
              <Text
                style={
                  selectedDate === 15
                    ? styles.dayNameActive
                    : styles.dayNameInactive
                }
              >
                Thu
              </Text>
            </TouchableOpacity>

            {/* Date 16 - NOW CONDITIONAL */}
            <TouchableOpacity
              style={
                selectedDate === 16 ? styles.activeCard : styles.inactiveCard
              }
              onPress={() => {
                setSelectedDate(16);
                scrollToDate(2);
              }}
            >
              <Text
                style={
                  selectedDate === 16
                    ? styles.dateNumberActive
                    : styles.dateNumberInactive
                }
              >
                16
              </Text>
              <Text
                style={
                  selectedDate === 16
                    ? styles.dayNameActive
                    : styles.dayNameInactive
                }
              >
                Friday
              </Text>
            </TouchableOpacity>

            {/* Date 17 - FIXED */}
            <TouchableOpacity
              style={
                selectedDate === 17 ? styles.activeCard : styles.inactiveCard
              }
              onPress={() => {
                setSelectedDate(17);
                scrollToDate(3);
              }}
            >
              <Text
                style={
                  selectedDate === 17
                    ? styles.dateNumberActive
                    : styles.dateNumberInactive
                }
              >
                17
              </Text>
              <Text
                style={
                  selectedDate === 17
                    ? styles.dayNameActive
                    : styles.dayNameInactive
                }
              >
                Sat
              </Text>
            </TouchableOpacity>

            {/* Date 18 */}
            <TouchableOpacity
              style={
                selectedDate === 18 ? styles.activeCard : styles.inactiveCard
              }
              onPress={() => {
                setSelectedDate(18);
                scrollToDate(4);
              }}
            >
              <Text
                style={
                  selectedDate === 18
                    ? styles.dateNumberActive
                    : styles.dateNumberInactive
                }
              >
                18
              </Text>
              <Text
                style={
                  selectedDate === 18
                    ? styles.dayNameActive
                    : styles.dayNameInactive
                }
              >
                Sun
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </>
  );
}
