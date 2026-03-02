// ========================
// App Configuration
// ========================

export const APP_CONFIG = {
  name: "Watchlist App",
  version: "1.0.0",
} as const;

// ========================
// Timeouts (milliseconds)
// ========================

export const TIMEOUTS = {
  API: 10000,           // 10 seconds for API calls
  SPLASH: 500,          // Splash screen minimum display time
  DEBOUNCE: 400,        // Search debounce
  TOAST: 3000,          // Toast display duration
  RETRY_DELAY: 1000,    // Delay before retrying failed requests
  ANIMATION: 300,       // Standard animation duration
} as const;

// ========================
// API Rate Limits (milliseconds)
// ========================

export const RATE_LIMITS = {
  TMDB: 250,    // TMDB: ~40 requests per 10 seconds
  JIKAN: 334,   // Jikan: ~3 requests per second (safe margin)
} as const;

// ========================
// Pagination & Limits
// ========================

export const PAGINATION = {
  SEARCH_RESULTS: 10,
  DISCOVERY_ITEMS: 10,
  MAX_RETRIES: 2,
  MIN_SEARCH_LENGTH: 2,
} as const;

// ========================
// UI Configuration
// ========================

export const UI_CONFIG = {
  SWIPE_THRESHOLD: 100,
  DRAG_ACTIVATION_DISTANCE: 5,
  POSTER_ASPECT_RATIO: 1.5,  // 2:3 poster ratio
  HAPTIC_FEEDBACK: true,
} as const;

// ========================
// Cache Configuration
// ========================

export const CACHE_CONFIG = {
  IMAGE_MEMORY_LIMIT: 100 * 1024 * 1024,  // 100MB
  IMAGE_DISK_LIMIT: 500 * 1024 * 1024,    // 500MB
  MAX_AGE: 7 * 24 * 60 * 60 * 1000,       // 7 days
} as const;

// ========================
// Animation Configurations
// ========================

export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  SPRING: {
    damping: 15,
    stiffness: 150,
  },
} as const;

// ========================
// Validation Rules
// ========================

export const VALIDATION = {
  PIN_LENGTH: 4,
  MIN_SEARCH_LENGTH: 2,
  MAX_NOTE_LENGTH: 500,
  MAX_TITLE_LENGTH: 200,
} as const;
