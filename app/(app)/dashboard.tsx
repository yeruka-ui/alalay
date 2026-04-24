import FloatingActionMenu from "@/components/floatingActionMenu";
import MedicationCard from "@/components/MedicationCard";
import TabFilterBar from "@/components/tabFilterBar";
import { styles } from "@/styles/index.styles";
import type { Medication, MedicationSchedule } from "@/types/database";
import {
  DAY_BATCH_SIZE,
  createDateBatch,
  getBatchStartForOffset,
  getCenteredBatchStart,
  isSameDay,
  startOfDay,
} from "@/utils/dashboardCalendar";
import { getActiveMedications, getSchedulesForDate, updateScheduleStatus } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Carousel, { type ICarouselInstance } from "react-native-reanimated-carousel";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const CALENDAR_PADDING = 60;
const CALENDAR_GAP = 8;
const ACTIVE_WIDTH_BONUS = 28;
const PAGE_BUFFER = 120;
const CENTER_PAGE_INDEX = PAGE_BUFFER;

export default function Dashboard() {
  // **************************** CALENDAR LOGIC ****************************
  const initialSelectedDate = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [batchAnchorStart, setBatchAnchorStart] = useState(() =>
    getCenteredBatchStart(initialSelectedDate),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const carouselRef = useRef<ICarouselInstance>(null);
  const shouldResetCarouselRef = useRef(false);
  const pageOffsets = useMemo(
    () => Array.from({ length: PAGE_BUFFER * 2 + 1 }, (_, index) => index - PAGE_BUFFER),
    [],
  );

  // **************************** TAB FILTER LOGIC ****************************
  // Variable to track active and inactive tabs
  const [activeTab, setActiveTab] = useState("pending");
  const tabs = [
    { id: "pending", label: "Pending", icon: "bell" },
    { id: "medication", label: "Medication", icon: "plus-square" },
    { id: "appointments", label: "Appointments", icon: "alert-circle" },
    { id: "completed", label: "Completed", icon: "check" },
  ];

  // **************************** DATA FETCHING ****************************
  const [schedules, setSchedules] = useState<(MedicationSchedule & { medication: Medication })[]>([]);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const [schedulesData, medsData] = await Promise.all([
        getSchedulesForDate(selectedDate),
        getActiveMedications(),
      ]);
      setSchedules(schedulesData);
      setAllMedications(medsData);
    } catch (err) {
      const isAuthError =
        err instanceof Error &&
        (err.message.includes("Not authenticated") ||
          err.message.includes("JWT"));
      setFetchError(
        isAuthError
          ? "Your session expired. Please log in again."
          : "Could not load data. Pull to retry."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter data based on active tab
  const filteredSchedules = schedules.filter((s) => {
    switch (activeTab) {
      case "pending": return s.status === "pending";
      case "medication": return true;
      case "completed": return s.status === "taken";
      default: return true;
    }
  });

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

  const formatTime = (t: string | null) => {
    if (!t) return "No time set";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const handleSelectedDateChange = (date: Date) => {
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    shouldResetCarouselRef.current = true;
    setBatchAnchorStart(getCenteredBatchStart(normalizedDate));
  };

  useEffect(() => {
    if (!shouldResetCarouselRef.current) {
      return;
    }

    carouselRef.current?.scrollTo({ index: CENTER_PAGE_INDEX, animated: false });
    shouldResetCarouselRef.current = false;
  }, [batchAnchorStart]);

  const calendarWidth = Math.max(screenWidth - CALENDAR_PADDING, 260);
  const inactiveCardWidth = Math.floor(
    (calendarWidth - CALENDAR_GAP * (DAY_BATCH_SIZE - 1) - ACTIVE_WIDTH_BONUS) /
      DAY_BATCH_SIZE,
  );
  const activeCardWidth = inactiveCardWidth + ACTIVE_WIDTH_BONUS;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={styles.container}>
          <View style={styles.purplePanel}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setIsDropdownOpen(true)}>
                <View style={styles.monthContainer}>
                  <Text style={styles.monthText}>
                    {getMonthName(selectedDate.getMonth())}{" "}
                    {selectedDate.getFullYear()}
                  </Text>
                  <Text style={styles.dropdownArrow}>v</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.purpleButton}>
                <Text style={styles.addTaskText}>+ Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => supabase.auth.signOut()}
                style={{ marginLeft: 8, backgroundColor: "#850099", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}
              >
                <Text style={{ color: "#FFF", fontSize: 12 }}>Logout</Text>
              </TouchableOpacity>
            </View>

            <Carousel
              ref={carouselRef}
              data={pageOffsets}
              defaultIndex={CENTER_PAGE_INDEX}
              height={160}
              loop={false}
              overscrollEnabled={false}
              pagingEnabled
              style={styles.dateCarouselContainer}
              width={calendarWidth}
              windowSize={5}
              renderItem={({ item }) => {
                const pageDates = createDateBatch(getBatchStartForOffset(batchAnchorStart, item));

                return (
                  <View style={[styles.dateCarousel, { width: calendarWidth, gap: CALENDAR_GAP }]}>
                    {pageDates.map((date) => {
                      const isSelected = isSameDay(date, selectedDate);

                      return (
                        <TouchableOpacity
                          key={date.toISOString()}
                          style={[
                            isSelected ? styles.activeCard : styles.inactiveCard,
                            { width: isSelected ? activeCardWidth : inactiveCardWidth },
                          ]}
                          onPress={() => setSelectedDate(date)}
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
                              isSelected
                                ? styles.dayNameActive
                                : styles.dayNameInactive
                            }
                          >
                            {getDayName(date.getDay(), !isSelected)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              }}
            />
          </View>
        </View>
        <TabFilterBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Error banner */}
        {!!fetchError && (
          <View style={styles.fetchErrorBanner}>
            <Text style={styles.fetchErrorText}>{fetchError}</Text>
          </View>
        )}

        {/* Medication Schedule List */}
        {isLoadingData ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#B902D6" />
          </View>
        ) : filteredSchedules.length > 0 ? (
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {filteredSchedules.map((schedule) => (
              <MedicationCard
                key={schedule.id}
                item={{
                  id: String(schedule.id),
                  name: schedule.medication?.name ?? "",
                  instructions: schedule.medication?.instructions ?? "",
                  dosage: schedule.medication?.dosage ?? undefined,
                  time: formatTime(schedule.scheduled_time),
                }}
                status={schedule.status as "pending" | "taken"}
                onTake={async () => {
                  await updateScheduleStatus(schedule.id, "taken");
                  fetchDashboardData();
                }}
              />
            ))}
          </ScrollView>
        ) : activeTab === "medication" && allMedications.length > 0 ? (
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {allMedications.map((med) => (
              <MedicationCard
                key={med.id}
                item={{
                  id: String(med.id),
                  name: med.name,
                  instructions: med.instructions ?? "",
                  dosage: med.dosage ?? undefined,
                  time: "",
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#999", fontSize: 15 }}>No items for this date</Text>
          </View>
        )}

        {/* Floating Action Menu */}
        <FloatingActionMenu />
      </View>

      {/* iOS: native spinner inside a slide-up modal with a Done button */}
      {Platform.OS === "ios" && (
        <Modal
          visible={isDropdownOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <View style={styles.iosPickerContainer}>
            <TouchableOpacity
              onPress={() => setIsDropdownOpen(false)}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(_: DateTimePickerEvent, date?: Date) => {
                if (date) handleSelectedDateChange(date);
              }}
            />
          </View>
        </Modal>
      )}

      {/* Android: native calendar dialog - auto-dismisses on selection or cancel */}
      {Platform.OS === "android" && isDropdownOpen && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setIsDropdownOpen(false);
            if (event.type !== "dismissed" && date) handleSelectedDateChange(date);
          }}
        />
      )}
    </>
  );
}
