import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";

// 30 days in milliseconds
export const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;
export const CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: CACHE_MAX_AGE,
      staleTime: 1000 * 60 * 60 * 24, // 1 day before refetching automatically
      retry: 2,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
});

/**
 * Get the current size of the React Query cache in Megabytes
 */
export async function getCacheSizeInMB(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    if (!data) return "0.00";

    // Calculate approximate byte size of the UTF-16 string
    const byteSize = new Blob([data]).size;
    const mbSize = byteSize / (1024 * 1024);

    return mbSize.toFixed(2);
  } catch (error) {
    console.error("Failed to calculate cache size:", error);
    return "0.00";
  }
}

/**
 * Clear all cached data
 */
export async function clearAppCache(): Promise<void> {
  try {
    // Clear the memory cache in TanStack
    queryClient.clear();
    // Clear the persistent storage
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}
