import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertConfig {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

interface UIState {
  alert: AlertConfig | null;
  toast: ToastConfig | null;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  alert: null,
  toast: null,

  showAlert: (config) => set({ alert: config }),
  hideAlert: () => set({ alert: null }),

  showToast: (config) => {
    set({ toast: config });
    // Auto hide toast
    setTimeout(() => {
      set((state) =>
        state.toast?.message === config.message ? { toast: null } : state,
      );
    }, config.duration || 3000);
  },
  hideToast: () => set({ toast: null }),
}));
