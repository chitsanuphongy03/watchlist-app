/**
 * Watchlist App Theme
 * Dark theme with red-magenta accent
 */

// ========================
// Brand Colors
// ========================

export const Accent = {
  primary: "#FF2D55", // iOS Hero Red
  secondary: "#FF375F",
  gradient: ["#FF2D55", "#FF375F"] as [string, string],
};

export const Colors = {
  dark: {
    background: "#000000",
    surface: "#1C1C1E", // iOS Dark Grey
    card: "#1C1C1E",
    border: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#EBEBF5",
    textMuted: "#8E8E93",
    error: "#FF453A",
    success: "#32D74B",
    pinDot: "#3A3A3C",
    statusNotWatched: "#8E8E93",
    statusWatching: "#0A84FF",
    statusWatched: "#30D158",
    tabIconDefault: "#8E8E93", // Added back
  },
} as const;

// ========================
// Typography
// ========================

export const FontFamily = {
  // Use EXACT Expo Google Font names to ensure they work on all devices
  regular: "NotoSansThai_400Regular",
  medium: "NotoSansThai_500Medium",
  semibold: "NotoSansThai_600SemiBold",
  bold: "NotoSansThai_700Bold",
  heavy: "NotoSansThai_700Bold", // Fallback to Bold

  // Explicit Thai names
  thaiRegular: "NotoSansThai_400Regular",
  thaiMedium: "NotoSansThai_500Medium",
  thaiSemiBold: "NotoSansThai_600SemiBold",
  thaiBold: "NotoSansThai_700Bold",

  // Inter (English Only)
  interRegular: "Inter_400Regular",
  interBold: "Inter_700Bold",
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 34,
  title: 34,
  subtitle: 20,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,
};

// ========================
// Spacing & Layout
// ========================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: "#FF2D55",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: "#FF2D55",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
};

// ========================
// Content Labels (TH)
// ========================

export const ContentTypeLabel: Record<string, string> = {
  movie: "หนัง",
  anime: "อนิเมะ",
  series: "ซีรีส์",
  tokusatsu: "โทคุซัทสึ",
  all: "ทั้งหมด",
};

export const WatchStatusLabel: Record<string, string> = {
  not_watched: "อยู่ในลิสต์",
  watching: "กำลังดู",
  watched: "ดูแล้ว",
};
