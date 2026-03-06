import {
    ENDPOINTS,
    isTmdbApiKeyAvailable,
    RATE_LIMITS,
    TMDB_API_KEY,
    TMDB_BASE_URL,
    TMDB_IMAGE_BASE_URL,
    TMDB_POSTER_SIZE
} from "@/constants/api";
import { PAGINATION, TIMEOUTS } from "@/constants/config";
import type {
    ContentType,
    SearchResult,
    TMDBSearchResponse,
    TMDBSearchResult,
} from "@/types";
import {
    ApiRequestError,
    fetchWithTimeout,
    RateLimiter,
    withRetry,
} from "./api-client";

const rateLimiter = new RateLimiter(RATE_LIMITS.TMDB);

interface FetchOptions {
  retries?: number;
  timeout?: number;
}

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
  options: FetchOptions = {},
): Promise<T | null> {
  // Check if API key is available
  if (!isTmdbApiKeyAvailable()) {
    console.warn("TMDB API Key not set");
    return null;
  }

  const { retries = PAGINATION.MAX_RETRIES, timeout = TIMEOUTS.API } = options;

  return withRetry(
    async () => {
      await rateLimiter.wait();

      const searchParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: "th-TH",
        include_adult: "false",
        ...params,
      });

      const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;
      const response = await fetchWithTimeout(url, { timeout });

      if (!response.ok) {
        throw new ApiRequestError(`TMDB API Error: ${response.status}`, {
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

function getPosterUrl(posterPath: string | null): string | undefined {
  if (!posterPath) return undefined;
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_POSTER_SIZE}${posterPath}`;
}

function mapTMDBToSearchResult(
  item: TMDBSearchResult,
  type: ContentType,
): SearchResult {
  return {
    id: `tmdb-${item.id}`,
    title: item.title || item.name || "Unknown",
    type,
    posterUrl: getPosterUrl(item.poster_path),
    overview: item.overview,
    year: (item.release_date || item.first_air_date || "").substring(0, 4),
    source: "tmdb",
    sourceId: item.id.toString(),
  };
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  try {
    if (!query.trim()) return [];

    const data = await fetchTMDB<TMDBSearchResponse>(
      ENDPOINTS.tmdb.searchMovie,
      { query: query.trim() },
    );

    if (!data) return [];

    return data.results
      .slice(0, PAGINATION.SEARCH_RESULTS)
      .map((item) => mapTMDBToSearchResult(item, "movie"));
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

export async function searchSeries(
  query: string,
  type: "series" | "tokusatsu" = "series",
): Promise<SearchResult[]> {
  try {
    if (!query.trim()) return [];

    const data = await fetchTMDB<TMDBSearchResponse>(ENDPOINTS.tmdb.searchTv, {
      query: query.trim(),
    });

    if (!data) return [];

    return data.results
      .slice(0, PAGINATION.SEARCH_RESULTS)
      .map((item) => mapTMDBToSearchResult(item, type));
  } catch (error) {
    console.error("Error searching series:", error);
    return [];
  }
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  try {
    if (!query.trim()) return [];

    const data = await fetchTMDB<TMDBSearchResponse>(
      ENDPOINTS.tmdb.searchMulti,
      { query: query.trim() },
    );

    if (!data) return [];

    return data.results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, PAGINATION.SEARCH_RESULTS)
      .map((item) =>
        mapTMDBToSearchResult(
          item,
          item.media_type === "movie" ? "movie" : "series",
        ),
      );
  } catch (error) {
    console.error("Error searching TMDB:", error);
    return [];
  }
}

export async function getNowPlayingMovies(): Promise<SearchResult[]> {
  try {
    const data = await fetchTMDB<TMDBSearchResponse>(
      ENDPOINTS.tmdb.movieNowPlaying,
      { page: "1" },
    );

    if (!data) return [];

    return data.results
      .slice(0, PAGINATION.DISCOVERY_ITEMS)
      .map((item) => mapTMDBToSearchResult(item, "movie"));
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return [];
  }
}

export async function getOnTheAirSeries(): Promise<SearchResult[]> {
  try {
    const data = await fetchTMDB<TMDBSearchResponse>(
      ENDPOINTS.tmdb.tvOnTheAir,
      { page: "1" },
    );

    if (!data) return [];

    return data.results
      .slice(0, PAGINATION.DISCOVERY_ITEMS)
      .map((item) => mapTMDBToSearchResult(item, "series"));
  } catch (error) {
    console.error("Error fetching on the air series:", error);
    return [];
  }
}

export async function searchTokusatsu(): Promise<SearchResult[]> {
  try {
    const data = await fetchTMDB<TMDBSearchResponse>(ENDPOINTS.tmdb.searchTv, {
      query: "Tokusatsu",
    });

    if (!data) return [];

    const sortedResults = data.results.sort((a, b) => {
      const dateA = a.first_air_date || a.release_date || "";
      const dateB = b.first_air_date || b.release_date || "";
      return dateB.localeCompare(dateA);
    });

    return sortedResults
      .slice(0, PAGINATION.DISCOVERY_ITEMS)
      .map((item) => mapTMDBToSearchResult(item, "tokusatsu"));
  } catch (error) {
    console.error("Error searching tokusatsu:", error);
    return [];
  }
}

export async function getTmdbDetails(
  id: string,
  type: ContentType,
): Promise<SearchResult | null> {
  try {
    if (!id) return null;

    const endpoint =
      type === "movie"
        ? ENDPOINTS.tmdb.movieDetails(id)
        : ENDPOINTS.tmdb.tvDetails(id);

    // Use any as detail response has more fields than TMDBSearchResult
    const data = await fetchTMDB<any>(endpoint);

    if (!data) return null;

    const year = (data.release_date || data.first_air_date || "").substring(
      0,
      4,
    );

    return {
      id: `tmdb-${data.id}`,
      title: data.title || data.name || "Unknown",
      type: type,
      posterUrl: getPosterUrl(data.poster_path),
      overview: data.overview,
      year: year,
      genre: data.genres?.map((g: any) => g.name),
      episodes: data.number_of_episodes,
      source: "tmdb",
      sourceId: data.id.toString(),
    };
  } catch (error) {
    console.error(`Error fetching TMDB details for ${type} ${id}:`, error);
    return null;
  }
}
