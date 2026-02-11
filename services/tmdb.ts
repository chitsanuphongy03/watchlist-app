import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
  TMDB_POSTER_SIZE,
  TMDB_RATE_LIMIT_MS,
} from "@/constants/api";
import type {
  ContentType,
  SearchResult,
  TMDBSearchResponse,
  TMDBSearchResult,
} from "@/types";

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < TMDB_RATE_LIMIT_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, TMDB_RATE_LIMIT_MS - timeSinceLastRequest),
    );
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

async function fetchFromTMDB(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<any> {
  if (!TMDB_API_KEY) {
    console.warn("TMDB API Key not set.");
    return null;
  }

  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "th-TH",
    include_adult: "false",
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;
  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    throw new Error(`TMDB Error: ${response.status}`);
  }

  return response.json();
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
    const data = await fetchFromTMDB("/search/movie", { query });
    if (!data) return [];

    return (data as TMDBSearchResponse).results
      .slice(0, 10)
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
    const data = await fetchFromTMDB("/search/tv", { query });
    if (!data) return [];

    return (data as TMDBSearchResponse).results
      .slice(0, 10)
      .map((item) => mapTMDBToSearchResult(item, type));
  } catch (error) {
    console.error("Error searching series:", error);
    return [];
  }
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  try {
    const data = await fetchFromTMDB("/search/multi", { query });
    if (!data) return [];

    return (data as TMDBSearchResponse).results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 10)
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
    const data = await fetchFromTMDB("/movie/now_playing", { page: "1" });
    if (!data) return [];

    return (data as TMDBSearchResponse).results
      .slice(0, 10)
      .map((item) => mapTMDBToSearchResult(item, "movie"));
  } catch (error) {
    console.error("Error fetching now playing movies:", error);
    return [];
  }
}

export async function getOnTheAirSeries(): Promise<SearchResult[]> {
  try {
    const data = await fetchFromTMDB("/tv/on_the_air", { page: "1" });
    if (!data) return [];

    return (data as TMDBSearchResponse).results
      .slice(0, 10)
      .map((item) => mapTMDBToSearchResult(item, "series"));
  } catch (error) {
    console.error("Error fetching on the air series:", error);
    return [];
  }
}

export async function searchTokusatsu(): Promise<SearchResult[]> {
  try {
    const data = await fetchFromTMDB("/search/tv", { query: "Tokusatsu" });
    if (!data) return [];

    const sortedResults = (data as TMDBSearchResponse).results.sort((a, b) => {
      const dateA = a.first_air_date || a.release_date || "";
      const dateB = b.first_air_date || b.release_date || "";
      return dateB.localeCompare(dateA);
    });

    return sortedResults
      .slice(0, 10)
      .map((item) => mapTMDBToSearchResult(item, "tokusatsu"));
  } catch (error) {
    console.error("Error searching tokusatsu:", error);
    return [];
  }
}
