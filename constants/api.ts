// ========================
// API Configuration
// ========================

// TMDB API
// Set your API key in .env file: EXPO_PUBLIC_TMDB_API_KEY=your_key_here
export const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? "";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
export const TMDB_POSTER_SIZE = "w500";

// Jikan API (MyAnimeList Unofficial)
export const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Rate limits
export const TMDB_RATE_LIMIT_MS = 250;
export const JIKAN_RATE_LIMIT_MS = 334;

// Search debounce
export const SEARCH_DEBOUNCE_MS = 400;
