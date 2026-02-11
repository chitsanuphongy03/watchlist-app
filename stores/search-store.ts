import { searchAnime } from "@/services/jikan";
import {
  searchMovies,
  searchSeries,
  searchAll as tmdbSearchAll,
} from "@/services/tmdb";
import type { ContentFilter, SearchResult } from "@/types";
import { create } from "zustand";

interface SearchState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  activeFilter: ContentFilter;
  hasSearched: boolean;

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
