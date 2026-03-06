import {
  ENDPOINTS,
  JIKAN_BASE_URL,
  RATE_LIMITS
} from "@/constants/api";
import { PAGINATION, TIMEOUTS } from "@/constants/config";
import type {
  JikanAnimeResult,
  JikanSearchResponse,
  SearchResult,
} from "@/types";
import {
  ApiRequestError,
  fetchWithTimeout,
  RateLimiter,
  withRetry,
} from "./api-client";

const rateLimiter = new RateLimiter(RATE_LIMITS.JIKAN);

interface FetchOptions {
  retries?: number;
  timeout?: number;
}

async function fetchJikan<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { retries = PAGINATION.MAX_RETRIES, timeout = TIMEOUTS.API } = options;

  return withRetry(
    async () => {
      await rateLimiter.wait();

      const url = `${JIKAN_BASE_URL}${endpoint}`;
      const response = await fetchWithTimeout(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "WatchlistApp/1.0",
        },
        timeout,
      });

      if (!response.ok) {
        throw new ApiRequestError(`Jikan API Error: ${response.status}`, {
          status: response.status,
          code: "API_ERROR",
        });
      }

      return response.json() as Promise<T>;
    },
    {
      maxRetries: retries,
      retryDelay: TIMEOUTS.RETRY_DELAY,
      shouldRetry: (error) => {
        // Retry on network errors and 5xx errors
        if (error instanceof ApiRequestError) {
          return (
            error.isNetworkError ||
            error.isTimeout ||
            (error.status && error.status >= 500) ||
            false
          );
        }
        return false;
      },
    },
  );
}

function mapJikanToSearchResult(item: JikanAnimeResult): SearchResult | null {
  // Validate required fields
  if (!item || typeof item.mal_id !== "number") {
    console.warn("[Jikan] Invalid item:", item);
    return null;
  }

  const year = item.aired?.from
    ? new Date(item.aired.from).getFullYear().toString()
    : undefined;

  // Safely get poster URL with fallbacks
  let posterUrl: string | undefined;
  try {
    posterUrl =
      item.images?.jpg?.large_image_url ??
      item.images?.jpg?.image_url ??
      item.images?.webp?.large_image_url ??
      item.images?.webp?.image_url ??
      undefined;
  } catch {
    posterUrl = undefined;
  }

  return {
    id: `jikan-${item.mal_id}`,
    title: item.title || "Unknown Title",
    titleTh: item.title_japanese,
    type: "anime",
    posterUrl,
    overview: item.synopsis || undefined,
    year,
    genre: item.genres?.map((g) => g.name),
    episodes: item.episodes || undefined,
    source: "jikan",
    sourceId: item.mal_id.toString(),
  };
}

export async function searchAnime(query: string): Promise<SearchResult[]> {
  try {
    if (!query.trim()) return [];

    const encoded = encodeURIComponent(query.trim());
    const endpoint = `${ENDPOINTS.jikan.searchAnime}?q=${encoded}&limit=${PAGINATION.SEARCH_RESULTS}&sfw=true`;

    const data = await fetchJikan<JikanSearchResponse>(endpoint);

    return (
      data.data
        ?.map(mapJikanToSearchResult)
        .filter((item): item is SearchResult => item !== null) || []
    );
  } catch (error) {
    console.error("[Jikan] Error searching anime:", error);
    return [];
  }
}

export async function getAnimeDetails(
  malId: string,
): Promise<SearchResult | null> {
  try {
    if (!malId) return null;

    const endpoint = ENDPOINTS.jikan.animeDetails(malId);
    const data = await fetchJikan<{ data: JikanAnimeResult }>(endpoint);
    return mapJikanToSearchResult(data.data);
  } catch (error) {
    console.error("[Jikan] Error fetching anime details:", error);
    return null;
  }
}

export async function getSeasonNowAnime(): Promise<SearchResult[]> {
  try {
    const endpoint = `${ENDPOINTS.jikan.seasonNow}?limit=${PAGINATION.DISCOVERY_ITEMS}&sfw=true`;

    const data = await fetchJikan<JikanSearchResponse>(endpoint);

    return (
      data.data
        ?.map(mapJikanToSearchResult)
        .filter((item): item is SearchResult => item !== null) || []
    );
  } catch (error) {
    console.error("[Jikan] Error fetching season now anime:", error);
    return [];
  }
}
