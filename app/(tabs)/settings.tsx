import { Ionicons, type IoniconsName } from "@/components/icons";
import {
  Accent,
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Spacing,
} from "@/constants/theme";
import { clearAppCache, getCacheSizeInMB } from "@/services/cache";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NumberPickerModal } from "@/components/number-picker-modal";
import { TimePickerModal } from "@/components/time-picker-modal";

// These MUST be defined outside the component to avoid re-creation on every render
function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  right,
  onPress,
  subtitle,
}: {
  icon: IoniconsName;
  label: string;
  right: React.ReactNode;
  onPress?: () => void;
  subtitle?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
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
}

export default function SettingsScreen() {
  const [cacheSizeMB, setCacheSizeMB] = useState("0.00");

  const isBiometricEnabled = useAuthStore(
    useCallback((s) => s.isBiometricEnabled, []),
  );
  const toggleBiometric = useAuthStore(
    useCallback((s) => s.toggleBiometric, []),
  );

  const notificationSettings = useSettingsStore(
    useCallback((s) => s.notificationSettings, []),
  );
  const initSettings = useSettingsStore(useCallback((s) => s.initialize, []));
  const requestNotificationPermission = useSettingsStore(
    useCallback((s) => s.requestNotificationPermission, []),
  );
  const toggleNotifications = useSettingsStore(
    useCallback((s) => s.toggleNotifications, []),
  );
  const toggleNextItemNotification = useSettingsStore(
    useCallback((s) => s.toggleNextItemNotification, []),
  );
  const toggleReminder = useSettingsStore(
    useCallback((s) => s.toggleReminder, []),
  );
  const toggleInactivity = useSettingsStore(
    useCallback((s) => s.toggleInactivity, []),
  );
  const setInactivityDays = useSettingsStore(
    useCallback((s) => s.setInactivityDays, []),
  );
  const updateReminderSchedule = useSettingsStore(
    useCallback((s) => s.updateReminderSchedule, []),
  );
  const setReminderTime = useSettingsStore(
    useCallback((s) => s.setReminderTime, []),
  );
  const setReminderFrequency = useSettingsStore(
    useCallback((s) => s.setReminderFrequency, []),
  );

  const getNextItem = useWatchlistStore(useCallback((s) => s.getNextItem, []));

  // Modal visibility states
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [daysPickerVisible, setDaysPickerVisible] = useState(false);

  const handleSetReminderTime = useCallback(
    async (time: string) => {
      await setReminderTime(time);
      const nextItem = getNextItem();
      await updateReminderSchedule(nextItem?.title);
      setTimePickerVisible(false);
    },
    [getNextItem, setReminderTime, updateReminderSchedule],
  );

  const handleSetReminderFrequency = useCallback(() => {
    Alert.alert("ความถี่ในการเตือน", "เลือกความถี่ที่ต้องการ", [
      {
        text: "ทุกวัน",
        onPress: async () => {
          await setReminderFrequency("daily");
          const nextItem = getNextItem();
          await updateReminderSchedule(nextItem?.title);
        },
      },
      {
        text: "ทุกสัปดาห์",
        onPress: async () => {
          await setReminderFrequency("weekly");
          const nextItem = getNextItem();
          await updateReminderSchedule(nextItem?.title);
        },
      },
      { text: "ยกเลิก", style: "cancel" },
    ]);
  }, [getNextItem, setReminderFrequency, updateReminderSchedule]);

  const handleSetInactivityDays = useCallback(
    async (days: number) => {
      await setInactivityDays(days);
      setDaysPickerVisible(false);
    },
    [setInactivityDays],
  );

  const handleReminderRowPress = useCallback(() => {
    Alert.alert("ตั้งค่าการเตือน", "เลือกหัวข้อที่ต้องการแก้ไข", [
      { text: "เปลี่ยนเวลา", onPress: () => setTimePickerVisible(true) },
      { text: "เปลี่ยนความถี่", onPress: handleSetReminderFrequency },
      { text: "ยกเลิก", style: "cancel" },
    ]);
  }, [handleSetReminderFrequency]);

  const handleInactivityRowPress = useCallback(() => {
    setDaysPickerVisible(true);
  }, []);

  useEffect(() => {
    initSettings();
    getCacheSizeInMB().then(setCacheSizeMB);
  }, [initSettings]);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      "ล้างแคช",
      "ต้องการล้างข้อมูลแคชที่บันทึกไว้ใช่หรือไม่? (การดึงข้อมูลครั้งต่อไปอาจใช้เวลานานขึ้นเล็กน้อย)",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ล้างเลย",
          style: "destructive",
          onPress: async () => {
            await clearAppCache();
            const newSize = await getCacheSizeInMB();
            setCacheSizeMB(newSize);
            Alert.alert("สำเร็จ", "ล้างแคชเรียบร้อยแล้ว", [{ text: "ตกลง" }]);
          },
        },
      ],
    );
  }, []);

  const handleChangePin = useCallback(() => {
    router.push("/change-pin");
  }, []);

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
                onPress={handleInactivityRowPress}
                subtitle={`หลังจาก ${notificationSettings.inactivityDays} วัน`}
              />
            </>
          )}
        </SettingsSection>

        <SettingsSection title="ข้อมูลแอปพลิเคชัน (Storage)">
          <SettingsRow
            icon="server-outline"
            label="ขนาดของแคช (Cache)"
            right={<Text style={styles.rowValue}>{cacheSizeMB} MB</Text>}
            subtitle="ข้อมูลที่โหลดมาแล้วเพื่อความรวดเร็ว"
          />
          <SettingsRow
            icon="trash-outline"
            label="ล้างแคชทั้งหมด"
            right={
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.dark.textMuted}
              />
            }
            onPress={handleClearCache}
          />
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

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={timePickerVisible}
        initialTime={notificationSettings.reminderTime}
        onConfirm={handleSetReminderTime}
        onCancel={() => setTimePickerVisible(false)}
      />

      {/* Days Picker Modal */}
      <NumberPickerModal
        visible={daysPickerVisible}
        initialValue={notificationSettings.inactivityDays}
        title="จำนวนวันที่ไม่ได้เปิดแอป"
        subtitle="แจ้งเตือนหลังจากไม่ได้เปิดแอปเป็นเวลา (วัน)"
        min={1}
        max={365}
        onConfirm={handleSetInactivityDays}
        onCancel={() => setDaysPickerVisible(false)}
      />
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
    paddingBottom: 100,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
