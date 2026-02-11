import { getSeasonNowAnime, searchAnime } from "@/services/jikan";
import {
  getNowPlayingMovies,
  getOnTheAirSeries,
  searchMovies,
  searchSeries,
  searchTokusatsu,
  searchAll as tmdbSearchAll,
} from "@/services/tmdb";
import type { ContentFilter, SearchResult } from "@/types";
import { create } from "zustand";

interface DiscoveryState {
  movies: SearchResult[];
  series: SearchResult[];
  anime: SearchResult[];
  tokusatsu: SearchResult[];
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  activeFilter: ContentFilter;
  hasSearched: boolean;

  discovery: DiscoveryState;
  isDiscoveryLoading: boolean;
  fetchDiscovery: () => Promise<void>;

  setQuery: (query: string) => void;
  setActiveFilter: (filter: ContentFilter) => void;
  searchAll: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  isLoading: false,
  activeFilter: "all",
  hasSearched: false,

  discovery: { movies: [], series: [], anime: [], tokusatsu: [] },
  isDiscoveryLoading: false,

  fetchDiscovery: async () => {
    const { discovery } = get();
    const hasData =
      discovery.movies.length > 0 ||
      discovery.series.length > 0 ||
      discovery.anime.length > 0 ||
      discovery.tokusatsu.length > 0;
    if (hasData) return;

    set({ isDiscoveryLoading: true });
    try {
      const results = await Promise.allSettled([
        getNowPlayingMovies(),
        getOnTheAirSeries(),
        getSeasonNowAnime(),
        searchTokusatsu(),
      ]);

      const movies = results[0].status === "fulfilled" ? results[0].value : [];
      const series = results[1].status === "fulfilled" ? results[1].value : [];
      const anime = results[2].status === "fulfilled" ? results[2].value : [];
      const tokusatsu =
        results[3].status === "fulfilled" ? results[3].value : [];

      set({
        discovery: { movies, series, anime, tokusatsu },
        isDiscoveryLoading: false,
      });
    } catch (error) {
      console.error("Discovery fetch error:", error);
      set({ isDiscoveryLoading: false });
    }
  },

  setQuery: (query: string) => set({ query }),

  setActiveFilter: (filter: ContentFilter) => {
    set({ activeFilter: filter });
    const { query } = get();
    if (query.trim().length >= 2) {
      get().searchAll(query);
    }
  },

  searchAll: async (query: string) => {
    if (query.trim().length < 2) {
      set({ results: [], hasSearched: false });
      return;
    }

    set({ isLoading: true, query, hasSearched: true });

    try {
      const { activeFilter } = get();
      let results: SearchResult[] = [];

      switch (activeFilter) {
        case "movie":
          results = await searchMovies(query);
          break;
        case "anime":
          results = await searchAnime(query);
          break;
        case "series":
          results = await searchSeries(query, "series");
          break;
        case "tokusatsu":
          results = await searchSeries(query, "tokusatsu");
          break;
        case "all":
        default: {
          const [tmdbResults, animeResults] = await Promise.all([
            tmdbSearchAll(query),
            searchAnime(query),
          ]);
          results = [...tmdbResults, ...animeResults];
          break;
        }
      }

      const seen = new Set<string>();
      const deduped = results.filter((item) => {
        const key = item.title.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      set({ results: deduped, isLoading: false });
    } catch (error) {
      console.error("Search error:", error);
      set({ results: [], isLoading: false });
    }
  },

  clearResults: () => {
    set({ query: "", results: [], hasSearched: false, activeFilter: "all" });
  },
}));
