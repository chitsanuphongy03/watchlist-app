import {
    cancelAllNotifications,
    cancelNotificationsByType,
    requestPermissions,
    scheduleInactivityReminder,
    scheduleReminder,
} from "@/services/notifications";
import {
    getNotificationSettings,
    saveNotificationSettings,
} from "@/services/storage";
import type { NotificationSettings, ReminderFrequency } from "@/types";
import { create } from "zustand";

interface SettingsState {
  notificationSettings: NotificationSettings;
  isLoading: boolean;
  permissionGranted: boolean;

  // Actions
  initialize: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleNextItemNotification: (enabled: boolean) => Promise<void>;
  toggleReminder: (enabled: boolean) => Promise<void>;
  setReminderTime: (time: string) => Promise<void>;
  setReminderFrequency: (frequency: ReminderFrequency) => Promise<void>;
  toggleInactivity: (enabled: boolean) => Promise<void>;
  setInactivityDays: (days: number) => Promise<void>;
  updateReminderSchedule: (topItemTitle?: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notificationSettings: {
    enabled: true,
    nextItemEnabled: true,
    reminderEnabled: false,
    reminderTime: "20:00",
    reminderFrequency: "daily",
    inactivityEnabled: true,
    inactivityDays: 3,
  },
  isLoading: true,
  permissionGranted: false,

  initialize: async () => {
    try {
      const settings = await getNotificationSettings();
      set({ notificationSettings: settings, isLoading: false });
    } catch (error) {
      console.error("Settings init error:", error);
      set({ isLoading: false });
    }
  },

  requestNotificationPermission: async () => {
    const granted = await requestPermissions();
    set({ permissionGranted: granted });
    return granted;
  },

  toggleNotifications: async (enabled: boolean) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, enabled };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);

    if (!enabled) {
      await cancelAllNotifications();
    }
  },

  toggleNextItemNotification: async (enabled: boolean) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, nextItemEnabled: enabled };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);
  },

  toggleReminder: async (enabled: boolean) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, reminderEnabled: enabled };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);

    if (!enabled) {
      await cancelNotificationsByType("reminder");
    }
  },

  setReminderTime: async (time: string) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, reminderTime: time };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);
  },

  setReminderFrequency: async (frequency: ReminderFrequency) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, reminderFrequency: frequency };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);
  },

  toggleInactivity: async (enabled: boolean) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, inactivityEnabled: enabled };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);

    if (!enabled) {
      await cancelNotificationsByType("inactivity");
    } else {
      await scheduleInactivityReminder(updated.inactivityDays);
    }
  },

  setInactivityDays: async (days: number) => {
    const { notificationSettings } = get();
    const updated = { ...notificationSettings, inactivityDays: days };
    set({ notificationSettings: updated });
    await saveNotificationSettings(updated);

    if (updated.inactivityEnabled) {
      await scheduleInactivityReminder(days);
    }
  },

  updateReminderSchedule: async (topItemTitle?: string) => {
    const { notificationSettings } = get();
    if (!notificationSettings.reminderEnabled || !topItemTitle) {
      await cancelNotificationsByType("reminder");
      return;
    }

    await scheduleReminder(
      topItemTitle,
      notificationSettings.reminderTime,
      notificationSettings.reminderFrequency,
    );
  },
}));
