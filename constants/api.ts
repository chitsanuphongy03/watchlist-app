import { RATE_LIMITS, TIMEOUTS } from "./config";
export { RATE_LIMITS, TIMEOUTS };

// ========================
// API Keys (from environment)
// ========================

export const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? "";

/**
 * Validate that required API keys are configured
 * @throws Error if API key is missing
 */
export function validateApiKeys(): void {
  if (!TMDB_API_KEY || TMDB_API_KEY.trim() === "") {
    console.error("❌ TMDB_API_KEY is not set!");
    console.error("   Please set EXPO_PUBLIC_TMDB_API_KEY in your .env file");
    console.error(
      "   Get your API key at: https://www.themoviedb.org/settings/api",
    );

    // In development, show warning but don't crash
    if (__DEV__) {
      console.warn(
        "⚠️  Running without TMDB API key. Some features may not work.",
      );
    }
  }
}

/**
 * Check if TMDB API key is available
 */
export function isTmdbApiKeyAvailable(): boolean {
  return !!TMDB_API_KEY && TMDB_API_KEY.trim() !== "";
}

// ========================
// API Base URLs
// ========================

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
export const TMDB_POSTER_SIZE = "w500";

export const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// ========================
// Rate Limits (re-export from config)
// ========================

export const TMDB_RATE_LIMIT_MS = RATE_LIMITS.TMDB;
export const JIKAN_RATE_LIMIT_MS = RATE_LIMITS.JIKAN;
export const SEARCH_DEBOUNCE_MS = TIMEOUTS.DEBOUNCE;

// ========================
// API Endpoints
// ========================

export const ENDPOINTS = {
  tmdb: {
    searchMovie: "/search/movie",
    searchTv: "/search/tv",
    searchMulti: "/search/multi",
    movieNowPlaying: "/movie/now_playing",
    tvOnTheAir: "/tv/on_the_air",
    movieDetails: (id: string) => `/movie/${id}`,
    tvDetails: (id: string) => `/tv/${id}`,
  },
  jikan: {
    searchAnime: "/anime",
    animeDetails: (id: string) => `/anime/${id}`,
    seasonNow: "/seasons/now",
  },
} as const;

// ========================
// API Error Messages
// ========================

export const API_ERRORS = {
  NETWORK_ERROR: "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้",
  TIMEOUT_ERROR: "การเชื่อมต่อใช้เวลานานเกินไป",
  RATE_LIMIT_ERROR: "กรุณารอสักครู่ก่อนลองใหม่",
  SERVER_ERROR: "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง",
  UNKNOWN_ERROR: "เกิดข้อผิดพลาดที่ไม่คาดคิด",
  NO_API_KEY: "กรุณาตั้งค่า API Key ก่อนใช้งาน",
} as const;
