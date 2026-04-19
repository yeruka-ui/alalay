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
  onEdit: () => void;
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
    onEdit();
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
                Did you mean "
                <Text style={styles.suggestionName}>{item.suggestion}</Text>"?
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
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
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
            />

            <Text style={styles.fieldLabel}>Dosage</Text>
            <TextInput
              style={styles.input}
              value={draft.dosage ?? ""}
              onChangeText={(t) => setDraft({ ...draft, dosage: t })}
              placeholder="e.g. 500mg"
            />

            <Text style={styles.fieldLabel}>Instructions</Text>
            <TextInput
              style={styles.input}
              value={draft.instructions}
              onChangeText={(t) => setDraft({ ...draft, instructions: t })}
              placeholder="e.g. after eating"
            />

            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput
              style={styles.input}
              value={draft.time}
              onChangeText={(t) => setDraft({ ...draft, time: t })}
              placeholder="e.g. 8:00 AM"
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
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    boxShadow: "0 0 10px 5px rgba(0, 0, 0, 0.05)",
    backgroundColor: "#fcf9fcff",
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: "#939292ff",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#850099",
    marginBottom: 2,
  },
  instructions: {
    fontSize: 13,
    color: "#555555ff",
  },
  rightColumn: {
    alignItems: "flex-end",
    gap: 8,
  },
  timeBadge: {
    backgroundColor: "#FEE8FE",
    borderRadius: 50,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  timeText: {
    color: "#850099",
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popup: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#850099",
    marginBottom: 20,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#939292ff",
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E6ADEF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fcf9fc",
  },
  popupButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#FEE8FE",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#850099",
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#B902D6",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  takenText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 13,
  },
  suggestionBanner: {
    backgroundColor: "#FEE8FE",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestionText: {
    fontSize: 12,
    color: "#555",
    flex: 1,
  },
  suggestionName: {
    fontWeight: "700",
    color: "#850099",
  },
  suggestionActions: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 8,
  },
  acceptText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B902D6",
  },
  dismissText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  confidenceBanner: {
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: "#CC4444",
    fontWeight: "600",
  },
});
