import * as SecureStorage from "@/services/secure-storage";
import { getBiometricEnabled, saveBiometricEnabled } from "@/services/storage";
import * as LocalAuthentication from "expo-local-authentication";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isPinSet: boolean;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  setupPin: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isPinSet: false,
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  isLoading: true,

  initialize: async () => {
    try {
      const pinSet = await SecureStorage.isPinSet();
      const biometricEnabled = await getBiometricEnabled();

      let biometricAvailable = false;
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        biometricAvailable = compatible && enrolled;
      } catch {
        biometricAvailable = false;
      }

      set({
        isPinSet: pinSet,
        isBiometricAvailable: biometricAvailable,
        isBiometricEnabled: biometricEnabled && biometricAvailable,
        isLoading: false,
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ isLoading: false });
    }
  },

  setupPin: async (pin: string) => {
    try {
      await SecureStorage.savePin(pin);
      set({ isPinSet: true, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error("Setup PIN error:", error);
      return false;
    }
  },

  verifyPin: async (pin: string) => {
    try {
      const valid = await SecureStorage.verifyPin(pin);
      if (valid) {
        set({ isAuthenticated: true });
      }
      return valid;
    } catch (error) {
      console.error("Verify PIN error:", error);
      return false;
    }
  },

  authenticateWithBiometric: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "ยืนยันตัวตนเพื่อเข้าใช้แอป",
        cancelLabel: "ใช้ PIN",
        disableDeviceFallback: true,
      });

      if (result.success) {
        set({ isAuthenticated: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Biometric auth error:", error);
      return false;
    }
  },

  toggleBiometric: async (enabled: boolean) => {
    await saveBiometricEnabled(enabled);
    set({ isBiometricEnabled: enabled });
  },

  changePin: async (oldPin: string, newPin: string) => {
    const valid = await SecureStorage.verifyPin(oldPin);
    if (!valid) return false;

    try {
      await SecureStorage.savePin(newPin);
      return true;
    } catch (error) {
      console.error("Change PIN error:", error);
      return false;
    }
  },

  logout: () => {
    set({ isAuthenticated: false });
  },
}));
