import type { ReminderFrequency } from "@/types";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Check if running inside Expo Go (push notifications not supported since SDK 53)
function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

// Only set up notification handler if NOT in Expo Go
if (!isExpoGo()) {
  Notifications.setNotificationHandler({
    handleNotification: async () =>
      ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }) as Notifications.NotificationBehavior,
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (isExpoGo()) {
    console.warn(
      "Push notifications are not supported in Expo Go (SDK 53+). Use a development build.",
    );
    return false;
  }

  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Watchlist",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E91E63",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleNextItemNotification(
  completedTitle: string,
  nextTitle: string,
): Promise<void> {
  if (isExpoGo()) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "ดูจบแล้ว 🎉",
        body: `ดู "${completedTitle}" จบแล้ว! เรื่องถัดไปคือ "${nextTitle}"`,
        data: { type: "next_item" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  } catch (error) {
    console.error("Error scheduling next item notification:", error);
  }
}

export async function scheduleReminder(
  title: string,
  time: string,
  frequency: ReminderFrequency,
): Promise<void> {
  if (isExpoGo()) return;
  try {
    await cancelNotificationsByType("reminder");

    const [hours, minutes] = time.split(":").map(Number);

    if (frequency === "daily") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "อย่าลืมดู 🍿",
          body: `วันนี้อย่าลืมดู "${title}" นะ`,
          data: { type: "reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "อย่าลืมดู 🍿",
          body: `อย่าลืมดู "${title}" นะ`,
          data: { type: "reminder" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1,
          hour: hours,
          minute: minutes,
        },
      });
    }
  } catch (error) {
    console.error("Error scheduling reminder:", error);
  }
}

export async function scheduleInactivityReminder(days: number): Promise<void> {
  if (isExpoGo()) return;
  try {
    await cancelNotificationsByType("inactivity");

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "กลับมาดูกันเถอะ 🎬",
        body: "ยังมีเรื่องรออยู่ใน Watchlist อยู่นะ",
        data: { type: "inactivity" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: days * 24 * 60 * 60,
      },
    });
  } catch (error) {
    console.error("Error scheduling inactivity reminder:", error);
  }
}

export async function cancelNotificationsByType(type: string): Promise<void> {
  if (isExpoGo()) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }
  } catch (error) {
    console.error("Error canceling notifications:", error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (isExpoGo()) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}
