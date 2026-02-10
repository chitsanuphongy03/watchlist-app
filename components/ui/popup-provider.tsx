import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/theme";
import { useUIStore } from "@/stores/ui-store";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur"; // Beautiful glassmorphism effect
import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// VS Code Tip: If 'expo-blur' is still red, press Ctrl+Shift+P and run "TypeScript: Restart TS Server"
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutUp,
} from "react-native-reanimated";

export function PopupProvider() {
  const { alert, toast, hideAlert } = useUIStore();

  return (
    <>
      {/* Alert Modal */}
      <Modal visible={!!alert} transparent animationType="none">
        {alert && (
          <View style={styles.alertOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={hideAlert} />
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={StyleSheet.absoluteFill}
            >
              <BlurView
                intensity={20}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(100).duration(200)}
              exiting={FadeOut}
              style={styles.alertContainer}
            >
              <Text style={styles.alertTitle}>{alert.title}</Text>
              {alert.message && (
                <Text style={styles.alertMessage}>{alert.message}</Text>
              )}

              <View style={styles.buttonRow}>
                {(alert.buttons || [{ text: "ตกลง", onPress: hideAlert }]).map(
                  (btn, index) => {
                    const isDestructive = btn.style === "destructive";
                    const isCancel = btn.style === "cancel";

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          isDestructive && styles.buttonDestructive,
                          isCancel && styles.buttonCancel,
                          alert.buttons?.length === 2 &&
                            index === 1 &&
                            styles.buttonPrimary,
                        ]}
                        onPress={() => {
                          btn.onPress?.();
                          hideAlert();
                        }}
                      >
                        <Text
                          style={[
                            styles.buttonText,
                            isDestructive && styles.buttonTextDestructive,
                            isCancel && styles.buttonTextCancel,
                            alert.buttons?.length === 2 &&
                              index === 1 &&
                              styles.buttonTextPrimary,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            </Animated.View>
          </View>
        )}
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Animated.View
          entering={SlideInUp.springify()}
          exiting={SlideOutUp}
          style={[styles.toastContainer, styles[`toast_${toast.type}`]]}
        >
          <Ionicons
            name={
              toast.type === "success"
                ? "checkmark-circle"
                : toast.type === "error"
                  ? "alert-circle"
                  : "information-circle"
            }
            size={20}
            color="#FFF"
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  alertContainer: {
    width: "100%",
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    ...Shadow.lg,
  },
  alertTitle: {
    fontSize: FontSize.xl,
    fontFamily: FontFamily.bold,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  alertMessage: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.dark.card,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: Accent.primary,
  },
  buttonDestructive: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  buttonCancel: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    color: Colors.dark.textSecondary,
  },
  buttonTextPrimary: {
    color: "#FFF",
  },
  buttonTextDestructive: {
    color: Colors.dark.error,
  },
  buttonTextCancel: {
    color: Colors.dark.textMuted,
  },
  // Toast Styles
  toastContainer: {
    position: "absolute",
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    zIndex: 9999,
    ...Shadow.md,
  },
  toast_success: {
    backgroundColor: Colors.dark.success,
  },
  toast_error: {
    backgroundColor: Colors.dark.error,
  },
  toast_info: {
    backgroundColor: Accent.primary,
  },
  toastText: {
    color: "#FFF",
    fontSize: FontSize.md,
    fontFamily: FontFamily.medium,
  },
});
