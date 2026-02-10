/**
 * Watchlist Store - Manages watchlist items, ranking, and status
 */

import { scheduleNextItemNotification } from "@/services/notifications";
import { getWatchlist, saveWatchlist } from "@/services/storage";
import type {
  ContentFilter,
  SearchResult,
  StatusFilter,
  WatchlistItem,
  WatchStatus,
} from "@/types";
import { create } from "zustand";

interface WatchlistState {
  items: WatchlistItem[];
  isLoading: boolean;
  contentFilter: ContentFilter;
  statusFilter: StatusFilter;

  // Actions
  initialize: () => Promise<void>;
  addItem: (result: SearchResult) => Promise<void>;
  addCustomItem: (
    item: Omit<WatchlistItem, "id" | "rank" | "addedAt" | "updatedAt">,
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateStatus: (id: string, status: WatchStatus) => Promise<void>;
  updateNote: (id: string, note: string) => Promise<void>;
  reorder: (items: WatchlistItem[]) => Promise<void>;
  moveUp: (id: string) => Promise<void>;
  moveDown: (id: string) => Promise<void>;
  setContentFilter: (filter: ContentFilter) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  isInWatchlist: (sourceId: string, source: string) => boolean;

  // Computed
  getFilteredItems: () => WatchlistItem[];
  getNextItem: () => WatchlistItem | null;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: [],
  isLoading: true,
  contentFilter: "all",
  statusFilter: "all",

  initialize: async () => {
    try {
      const items = await getWatchlist();

      // Auto-heal: Normalize ranks for unwatched items
      const activeItems = items
        .filter((i) => i.status !== "watched")
        .sort((a, b) => a.rank - b.rank);

      const watchedItems = items.filter((i) => i.status === "watched");

      // Apply new ranks 1..N
      const normalizedActive = activeItems.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      const normalizedItems = [...normalizedActive, ...watchedItems];

      // If ranks changed, save
      if (JSON.stringify(items) !== JSON.stringify(normalizedItems)) {
        await saveWatchlist(normalizedItems);
      }

      set({ items: normalizedItems, isLoading: false });
    } catch (error) {
      console.error("Watchlist init error:", error);
      set({ isLoading: false });
    }
  },

  addItem: async (result: SearchResult) => {
    const { items } = get();
    const newRank = items.length + 1;

    const newItem: WatchlistItem = {
      id: `${result.source}-${result.sourceId}-${Date.now()}`,
      title: result.title,
      titleTh: result.titleTh,
      type: result.type,
      posterUrl: result.posterUrl,
      overview: result.overview,
      year: result.year,
      genre: result.genre,
      rank: newRank,
      status: "not_watched",
      source: result.source,
      sourceId: result.sourceId,
      episodes: result.episodes,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [...items, newItem];
    set({ items: updated });
    await saveWatchlist(updated);
  },

  addCustomItem: async (itemData) => {
    const { items } = get();
    const newRank = items.length + 1;

    const newItem: WatchlistItem = {
      ...itemData,
      id: `custom-${Date.now()}`,
      rank: newRank,
      addedAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [...items, newItem];
    set({ items: updated });
    await saveWatchlist(updated);
  },

  removeItem: async (id: string) => {
    const { items } = get();
    const filtered = items.filter((item) => item.id !== id);
    // Re-rank remaining items
    const reranked = filtered.map((item, index) => ({
      ...item,
      rank: index + 1,
      updatedAt: Date.now(),
    }));
    set({ items: reranked });
    await saveWatchlist(reranked);
  },

  updateStatus: async (id: string, status: WatchStatus) => {
    const { items } = get();

    const targetItem = items.find((i) => i.id === id);
    if (!targetItem) return;
    if (targetItem.status === status) return;

    const updatedTarget = { ...targetItem, status, updatedAt: Date.now() };
    const otherItems = items.filter((i) => i.id !== id);

    let newItems: WatchlistItem[] = [];

    if (status === "watched") {
      const activeItems = otherItems
        .filter((i) => i.status !== "watched")
        .sort((a, b) => a.rank - b.rank)
        .map((item, index) => ({ ...item, rank: index + 1 }));

      const watchedItems = otherItems.filter((i) => i.status === "watched");

      newItems = [...activeItems, ...watchedItems, updatedTarget];

      if (activeItems.length > 0) {
        scheduleNextItemNotification(targetItem.title, activeItems[0].title);
      }
    } else if (targetItem.status === "watched") {
      const activeItems = otherItems.filter((i) => i.status !== "watched");
      const watchedItems = otherItems.filter((i) => i.status === "watched");

      updatedTarget.rank = activeItems.length + 1;

      newItems = [...activeItems, updatedTarget, ...watchedItems];
    } else {
      newItems = items.map((i) => (i.id === id ? updatedTarget : i));
    }

    set({ items: newItems });
    await saveWatchlist(newItems);
  },

  updateNote: async (id: string, note: string) => {
    const { items } = get();
    const updated = items.map((item) =>
      item.id === id ? { ...item, note, updatedAt: Date.now() } : item,
    );
    set({ items: updated });
    await saveWatchlist(updated);
  },

  reorder: async (reorderedItems: WatchlistItem[]) => {
    const reranked = reorderedItems.map((item, index) => ({
      ...item,
      rank: index + 1,
      updatedAt: Date.now(),
    }));
    set({ items: reranked });
    await saveWatchlist(reranked);
  },

  moveUp: async (id: string) => {
    const { items } = get();
    const index = items.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    const reranked = newItems.map((item, i) => ({
      ...item,
      rank: i + 1,
      updatedAt: Date.now(),
    }));
    set({ items: reranked });
    await saveWatchlist(reranked);
  },

  moveDown: async (id: string) => {
    const { items } = get();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1 || index >= items.length - 1) return;

    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [
      newItems[index + 1],
      newItems[index],
    ];
    const reranked = newItems.map((item, i) => ({
      ...item,
      rank: i + 1,
      updatedAt: Date.now(),
    }));
    set({ items: reranked });
    await saveWatchlist(reranked);
  },

  setContentFilter: (filter: ContentFilter) => set({ contentFilter: filter }),
  setStatusFilter: (filter: StatusFilter) => set({ statusFilter: filter }),

  isInWatchlist: (sourceId: string, source: string) => {
    return get().items.some(
      (item) => item.sourceId === sourceId && item.source === source,
    );
  },

  getFilteredItems: () => {
    const { items, contentFilter, statusFilter } = get();
    return items
      .filter((item) => contentFilter === "all" || item.type === contentFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .sort((a, b) => a.rank - b.rank);
  },

  getNextItem: () => {
    const { items } = get();
    return (
      items
        .filter((item) => item.status !== "watched")
        .sort((a, b) => a.rank - b.rank)[0] || null
    );
  },
}));
