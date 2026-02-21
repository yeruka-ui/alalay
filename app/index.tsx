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

// Try to import liquid-glass, but provide fallback if not available
let LiquidGlassView: any = View;
let isLiquidGlassSupported = false;
try {
  const liquidGlass = require("@callstack/liquid-glass");
  LiquidGlassView = liquidGlass.LiquidGlassView;
  isLiquidGlassSupported = liquidGlass.isLiquidGlassSupported;
} catch (e) {
  console.log("Liquid Glass not available, using fallback");
}

export default function Index() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Track which picker step: 'month' or 'year'
  const [pickerStep, setPickerStep] = useState<"month" | "year">("month");
  // Store temporary month selection before year is picked
  const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth());

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
        <LiquidGlassView
          style={[
            styles.purplePanel,
            !isLiquidGlassSupported && {
              backgroundColor: "rgba(230, 173, 239, 0.9)",
            },
          ]}
          interactive
          effect="clear"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setIsDropdownOpen(true);
                setPickerStep("month"); // Reset to month picker when opening
                setTempMonth(new Date().getMonth()); // Default to current month
              }}
            >
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
        </LiquidGlassView>
      </View>

      {/* Month & Year Picker Modal */}
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
          <View style={styles.dropdownMenuSingle}>
            {/* Step 1: Month Picker */}
            {pickerStep === "month" && (
              <>
                <Text style={styles.pickerTitle}>Select Month</Text>
                <ScrollView style={styles.pickerScroll}>
                  {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => (
                    <TouchableOpacity
                      key={monthIndex}
                      style={[
                        styles.dropdownItem,
                        // Highlight currently selected month
                        tempMonth === monthIndex && styles.selectedItem,
                      ]}
                      onPress={() => {
                        // Store selected month and move to year picker
                        setTempMonth(monthIndex);
                        setPickerStep("year");
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          tempMonth === monthIndex && styles.selectedItemText,
                        ]}
                      >
                        {getMonthName(monthIndex)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Step 2: Year Picker */}
            {pickerStep === "year" && (
              <>
                <View style={styles.pickerTitleContainer}>
                  {/* Back button to return to month picker */}
                  <TouchableOpacity
                    onPress={() => setPickerStep("month")}
                    style={styles.backButton}
                  >
                    <Text style={styles.backButtonText}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerTitle}>
                    Select Year for {getMonthName(tempMonth)}
                  </Text>
                </View>
                <ScrollView style={styles.pickerScroll}>
                  {/* Generate years from 2020 to 2030 */}
                  {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.dropdownItem,
                        // Highlight currently selected year
                        selectedDate.getFullYear() === year &&
                          styles.selectedItem,
                      ]}
                      onPress={() => {
                        // Apply both month and year, then close
                        const newDate = new Date(year, tempMonth, 1);
                        setSelectedDate(newDate);
                        setIsDropdownOpen(false);
                        setPickerStep("month"); // Reset for next time
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedDate.getFullYear() === year &&
                            styles.selectedItemText,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
