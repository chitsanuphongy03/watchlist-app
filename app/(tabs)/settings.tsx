/**
 * Settings Screen
 * Manage PIN, biometric, and notification settings
 */

import {
    Accent,
    Colors,
    FontFamily,
    FontSize,
    Radius,
    Spacing,
} from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { isBiometricEnabled, toggleBiometric } = useAuthStore();

  const {
    notificationSettings,
    initialize: initSettings,
    requestNotificationPermission,
    toggleNotifications,
    toggleNextItemNotification,
    toggleReminder,
    toggleInactivity,
    setInactivityDays,
    updateReminderSchedule,
  } = useSettingsStore();

  const { getNextItem } = useWatchlistStore();

  const handleSetReminderTime = useCallback(() => {
    Alert.prompt?.(
      "ตั้งเวลาเตือน",
      "ใส่เวลา (เช่น 20:00)",
      async (time: string) => {
        if (/^([01]\d|2[0-3]):?([0-5]\d)$/.test(time)) {
          const formattedTime = time.includes(":")
            ? time
            : `${time.slice(0, 2)}:${time.slice(2)}`;
          await useSettingsStore.getState().setReminderTime(formattedTime);
          const nextItem = getNextItem();
          await updateReminderSchedule(nextItem?.title);
        } else {
          Alert.alert("ผิดพลาด", "รูปแบบเวลาไม่ถูกต้อง (HH:mm)");
        }
      },
      "plain-text",
      notificationSettings.reminderTime,
    );

    if (Platform.OS === "android") {
      Alert.alert(
        "ยังไม่พร้อมใช้งาน",
        "ขณะนี้ยังไม่สามารถเปลี่ยนเวลาเตือนได้บน Android",
      );
    }
  }, [notificationSettings.reminderTime, getNextItem, updateReminderSchedule]);

  const handleSetReminderFrequency = useCallback(() => {
    Alert.alert("ความถี่ในการเตือน", "เลือกความถี่ที่ต้องการ", [
      {
        text: "ทุกวัน",
        onPress: async () => {
          await useSettingsStore.getState().setReminderFrequency("daily");
          const nextItem = getNextItem();
          await updateReminderSchedule(nextItem?.title);
        },
      },
      {
        text: "ทุกสัปดาห์",
        onPress: async () => {
          await useSettingsStore.getState().setReminderFrequency("weekly");
          const nextItem = getNextItem();
          await updateReminderSchedule(nextItem?.title);
        },
      },
      { text: "ยกเลิก", style: "cancel" },
    ]);
  }, [getNextItem, updateReminderSchedule]);

  const handleSetInactivityDays = useCallback(() => {
    Alert.prompt?.(
      "จำนวนวันที่ไม่ได้เปิดแอป",
      "แจ้งเตือนหลังจากไม่ได้เปิดแอปเป็นเวลา (วัน)",
      async (days: string) => {
        const d = parseInt(days, 10);
        if (!isNaN(d) && d > 0) {
          await setInactivityDays(d);
        } else {
          Alert.alert("ผิดพลาด", "กรุณาใส่จำนวนวันให้ถูกต้อง");
        }
      },
      "plain-text" as any,
      notificationSettings.inactivityDays.toString(),
    );

    if (Platform.OS === "android") {
      Alert.alert(
        "ยังไม่พร้อมใช้งาน",
        "ขณะนี้ยังไม่สามารถเปลี่ยนจำนวนวันได้บน Android",
      );
    }
  }, [notificationSettings.inactivityDays, setInactivityDays]);

  const handleReminderRowPress = useCallback(() => {
    Alert.alert("ตั้งค่าการเตือน", "เลือกหัวข้อที่ต้องการแก้ไข", [
      { text: "เปลี่ยนเวลา", onPress: handleSetReminderTime },
      { text: "เปลี่ยนความถี่", onPress: handleSetReminderFrequency },
      { text: "ยกเลิก", style: "cancel" },
    ]);
  }, [handleSetReminderTime, handleSetReminderFrequency]);

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  // ========================
  // Change PIN
  // ========================

  const handleChangePin = useCallback(() => {
    router.push("/change-pin");
  }, []);

  // ========================
  // Notification Toggle
  // ========================

  const handleToggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            "ไม่ได้รับอนุญาต",
            "กรุณาเปิดการแจ้งเตือนในตั้งค่าเครื่อง",
            [{ text: "ตกลง" }],
          );
          return;
        }
      }
      await toggleNotifications(enabled);
    },
    [requestNotificationPermission, toggleNotifications],
  );

  const handleToggleReminder = useCallback(
    async (enabled: boolean) => {
      await toggleReminder(enabled);
      if (enabled) {
        const nextItem = getNextItem();
        await updateReminderSchedule(nextItem?.title);
      }
    },
    [toggleReminder, getNextItem, updateReminderSchedule],
  );

  // ========================
  // Render Helpers
  // ========================

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsRow = ({
    icon,
    label,
    right,
    onPress,
    subtitle,
  }: {
    icon: string;
    label: string;
    right: React.ReactNode;
    onPress?: () => void;
    subtitle?: string;
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon as any}
          size={20}
          color={Accent.primary}
          style={styles.rowIcon}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {right}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>ตั้งค่า</Text>

        <SettingsSection title="ความปลอดภัย">
          <SettingsRow
            icon="key-outline"
            label="เปลี่ยน PIN"
            right={
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.dark.textMuted}
              />
            }
            onPress={handleChangePin}
          />
          <SettingsRow
            icon="finger-print"
            label="ล็อคอินด้วย Biometric"
            right={
              <Switch
                value={isBiometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{
                  false: Colors.dark.border,
                  true: Accent.primary + "80",
                }}
                thumbColor={
                  isBiometricEnabled ? Accent.primary : Colors.dark.textMuted
                }
              />
            }
            onPress={() => toggleBiometric(!isBiometricEnabled)}
            subtitle="ใช้ลายนิ้วมือหรือ Face ID เพื่อปลดล็อก"
          />
        </SettingsSection>

        <SettingsSection title="การแจ้งเตือน">
          <SettingsRow
            icon="notifications-outline"
            label="การแจ้งเตือน"
            right={
              <Switch
                value={notificationSettings.enabled}
                onValueChange={handleToggleNotifications}
                trackColor={{
                  false: Colors.dark.border,
                  true: Accent.primary + "80",
                }}
                thumbColor={
                  notificationSettings.enabled
                    ? Accent.primary
                    : Colors.dark.textMuted
                }
              />
            }
            onPress={() =>
              handleToggleNotifications(!notificationSettings.enabled)
            }
          />
          {notificationSettings.enabled && (
            <>
              <SettingsRow
                icon="arrow-forward-circle-outline"
                label="แจ้งเตือนเรื่องถัดไป"
                right={
                  <Switch
                    value={notificationSettings.nextItemEnabled}
                    onValueChange={toggleNextItemNotification}
                    trackColor={{
                      false: Colors.dark.border,
                      true: Accent.primary + "80",
                    }}
                    thumbColor={
                      notificationSettings.nextItemEnabled
                        ? Accent.primary
                        : Colors.dark.textMuted
                    }
                  />
                }
                onPress={() =>
                  toggleNextItemNotification(
                    !notificationSettings.nextItemEnabled,
                  )
                }
                subtitle="เมื่อดูจบ แจ้งเตือนเรื่องถัดไป"
              />
              <SettingsRow
                icon="alarm-outline"
                label="เตือนให้ดู"
                right={
                  <Switch
                    value={notificationSettings.reminderEnabled}
                    onValueChange={handleToggleReminder}
                    trackColor={{
                      false: Colors.dark.border,
                      true: Accent.primary + "80",
                    }}
                    thumbColor={
                      notificationSettings.reminderEnabled
                        ? Accent.primary
                        : Colors.dark.textMuted
                    }
                  />
                }
                onPress={handleReminderRowPress}
                subtitle={`${notificationSettings.reminderFrequency === "daily" ? "ทุกวัน" : "ทุกสัปดาห์"} เวลา ${notificationSettings.reminderTime}`}
              />
              <SettingsRow
                icon="time-outline"
                label="แจ้งเตือนเมื่อไม่ได้เปิดแอป"
                right={
                  <Switch
                    value={notificationSettings.inactivityEnabled}
                    onValueChange={toggleInactivity}
                    trackColor={{
                      false: Colors.dark.border,
                      true: Accent.primary + "80",
                    }}
                    thumbColor={
                      notificationSettings.inactivityEnabled
                        ? Accent.primary
                        : Colors.dark.textMuted
                    }
                  />
                }
                onPress={handleSetInactivityDays}
                subtitle={`หลังจาก ${notificationSettings.inactivityDays} วัน`}
              />
            </>
          )}
        </SettingsSection>

        <SettingsSection title="เกี่ยวกับ">
          <SettingsRow
            icon="information-circle-outline"
            label="เวอร์ชัน"
            right={<Text style={styles.rowValue}>1.0.0</Text>}
          />
          <SettingsRow
            icon="heart-outline"
            label="Watchlist App"
            right={<Text style={styles.rowValue}>🎬 🍿</Text>}
            subtitle="จัดลำดับ หนัง อนิเมะ ซีรีส์ โทคุซัทสึ"
          />
        </SettingsSection>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontSize: FontSize.title,
    fontFamily: FontFamily.heavy,
    color: Colors.dark.text,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.bold,
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  rowIcon: {
    marginRight: Spacing.sm,
    width: 24,
  },
  rowLabel: {
    fontSize: FontSize.md,
    color: Colors.dark.text,
    fontFamily: FontFamily.medium,
  },
  rowSubtitle: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  rowValue: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    color: Colors.dark.textMuted,
  },
  contentContainer: {
    paddingBottom: 100, // Account for floating tab bar
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
