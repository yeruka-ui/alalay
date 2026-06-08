import { bold, fs, s } from "@/utils/scale";
import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type MedicationItem = {
  id: string;
  name: string;
  instructions: string;
  time: string;
  dosage?: string;
  suggestion?: string | null;
  confidence?: "low" | "medium" | "high";
};

type MedicationCardProps = {
  item: MedicationItem;
  onEdit?: () => void;
  onSave?: (
    updated: MedicationItem,
    applyToAll: boolean,
    originalName: string,
  ) => void;
  onAcceptSuggestion?: (id: string, suggestedName: string) => void;
  onDismissSuggestion?: (id: string) => void;
  status?: "pending" | "taken";
  onTake?: () => void;
};

export default function MedicationCard({
  item,
  onEdit,
  onSave,
  onAcceptSuggestion,
  onDismissSuggestion,
  status,
  onTake,
}: MedicationCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState(item);

  const handleEdit = () => {
    setDraft(item);
    setModalVisible(true);
    onEdit?.();
  };

  const handleSave = () => {
    setModalVisible(false);
    // If name or dosage changed, ask to apply to all similar meds
    if (
      draft.name !== item.name ||
      draft.dosage !== item.dosage ||
      draft.instructions !== item.instructions
    ) {
      Alert.alert(
        "Apply to all?",
        `Apply name, dosage, and instruction changes to all "${item.name}" entries?`,
        [
          {
            text: "This one only",
            onPress: () => onSave?.(draft, false, item.name),
          },
          {
            text: "Apply to all",
            onPress: () => onSave?.(draft, true, item.name),
          },
        ],
      );
    } else {
      onSave?.(draft, false, item.name);
    }
  };

  const handleCancel = () => {
    setDraft(item);
    setModalVisible(false);
  };

  const confidenceBorderColor =
    item.confidence === "low"
      ? "#FF6B6B"
      : item.confidence === "medium"
        ? "#FFB84D"
        : "transparent";

  return (
    <>
      <View
        style={[
          styles.card,
          { borderLeftWidth: 4, borderLeftColor: confidenceBorderColor },
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.label}>Medication</Text>
          <Text style={styles.name}>{item.name}</Text>
          {item.suggestion && (
            <View style={styles.suggestionBanner}>
              <Text style={styles.suggestionText}>
                {"Did you mean \""}
                <Text style={styles.suggestionName}>{item.suggestion}</Text>
                {"\"?"}
              </Text>
              <View style={styles.suggestionActions}>
                <TouchableOpacity
                  onPress={() =>
                    onAcceptSuggestion?.(item.id, item.suggestion!)
                  }
                >
                  <Text style={styles.acceptText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDismissSuggestion?.(item.id)}
                >
                  <Text style={styles.dismissText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {item.confidence === "low" && (
            <View style={styles.confidenceBanner}>
              <Text style={styles.confidenceText}>
                ⚠ This was unreadable — please review
              </Text>
            </View>
          )}
          <Text style={styles.instructions}>{item.instructions}</Text>
        </View>

        <View style={styles.rightColumn}>
          {item.time ? (
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          ) : null}
          {status === "pending" && onTake ? (
            <TouchableOpacity style={styles.editButton} onPress={onTake}>
              <Text style={styles.editButtonText}>Take</Text>
            </TouchableOpacity>
          ) : status === "taken" ? (
            <Text style={styles.takenText}>✓ Taken</Text>
          ) : onEdit ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.overlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Edit Medication</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={draft.name}
              onChangeText={(t) => setDraft({ ...draft, name: t })}
              placeholder="Medication name"
              maxLength={200}
            />

            <Text style={styles.fieldLabel}>Dosage</Text>
            <TextInput
              style={styles.input}
              value={draft.dosage ?? ""}
              onChangeText={(t) => setDraft({ ...draft, dosage: t })}
              placeholder="e.g. 500mg"
              maxLength={50}
            />

            <Text style={styles.fieldLabel}>Instructions</Text>
            <TextInput
              style={styles.input}
              value={draft.instructions}
              onChangeText={(t) => setDraft({ ...draft, instructions: t })}
              placeholder="e.g. after eating"
              maxLength={500}
            />

            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput
              style={styles.input}
              value={draft.time}
              onChangeText={(t) => setDraft({ ...draft, time: t })}
              placeholder="e.g. 8:00 AM"
              maxLength={50}
            />

            <View style={styles.popupButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: s(16),
    padding: s(16),
    marginBottom: s(12),
    alignItems: "center",
    boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fcf9fcff",
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: fs(11),
    color: "#939292ff",
    marginBottom: s(8),
  },
  name: {
    fontSize: fs(16),
    ...bold,
    color: "#850099",
    marginBottom: s(2),
  },
  instructions: {
    fontSize: fs(12),
    color: "#555555ff",
  },
  rightColumn: {
    alignItems: "flex-end",
    gap: s(8),
  },
  timeBadge: {
    backgroundColor: "#FEE8FE",
    borderRadius: 50,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
  },
  timeText: {
    color: "#850099",
    fontSize: fs(11),
    ...bold,
  },
  editButton: {
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingHorizontal: s(18),
    paddingVertical: s(5),
  },
  editButtonText: {
    color: "#FFF",
    fontSize: fs(12),
    ...bold,
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: s(24),
  },
  popup: {
    backgroundColor: "#FFF",
    borderRadius: s(20),
    padding: s(24),
    width: "100%",
  },
  popupTitle: {
    fontSize: fs(18),
    ...bold,
    color: "#850099",
    marginBottom: s(16),
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: fs(12),
    ...bold,
    color: "#939292ff",
    marginBottom: s(4),
    marginTop: s(10),
  },
  input: {
    fontSize: fs(14),
    color: "#333",
    borderWidth: 1,
    borderColor: "#E6ADEF",
    borderRadius: s(12),
    paddingHorizontal: s(14),
    paddingVertical: s(8),
    backgroundColor: "#fcf9fc",
  },
  popupButtons: {
    flexDirection: "row",
    gap: s(12),
    marginTop: s(20),
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#FEE8FE",
    borderRadius: 50,
    paddingVertical: s(12),
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#850099",
    fontSize: fs(14),
    ...bold,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: s(12),
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: fs(14),
    ...bold,
  },
  takenText: {
    color: "#4CAF50",
    ...bold,
    fontSize: fs(12),
  },
  suggestionBanner: {
    backgroundColor: "#FEE8FE",
    borderRadius: s(8),
    padding: s(8),
    marginTop: s(4),
    marginBottom: s(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestionText: {
    fontSize: fs(12),
    color: "#555",
    flex: 1,
  },
  suggestionName: {
    ...bold,
    color: "#850099",
  },
  suggestionActions: {
    flexDirection: "row",
    gap: s(12),
    marginLeft: s(8),
  },
  acceptText: {
    fontSize: fs(12),
    ...bold,
    color: "#B902D6",
  },
  dismissText: {
    fontSize: fs(12),
    color: "#999",
  },
  confidenceBanner: {
    backgroundColor: "#FFF0F0",
    borderRadius: s(8),
    padding: s(6),
    marginTop: s(4),
    marginBottom: s(4),
  },
  confidenceText: {
    fontSize: fs(12),
    color: "#CC4444",
    ...bold,
  },
});
