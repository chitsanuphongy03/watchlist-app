import { Accent, Colors, FontFamily, FontSize, Radius, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

export function TimePickerModal({
  visible,
  initialTime,
  onConfirm,
  onCancel,
}: TimePickerModalProps) {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  useEffect(() => {
    if (visible && initialTime) {
      const [h, m] = initialTime.split(":");
      setHours(h || "");
      setMinutes(m || "");
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const h = hours.padStart(2, "0");
    const m = minutes.padStart(2, "0");
    onConfirm(`${h}:${m}`);
  };

  const isValid =
    hours.length > 0 &&
    minutes.length > 0 &&
    parseInt(hours, 10) >= 0 &&
    parseInt(hours, 10) <= 23 &&
    parseInt(minutes, 10) >= 0 &&
    parseInt(minutes, 10) <= 59;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>ตั้งเวลาเตือน</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={hours}
                onChangeText={(text) => {
                  const filtered = text.replace(/[^0-9]/g, "").slice(0, 2);
                  setHours(filtered);
                }}
                placeholder="00"
                placeholderTextColor={Colors.dark.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={styles.label}>ชั่วโมง</Text>
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={minutes}
                onChangeText={(text) => {
                  const filtered = text.replace(/[^0-9]/g, "").slice(0, 2);
                  setMinutes(filtered);
                }}
                placeholder="00"
                placeholderTextColor={Colors.dark.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
              <Text style={styles.label}>นาที</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, !isValid && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isValid}
          >
            <Text
              style={[
                styles.confirmButtonText,
                !isValid && styles.confirmButtonTextDisabled,
              ]}
            >
              ตกลง
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 320,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    alignItems: "center",
  },
  input: {
    width: 70,
    height: 70,
    backgroundColor: Colors.dark.background,
    borderRadius: Radius.md,
    textAlign: "center",
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginTop: Spacing.xs,
  },
  separator: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    marginHorizontal: Spacing.md,
  },
  confirmButton: {
    backgroundColor: Accent.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.dark.border,
  },
  confirmButtonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.text,
  },
  confirmButtonTextDisabled: {
    color: Colors.dark.textMuted,
  },
});
