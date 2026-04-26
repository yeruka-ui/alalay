import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddMedicationWidget({ visible, onClose }: Props) {
  const [medicationName, setMedicationName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"medication" | "appointment">("medication");
  const [selectedFrequency, setSelectedFrequency] = useState("Three times a day");
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);

  const frequencyOptions = [
    "Once a day",
    "Twice a day",
    "Three times a day",
    "Four times a day",
    "Every other day",
    "Once a week",
  ];

  const maxDescriptionLength = 200;

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
          <TouchableWithoutFeedback onPress={() => { }}>
            <View style={wStyles.card}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={wStyles.scrollContent}
              >
                {/* ── Title ── */}
                <Text style={wStyles.title}>Add medication</Text>

                {/* ── Medication name ── */}
                <Text style={wStyles.label}>Medication name</Text>
                <View style={wStyles.inputWrapper}>
                  <TextInput
                    style={wStyles.input}
                    placeholder="Medication"
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
                    maxLength={maxDescriptionLength}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={wStyles.charCount}>
                  {description.length}/{maxDescriptionLength}
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

                {/* ── Frequency ── */}
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
                    {frequencyOptions.map((option) => (
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

                {/* ── Date start / Date end ── */}
                <View style={wStyles.dateRow}>
                  <View style={wStyles.dateColumn}>
                    <Text style={wStyles.label}>Date start</Text>
                    <TouchableOpacity style={wStyles.datePill} activeOpacity={0.7}>
                      <Text style={wStyles.dateText}>Apr 1, 2025</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={wStyles.dateColumn}>
                    <Text style={wStyles.label}>Date end</Text>
                    <TouchableOpacity style={wStyles.datePill} activeOpacity={0.7}>
                      <Text style={wStyles.dateText}>Apr 1, 2025</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── Action buttons ── */}
                <View style={wStyles.actionRow}>
                  <TouchableOpacity
                    style={wStyles.cancelButton}
                    activeOpacity={0.7}
                    onPress={onClose}
                  >
                    <Text style={wStyles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={wStyles.saveButton} activeOpacity={0.7}>
                    <Text style={wStyles.saveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </BlurView>
      </TouchableWithoutFeedback>
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
    // Soft shadow for floating look
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
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
