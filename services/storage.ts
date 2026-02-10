import type { NotificationSettings, WatchlistItem } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  WATCHLIST: "@watchlist_items",
  NOTIFICATION_SETTINGS: "@notification_settings",
  LAST_OPENED: "@last_opened",
  BIOMETRIC_ENABLED: "@biometric_enabled",
} as const;

export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading watchlist:", error);
    return [];
  }
}

export async function saveWatchlist(items: WatchlistItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.WATCHLIST, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving watchlist:", error);
  }
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  nextItemEnabled: true,
  reminderEnabled: false,
  reminderTime: "20:00",
  reminderFrequency: "daily",
  inactivityEnabled: true,
  inactivityDays: 3,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    return data
      ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(data) }
      : DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error("Error reading notification settings:", error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(
  settings: NotificationSettings,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
}

export async function getLastOpened(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.LAST_OPENED);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    console.error("Error reading last opened:", error);
    return null;
  }
}

export async function saveLastOpened(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.LAST_OPENED, Date.now().toString());
  } catch (error) {
    console.error("Error saving last opened:", error);
  }
}

export async function getBiometricEnabled(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
    return data === "true";
  } catch (error) {
    console.error("Error reading biometric setting:", error);
    return false;
  }
}

export async function saveBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled.toString());
  } catch (error) {
    console.error("Error saving biometric setting:", error);
  }
}
