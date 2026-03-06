import { TIMEOUTS } from "@/constants/config";
import type { ContentFilter } from "@/types";
import { create } from "zustand";

interface SearchState {
  query: string;
  activeFilter: ContentFilter;
  debouncedQuery: string;

  setQuery: (query: string) => void;
  setActiveFilter: (filter: ContentFilter) => void;
  debouncedSearch: (query: string) => void;
  clearQuery: () => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  activeFilter: "all",
  debouncedQuery: "",

  setQuery: (query: string) => set({ query }),

  setActiveFilter: (filter: ContentFilter) => {
    set({ activeFilter: filter });
  },

  debouncedSearch: (query: string) => {
    set({ query });

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      set({ debouncedQuery: query });
    }, TIMEOUTS.DEBOUNCE);
  },

  clearQuery: () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    set({ query: "", debouncedQuery: "", activeFilter: "all" });
  },
}));
