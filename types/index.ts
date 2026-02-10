// ========================
// Content & Watchlist Types
// ========================

export type ContentType = "movie" | "anime" | "series" | "tokusatsu";

export type WatchStatus = "not_watched" | "watching" | "watched";

export type ContentSource = "tmdb" | "jikan" | "custom";

export interface WatchlistItem {
  id: string;
  title: string;
  titleTh?: string;
  type: ContentType;
  posterUrl?: string;
  overview?: string;
  year?: string;
  genre?: string[];
  rank: number;
  status: WatchStatus;
  source: ContentSource;
  sourceId?: string;
  episodes?: number;
  note?: string;
  addedAt: number;
  updatedAt: number;
}

// ========================
// Search Result Types
// ========================

export interface SearchResult {
  id: string;
  title: string;
  titleTh?: string;
  type: ContentType;
  posterUrl?: string;
  overview?: string;
  year?: string;
  genre?: string[];
  episodes?: number;
  source: ContentSource;
  sourceId: string;
}

// ========================
// TMDB API Types
// ========================

export interface TMDBSearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

// ========================
// Jikan API Types
// ========================

export interface JikanAnimeResult {
  mal_id: number;
  title: string;
  title_japanese?: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  synopsis: string | null;
  episodes: number | null;
  status: string;
  aired: {
    from: string | null;
    to: string | null;
  };
  genres: { mal_id: number; name: string }[];
}

export interface JikanSearchResponse {
  data: JikanAnimeResult[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

// ========================
// Notification Types
// ========================

export type ReminderFrequency = "daily" | "weekly";

export interface NotificationSettings {
  enabled: boolean;
  nextItemEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  reminderFrequency: ReminderFrequency;
  inactivityEnabled: boolean;
  inactivityDays: number;
}

// ========================
// Filter Types
// ========================

export type ContentFilter = "all" | ContentType;
export type StatusFilter = "all" | WatchStatus;
