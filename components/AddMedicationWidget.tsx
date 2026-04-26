import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { saveAppointment, saveManualMedication } from "@/utils/database";
import { parseFrequency } from "@/utils/frequency";
import { fromDbTime } from "@/utils/timeFormat";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

function dbTimeToDate(timetz: string): Date {
  const parts = timetz.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToDbTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00+08:00`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

const makeDefaultEnd = () => {
  const d = new Date();
  d.setDate(d.getDate() + 6);
  return d;
};

const FREQUENCY_OPTIONS = [
  "Once a day",
  "Twice a day",
  "Three times a day",
  "Four times a day",
  "Every other day",
  "Once a week",
];

const MAX_DESCRIPTION = 200;

export default function AddMedicationWidget({ visible, onClose, onSaved }: Props) {
  const [medicationName, setMedicationName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"medication" | "appointment">("medication");
  const [selectedFrequency, setSelectedFrequency] = useState("Three times a day");
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(makeDefaultEnd);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(() => new Date());
  const [tempEndDate, setTempEndDate] = useState(makeDefaultEnd);

  const [intakeTimes, setIntakeTimes] = useState<Date[]>([]);
  const [showTimePickerIdx, setShowTimePickerIdx] = useState<number | null>(null);
  const [tempTime, setTempTime] = useState(() => new Date());

  useEffect(() => {
    const { intakeTimes: defaults } = parseFrequency(selectedFrequency);
    setIntakeTimes(defaults.map(dbTimeToDate));
  }, [selectedFrequency]);

  const isAppointment = selectedCategory === "appointment";

  function resetState() {
    setMedicationName("");
    setDescription("");
    setSelectedCategory("medication");
    setSelectedFrequency("Three times a day");
    setIsFrequencyOpen(false);
    const t = new Date();
    const e = makeDefaultEnd();
    setStartDate(t);
    setEndDate(e);
    setTempStartDate(t);
    setTempEndDate(e);
  }

  async function handleSave() {
    if (!medicationName.trim()) {
      Alert.alert("Required", "Please enter a name.");
      return;
    }
    setIsSaving(true);
    try {
      if (selectedCategory === "medication") {
        const { kind } = parseFrequency(selectedFrequency);
        await saveManualMedication({
          name: medicationName.trim(),
          description: description.trim() || null,
          intakeTimes: intakeTimes.map(dateToDbTime),
          startDate,
          endDate,
          frequencyKind: kind,
        });
      } else {
        await saveAppointment({
          name: medicationName.trim(),
          description: description.trim() || null,
          date: startDate,
        });
      }
      resetState();
      onSaved?.();
      onClose();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartDateChange(_: unknown, selected?: Date) {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      if (selected) {
        setStartDate(selected);
        if (selected > endDate) {
          const newEnd = new Date(selected);
          newEnd.setDate(newEnd.getDate() + 6);
          setEndDate(newEnd);
        }
      }
    } else {
      if (selected) setTempStartDate(selected);
    }
  }

  function confirmStartDate() {
    setStartDate(tempStartDate);
    if (tempStartDate > endDate) {
      const newEnd = new Date(tempStartDate);
      newEnd.setDate(newEnd.getDate() + 6);
      setEndDate(newEnd);
      setTempEndDate(newEnd);
    }
    setShowStartPicker(false);
  }

  function handleEndDateChange(_: unknown, selected?: Date) {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
      if (selected) setEndDate(selected);
    } else {
      if (selected) setTempEndDate(selected);
    }
  }

  function handleTimeChange(_: unknown, selected?: Date) {
    if (Platform.OS === "android") {
      if (showTimePickerIdx !== null && selected) {
        const updated = [...intakeTimes];
        updated[showTimePickerIdx] = selected;
        setIntakeTimes(updated);
      }
      setShowTimePickerIdx(null);
    } else {
      if (selected) setTempTime(selected);
    }
  }

  function confirmTime() {
    if (showTimePickerIdx !== null) {
      const updated = [...intakeTimes];
      updated[showTimePickerIdx] = tempTime;
      setIntakeTimes(updated);
    }
    setShowTimePickerIdx(null);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >


      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView intensity={50} tint="dark" style={wStyles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={wStyles.card}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={wStyles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* ── Title ── */}
                <Text style={wStyles.title}>
                  {isAppointment ? "Add appointment" : "Add medication"}
                </Text>

                {/* ── Name ── */}
                <Text style={wStyles.label}>
                  {isAppointment ? "Appointment name" : "Medication name"}
                </Text>
                <View style={wStyles.inputWrapper}>
                  <TextInput
                    style={wStyles.input}
                    placeholder={isAppointment ? "Appointment" : "Medication"}
                    placeholderTextColor="#B0A8B4"
                    value={medicationName}
                    onChangeText={setMedicationName}
                  />
                </View>

                {/* ── Description ── */}
                <Text style={wStyles.label}>Description</Text>
                <View style={[wStyles.inputWrapper, wStyles.textAreaWrapper]}>
                  <TextInput
                    style={[wStyles.input, wStyles.textArea]}
                    placeholder="Description"
                    placeholderTextColor="#B0A8B4"
                    multiline
                    maxLength={MAX_DESCRIPTION}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={wStyles.charCount}>
                  {description.length}/{MAX_DESCRIPTION}
                </Text>

                {/* ── Category ── */}
                <Text style={wStyles.label}>Category</Text>
                <View style={wStyles.categoryRow}>
                  <TouchableOpacity
                    style={[
                      wStyles.categoryPill,
                      selectedCategory === "medication" && wStyles.categoryPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory("medication")}
                  >
                    <Text
                      style={[
                        wStyles.categoryText,
                        selectedCategory === "medication" && wStyles.categoryTextActive,
                      ]}
                    >
                      Medication
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      wStyles.categoryPill,
                      selectedCategory === "appointment" && wStyles.categoryPillActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory("appointment")}
                  >
                    <Text
                      style={[
                        wStyles.categoryText,
                        selectedCategory === "appointment" && wStyles.categoryTextActive,
                      ]}
                    >
                      Appointment
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ── Frequency + intake times (medication only) ── */}
                {!isAppointment && (
                  <>
                    <Text style={wStyles.label}>Frequency</Text>
                    <TouchableOpacity
                      style={wStyles.dropdownTrigger}
                      activeOpacity={0.7}
                      onPress={() => setIsFrequencyOpen(!isFrequencyOpen)}
                    >
                      <Text style={wStyles.dropdownText}>{selectedFrequency}</Text>
                      <Feather
                        name={isFrequencyOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#666"
                      />
                    </TouchableOpacity>
                    {isFrequencyOpen && (
                      <View style={wStyles.dropdownList}>
                        {FREQUENCY_OPTIONS.map((option) => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              wStyles.dropdownOption,
                              selectedFrequency === option && wStyles.dropdownOptionActive,
                            ]}
                            onPress={() => {
                              setSelectedFrequency(option);
                              setIsFrequencyOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                wStyles.dropdownOptionText,
                                selectedFrequency === option && wStyles.dropdownOptionTextActive,
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Intake time pickers */}
                    {intakeTimes.map((t, idx) => (
                      <View key={idx} style={wStyles.intakeRow}>
                        <Text style={wStyles.intakeLabel}>Intake {idx + 1}</Text>
                        <TouchableOpacity
                          style={wStyles.intakePill}
                          activeOpacity={0.7}
                          onPress={() => {
                            setTempTime(t);
                            setShowTimePickerIdx(idx);
                          }}
                        >
                          <Text style={wStyles.intakeTimeText}>
                            {fromDbTime(dateToDbTime(t))}
                          </Text>
                          <Feather name="clock" size={14} color="#B902D6" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Android: time picker */}
                    {Platform.OS === "android" && showTimePickerIdx !== null && (
                      <DateTimePicker
                        value={intakeTimes[showTimePickerIdx] ?? new Date()}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                      />
                    )}
                  </>
                )}

                {/* ── Dates ── */}
                <View style={wStyles.dateRow}>
                  <View style={wStyles.dateColumn}>
                    <Text style={wStyles.label}>
                      {isAppointment ? "Date" : "Date start"}
                    </Text>
                    <TouchableOpacity
                      style={wStyles.datePill}
                      activeOpacity={0.7}
                      onPress={() => {
                        setTempStartDate(startDate);
                        setShowStartPicker(true);
                      }}
                    >
                      <Text style={wStyles.dateText}>{formatDate(startDate)}</Text>
                    </TouchableOpacity>
                  </View>
                  {!isAppointment && (
                    <View style={wStyles.dateColumn}>
                      <Text style={wStyles.label}>Date end</Text>
                      <TouchableOpacity
                        style={wStyles.datePill}
                        activeOpacity={0.7}
                        onPress={() => {
                          setTempEndDate(endDate);
                          setShowEndPicker(true);
                        }}
                      >
                        <Text style={wStyles.dateText}>{formatDate(endDate)}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Android: date pickers */}
                {Platform.OS === "android" && showStartPicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                    minimumDate={new Date()}
                  />
                )}
                {Platform.OS === "android" && showEndPicker && !isAppointment && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                    minimumDate={startDate}
                  />
                )}

                {/* ── Action buttons ── */}
                <View style={wStyles.actionRow}>
                  <TouchableOpacity
                    style={wStyles.cancelButton}
                    activeOpacity={0.7}
                    onPress={onClose}
                    disabled={isSaving}
                  >
                    <Text style={wStyles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[wStyles.saveButton, isSaving && wStyles.saveButtonDisabled]}
                    activeOpacity={0.7}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={wStyles.saveText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </BlurView>
      </TouchableWithoutFeedback>

      {/* iOS: start date picker */}
      {Platform.OS === "ios" && showStartPicker && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <Pressable style={wStyles.pickerOverlay} onPress={() => setShowStartPicker(false)}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={wStyles.pickerSheet}>
                <View style={wStyles.pickerHeader}>
                  <Pressable onPress={() => setShowStartPicker(false)}>
                    <Text style={wStyles.pickerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={confirmStartDate}>
                    <Text style={wStyles.pickerDone}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={tempStartDate}
                  mode="date"
                  display="spinner"
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                  textColor="#000000"
                  themeVariant="light"
                />
              </View>
            </TouchableWithoutFeedback>
          </Pressable>
        </View>
      )}

      {/* iOS: end date picker */}
      {Platform.OS === "ios" && showEndPicker && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <Pressable style={wStyles.pickerOverlay} onPress={() => setShowEndPicker(false)}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={wStyles.pickerSheet}>
                <View style={wStyles.pickerHeader}>
                  <Pressable onPress={() => setShowEndPicker(false)}>
                    <Text style={wStyles.pickerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={() => { setEndDate(tempEndDate); setShowEndPicker(false); }}>
                    <Text style={wStyles.pickerDone}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={tempEndDate}
                  mode="date"
                  display="spinner"
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                  textColor="#000000"
                  themeVariant="light"
                />
              </View>
            </TouchableWithoutFeedback>
          </Pressable>
        </View>
      )}

      {/* iOS: time picker */}
      {Platform.OS === "ios" && showTimePickerIdx !== null && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
          <Pressable style={wStyles.pickerOverlay} onPress={() => setShowTimePickerIdx(null)}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={wStyles.pickerSheet}>
                <View style={wStyles.pickerHeader}>
                  <Pressable onPress={() => setShowTimePickerIdx(null)}>
                    <Text style={wStyles.pickerCancel}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={confirmTime}>
                    <Text style={wStyles.pickerDone}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  textColor="#000000"
                  themeVariant="light"
                />
              </View>
            </TouchableWithoutFeedback>
          </Pressable>
        </View>
      )}
    </Modal>
  );
}

/* ──────────────────────── styles ──────────────────────── */

const wStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#E8E0EB",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  scrollContent: {
    paddingBottom: 4,
  },

  /* Title */
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#B902D6",
    marginBottom: 20,
  },

  /* Labels */
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B902D6",
    marginBottom: 6,
    marginTop: 12,
  },

  /* Inputs */
  inputWrapper: {
    backgroundColor: "#D5CDD8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 6,
  },
  input: {
    fontSize: 15,
    color: "#3D3040",
  },
  textAreaWrapper: {
    minHeight: 120,
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },

  /* Category pills */
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  categoryPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#D5CDD8",
  },
  categoryPillActive: {
    backgroundColor: "#B902D6",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B902D6",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },

  /* Frequency dropdown */
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D5CDD8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  dropdownText: {
    fontSize: 15,
    color: "#3D3040",
  },
  dropdownList: {
    backgroundColor: "#D5CDD8",
    borderRadius: 14,
    marginTop: 6,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownOptionActive: {
    backgroundColor: "#C9BED0",
  },
  dropdownOptionText: {
    fontSize: 14,
    color: "#3D3040",
  },
  dropdownOptionTextActive: {
    color: "#B902D6",
    fontWeight: "600",
  },

  /* Intake time rows */
  intakeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  intakeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  intakePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D5CDD8",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  intakeTimeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#B902D6",
  },

  /* Date row */
  dateRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  dateColumn: {
    flex: 1,
  },
  datePill: {
    backgroundColor: "#D5CDD8",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#B902D6",
  },

  /* Action buttons */
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 28,
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "#D5CDD8",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3D3040",
  },
  saveButton: {
    paddingHorizontal: 38,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "#B902D6",
    minWidth: 90,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* Date/time picker sheet (iOS) */
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pickerCancel: {
    color: "#939292",
    fontSize: 16,
  },
  pickerDone: {
    color: "#B902D6",
    fontSize: 16,
    fontWeight: "600",
  },
});
