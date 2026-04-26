import FloatingActionMenu from "@/components/floatingActionMenu";
import MedicationCard from "@/components/MedicationCard";
import TabFilterBar from "@/components/tabFilterBar";
import { styles } from "@/styles/index.styles";
import type { Medication, MedicationSchedule } from "@/types/database";
import {
  DAY_BATCH_SIZE,
  createDateBatch,
  getBatchStartForOffset,
  getCalendarSelectionTransitionOffset,
  getSelectedDateBatchState,
  isSameDay,
  startOfDay,
} from "@/utils/dashboardCalendar";
import {
  getCalendarDayAnimationMode,
  type CalendarDayAnimationMode,
} from "@/utils/dashboardCalendarAnimationMode";
import {
  COLLAPSED_SELECTED_DAY_HEIGHT,
  getCalendarDayPresentation,
} from "@/utils/dashboardCalendarPresentation";
import { getActiveMedications, getSchedulesForDate, markScheduleStatus } from "@/utils/database";
import { supabase } from "@/utils/supabase";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Easing,
  Modal,
  Platform,
  Animated as RNAnimated,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import Carousel, { type ICarouselInstance } from "react-native-reanimated-carousel";

const CALENDAR_PADDING = 60;
const CALENDAR_GAP = 8;
const ACTIVE_WIDTH_BONUS = 28;
const PAGE_BUFFER = 120;
const CENTER_PAGE_INDEX = PAGE_BUFFER;
const DAY_BATCH_CENTER_INDEX = Math.floor(DAY_BATCH_SIZE / 2);
const CALENDAR_RECENTER_ANIMATION_MS = 300;
const CALENDAR_EXPANDED_HEIGHT = 160;
const CALENDAR_COLLAPSED_HEIGHT = COLLAPSED_SELECTED_DAY_HEIGHT + 16;
const CALENDAR_COLLAPSE_SCROLL_DISTANCE =
  CALENDAR_EXPANDED_HEIGHT - CALENDAR_COLLAPSED_HEIGHT;
const PURPLE_PANEL_EXPANDED_PADDING_BOTTOM = 35;
const PURPLE_PANEL_COLLAPSED_PADDING_BOTTOM = 18;
const DAY_LABEL_EXPANDED_MARGIN_TOP = 4;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type CalendarDayCardProps = {
  date: Date;
  dayLabel: string;
  isSelected: boolean;
  collapseProgress: SharedValue<number>;
  activeCardWidth: number;
  inactiveCardWidth: number;
  animationMode: CalendarDayAnimationMode;
  onPress: () => void;
};

function CalendarDayCard({
  date,
  dayLabel,
  isSelected,
  collapseProgress,
  activeCardWidth,
  inactiveCardWidth,
  animationMode,
  onPress,
}: CalendarDayCardProps) {
  const expandedPresentation = getCalendarDayPresentation({
    isCollapsed: false,
    isSelected,
    activeCardWidth,
    inactiveCardWidth,
    collapsedDaySize: inactiveCardWidth,
  });
  const collapsedPresentation = getCalendarDayPresentation({
    isCollapsed: true,
    isSelected,
    activeCardWidth,
    inactiveCardWidth,
    collapsedDaySize: inactiveCardWidth,
  });
  const collapsedHeightRatio =
    collapsedPresentation.height / expandedPresentation.height;
  const collapsedNumberScale =
    collapsedPresentation.numberFontSize / expandedPresentation.numberFontSize;

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    borderRadius: interpolate(
      collapseProgress.value,
      [0, 1],
      [expandedPresentation.borderRadius, collapsedPresentation.borderRadius],
    ),
    transform: [
      {
        scaleY: interpolate(
          collapseProgress.value,
          [0, 1],
          [1, collapsedHeightRatio],
        ),
      },
    ],
  }));

  const animatedNumberStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          collapseProgress.value,
          [0, 1],
          [1, collapsedNumberScale],
        ),
      },
      {
        translateY: interpolate(collapseProgress.value, [0, 1], [0, 2]),
      },
    ],
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 1], [1, 0]),
    transform: [
      {
        translateY: interpolate(collapseProgress.value, [0, 1], [0, -10]),
      },
      {
        scale: interpolate(collapseProgress.value, [0, 1], [1, 0.85]),
      },
    ],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(collapseProgress.value, [0, 1], [0, 6]),
      },
    ],
  }));
  const expandedFadeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 1], [1, 0]),
  }));
  const collapsedFadeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 1], [0, 1]),
  }));

  if (animationMode === "fade") {
    return (
      <AnimatedTouchableOpacity
        style={[
          {
            width: expandedPresentation.width,
            height: expandedPresentation.height,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
        onPress={onPress}
      >
        <Animated.View
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
            },
            expandedFadeAnimatedStyle,
          ]}
        >
          <View
            style={[
              isSelected ? styles.activeCard : styles.inactiveCard,
              {
                width: expandedPresentation.width,
                height: expandedPresentation.height,
                borderRadius: expandedPresentation.borderRadius,
                padding: expandedPresentation.padding,
              },
            ]}
          >
            <Text
              style={[
                isSelected
                  ? styles.dateNumberActive
                  : styles.dateNumberInactive,
                { fontSize: expandedPresentation.numberFontSize },
              ]}
            >
              {date.getDate()}
            </Text>
            {expandedPresentation.showDayLabel ? (
              <Text
                style={[
                  isSelected
                    ? styles.dayNameActive
                    : styles.dayNameInactive,
                  { marginTop: DAY_LABEL_EXPANDED_MARGIN_TOP },
                ]}
              >
                {dayLabel}
              </Text>
            ) : null}
          </View>
        </Animated.View>
        <Animated.View
          renderToHardwareTextureAndroid
          shouldRasterizeIOS
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              inset: 0,
              alignItems: "center",
              justifyContent: "center",
            },
            collapsedFadeAnimatedStyle,
          ]}
        >
          <View
            style={[
              isSelected ? styles.activeCard : styles.inactiveCard,
              {
                width: collapsedPresentation.width,
                height: collapsedPresentation.height,
                borderRadius: collapsedPresentation.borderRadius,
                padding: collapsedPresentation.padding,
              },
            ]}
          >
            <Text
              style={[
                isSelected
                  ? styles.dateNumberActive
                  : styles.dateNumberInactive,
                { fontSize: collapsedPresentation.numberFontSize },
              ]}
            >
              {date.getDate()}
            </Text>
          </View>
        </Animated.View>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[
        {
          width: expandedPresentation.width,
          height: expandedPresentation.height,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
      onPress={onPress}
    >
      <Animated.View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        pointerEvents="none"
        style={[
          isSelected ? styles.activeCard : styles.inactiveCard,
          {
            position: "absolute",
            width: expandedPresentation.width,
            height: expandedPresentation.height,
            padding: expandedPresentation.padding,
          },
          animatedBackgroundStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            inset: 0,
            alignItems: "center",
            justifyContent: "center",
          },
          animatedContentStyle,
        ]}
      >
        <Animated.Text
          style={[
            isSelected
              ? styles.dateNumberActive
              : styles.dateNumberInactive,
            animatedNumberStyle,
          ]}
        >
          {date.getDate()}
        </Animated.Text>
        <Animated.Text
          style={[
            isSelected
              ? styles.dayNameActive
              : styles.dayNameInactive,
            {
              position: "absolute",
              bottom: isSelected ? 18 : 16,
              marginTop: DAY_LABEL_EXPANDED_MARGIN_TOP,
            },
            animatedLabelStyle,
          ]}
        >
          {dayLabel}
        </Animated.Text>
      </Animated.View>
    </AnimatedTouchableOpacity>
  );
}

export default function Dashboard() {
  // **************************** CALENDAR LOGIC ****************************
  const initialSelectedDate = startOfDay(new Date());
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [batchAnchorStart, setBatchAnchorStart] = useState(() =>
    getSelectedDateBatchState(initialSelectedDate).batchAnchorStart,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const carouselRef = useRef<ICarouselInstance>(null);
  const shouldResetCarouselRef = useRef(false);
  const pendingTransitionOffsetRef = useRef(0);
  const calendarTranslateX = useRef(new RNAnimated.Value(0)).current;
  const scrollOffsetY = useSharedValue(0);
  const calendarCollapseProgress = useDerivedValue(() => {
    if (scrollOffsetY.value <= 0) {
      return 0;
    }

    if (scrollOffsetY.value >= CALENDAR_COLLAPSE_SCROLL_DISTANCE) {
      return 1;
    }

    return scrollOffsetY.value / CALENDAR_COLLAPSE_SCROLL_DISTANCE;
  });
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

  const fetchSchedules = useCallback(async () => {
    setSchedules([]);
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const schedulesData = await getSchedulesForDate(selectedDate);
      setSchedules(schedulesData);
    } catch (err) {
      const isAuthError =
        err instanceof Error &&
        (err.message.includes("Not authenticated") ||
          err.message.includes("JWT"));
      setFetchError(
        isAuthError
          ? "Your session expired. Please log in again."
          : "Could not load data. Pull to retry.",
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    getActiveMedications().then(setAllMedications).catch(() => { });
  }, []);

  const fetchDashboardData = fetchSchedules;

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

  const handleSelectedDateChange = (date: Date, transitionOffset: number = 0) => {
    const nextSelectionState = getSelectedDateBatchState(date);

    pendingTransitionOffsetRef.current = transitionOffset;
    setSelectedDate(nextSelectionState.selectedDate);
    shouldResetCarouselRef.current = true;
    setBatchAnchorStart(nextSelectionState.batchAnchorStart);
  };

  const handleDayPress = (
    date: Date,
    pressedIndex: number,
    pageDates: Date[],
  ) => {
    const currentSelectedIndex = pageDates.findIndex((pageDate) =>
      isSameDay(pageDate, selectedDate),
    );
    const transitionOffset = getCalendarSelectionTransitionOffset({
      pressedIndex,
      currentSelectedIndex: currentSelectedIndex >= 0 ? currentSelectedIndex : null,
      nextSelectedIndex: DAY_BATCH_CENTER_INDEX,
      activeCardWidth: selectedDayPresentation.width,
      inactiveCardWidth: inactiveDayPresentation.width,
      gap: CALENDAR_GAP,
    });

    handleSelectedDateChange(date, transitionOffset);
  };

  useEffect(() => {
    if (!shouldResetCarouselRef.current) {
      return;
    }

    carouselRef.current?.scrollTo({ index: CENTER_PAGE_INDEX, animated: false });
    calendarTranslateX.stopAnimation();

    const transitionOffset = pendingTransitionOffsetRef.current;
    if (transitionOffset !== 0) {
      calendarTranslateX.setValue(transitionOffset);
      RNAnimated.timing(calendarTranslateX, {
        toValue: 0,
        duration: CALENDAR_RECENTER_ANIMATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      calendarTranslateX.setValue(0);
    }

    pendingTransitionOffsetRef.current = 0;
    shouldResetCarouselRef.current = false;
  }, [batchAnchorStart, calendarTranslateX]);

  const calendarWidth = Math.max(screenWidth - CALENDAR_PADDING, 260);
  const inactiveCardWidth = Math.floor(
    (calendarWidth - CALENDAR_GAP * (DAY_BATCH_SIZE - 1) - ACTIVE_WIDTH_BONUS) /
    DAY_BATCH_SIZE,
  );
  const activeCardWidth = inactiveCardWidth + ACTIVE_WIDTH_BONUS;
  const selectedDayPresentation = getCalendarDayPresentation({
    isCollapsed: false,
    isSelected: true,
    activeCardWidth,
    inactiveCardWidth,
    collapsedDaySize: inactiveCardWidth,
  });
  const inactiveDayPresentation = getCalendarDayPresentation({
    isCollapsed: false,
    isSelected: false,
    activeCardWidth,
    inactiveCardWidth,
    collapsedDaySize: inactiveCardWidth,
  });
  const calendarDayAnimationMode = getCalendarDayAnimationMode(Platform.OS);
  const purplePanelAnimatedStyle = useAnimatedStyle(() => ({
    minHeight: 0,
    paddingBottom: interpolate(
      calendarCollapseProgress.value,
      [0, 1],
      [
        PURPLE_PANEL_EXPANDED_PADDING_BOTTOM,
        PURPLE_PANEL_COLLAPSED_PADDING_BOTTOM,
      ],
    ),
  }));
  const calendarContainerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      calendarCollapseProgress.value,
      [0, 1],
      [CALENDAR_EXPANDED_HEIGHT, CALENDAR_COLLAPSED_HEIGHT],
    ),
    overflow: "hidden",
  }));
  const calendarRailAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          calendarCollapseProgress.value,
          [0, 1],
          [0, -(CALENDAR_EXPANDED_HEIGHT - CALENDAR_COLLAPSED_HEIGHT) / 2],
        ),
      },
    ],
  }));
  const handleContentScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentOffsetY = event.contentOffset.y;
      scrollOffsetY.value = currentOffsetY > 0 ? currentOffsetY : 0;
    },
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.screen}>
        <View style={[styles.container, { minHeight: 0 }]}>
          <Animated.View
            style={[
              styles.purplePanel,
              purplePanelAnimatedStyle,
            ]}
          >
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

            <Animated.View style={calendarContainerAnimatedStyle}>
              <Animated.View style={calendarRailAnimatedStyle}>
                <Carousel
                  ref={carouselRef}
                  data={pageOffsets}
                  defaultIndex={CENTER_PAGE_INDEX}
                  height={CALENDAR_EXPANDED_HEIGHT}
                  loop={false}
                  overscrollEnabled={false}
                  pagingEnabled
                  style={styles.dateCarouselContainer}
                  width={calendarWidth}
                  windowSize={5}
                  renderItem={({ item }) => {
                    const pageDates = createDateBatch(getBatchStartForOffset(batchAnchorStart, item));

                    return (
                      <RNAnimated.View
                        style={{
                          transform: [{ translateX: calendarTranslateX }],
                        }}
                      >
                        <View style={[styles.dateCarousel, { width: calendarWidth, gap: CALENDAR_GAP }]}>
                          {pageDates.map((date, index) => {
                            const isSelected = isSameDay(date, selectedDate);

                            return (
                              <CalendarDayCard
                                key={date.toISOString()}
                                date={date}
                                dayLabel={getDayName(date.getDay(), !isSelected)}
                                isSelected={isSelected}
                                collapseProgress={calendarCollapseProgress}
                                activeCardWidth={activeCardWidth}
                                inactiveCardWidth={inactiveCardWidth}
                                animationMode={calendarDayAnimationMode}
                                onPress={() => handleDayPress(date, index, pageDates)}
                              />
                            );
                          })}
                        </View>
                      </RNAnimated.View>
                    );
                  }}
                />
              </Animated.View>
            </Animated.View>
          </Animated.View>
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
          <Animated.ScrollView
            style={{ flex: 1, paddingHorizontal: 16 }}
            onScroll={handleContentScroll}
            scrollEventThrottle={16}
          >
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
                  await markScheduleStatus(schedule.id, "taken", schedule.notification_id);
                  fetchDashboardData();
                }}
              />
            ))}
          </Animated.ScrollView>
        ) : activeTab === "medication" && allMedications.length > 0 ? (
          <Animated.ScrollView
            style={{ flex: 1, paddingHorizontal: 16 }}
            onScroll={handleContentScroll}
            scrollEventThrottle={16}
          >
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
          </Animated.ScrollView>
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
