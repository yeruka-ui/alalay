import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./index.styles";

export default function Index() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getMonthName = (monthIndex: number): string => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  const getDayName = (dayIndex: number, short: boolean = true): string => {
    const daysLong = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return short ? daysShort[dayIndex] : daysLong[dayIndex];
  };

  const generateDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const dates = [];

    // Add 2 days from previous month for padding
    dates.push(new Date(year, month, -1)); // second-to-last day of previous month
    dates.push(new Date(year, month, 0)); // last day of previous month

    // Add all days of current month
    const lastDay = new Date(year, month + 1, 0);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }

    // Add 2 days from next month for padding
    dates.push(new Date(year, month + 1, 1));
    dates.push(new Date(year, month + 1, 2));

    return dates;
  };

  const dates = generateDates(selectedDate);

  // Card dimensions from styles
  const CARD_WIDTH = 50;
  const ACTIVE_CARD_WIDTH = 90;
  const GAP = 10;

  const scrollToDate = (index: number) => {
    const screenWidth = Dimensions.get("window").width;
    // Account for container (10) + purplePanel (20) padding on both sides
    const totalHorizontalPadding = (10 + 20) * 2;
    const visibleWidth = screenWidth - totalHorizontalPadding;

    let scrollPosition = 0;

    // Calculate cumulative width up to this card
    for (let i = 0; i < index; i++) {
      scrollPosition += CARD_WIDTH + GAP;
    }

    // Add half of the active card to get to its center
    scrollPosition += ACTIVE_CARD_WIDTH / 2;

    // Subtract half of visible width to center the card
    scrollPosition -= visibleWidth / 2;

    scrollViewRef.current?.scrollTo({
      x: scrollPosition,
      animated: true,
    });
  };

  useEffect(() => {
    const selectedIndex = dates.findIndex(
      (date) =>
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear(),
    );

    setTimeout(
      () => scrollToDate(selectedIndex !== -1 ? selectedIndex : 0),
      100,
    );
  }, [selectedDate]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.purplePanel}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsDropdownOpen(true)}>
              <View style={styles.monthContainer}>
                <Text style={styles.monthText}>
                  {getMonthName(selectedDate.getMonth())}{" "}
                  {selectedDate.getFullYear()}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </View>
            </TouchableOpacity>

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
            {dates.map((date, index) => {
              const isSelected =
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={isSelected ? styles.activeCard : styles.inactiveCard}
                  onPress={() => {
                    setSelectedDate(new Date(date));
                    scrollToDate(index);
                  }}
                >
                  <Text
                    style={
                      isSelected
                        ? styles.dateNumberActive
                        : styles.dateNumberInactive
                    }
                  >
                    {date.getDate()}
                  </Text>
                  <Text
                    style={
                      isSelected ? styles.dayNameActive : styles.dayNameInactive
                    }
                  >
                    {getDayName(date.getDay(), !isSelected)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Month Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => (
              <TouchableOpacity
                key={monthIndex}
                style={styles.dropdownItem}
                onPress={() => {
                  const newDate = new Date(
                    selectedDate.getFullYear(),
                    monthIndex,
                    1,
                  );
                  setSelectedDate(newDate);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>
                  {getMonthName(monthIndex)} {selectedDate.getFullYear()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
