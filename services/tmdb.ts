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
  if (TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
    console.warn("TMDB API Key not set. Please update constants/api.ts");
    return [];
  }

  try {
    const encoded = encodeURIComponent(query);
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encoded}&language=th-TH&include_adult=false`;

    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`TMDB Error: ${response.status}`);

    const data: TMDBSearchResponse = await response.json();
    return data.results
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
  if (TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
    console.warn("TMDB API Key not set. Please update constants/api.ts");
    return [];
  }

  try {
    const encoded = encodeURIComponent(query);
    const url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encoded}&language=th-TH&include_adult=false`;

    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`TMDB Error: ${response.status}`);

    const data: TMDBSearchResponse = await response.json();
    return data.results
      .slice(0, 10)
      .map((item) => mapTMDBToSearchResult(item, type));
  } catch (error) {
    console.error("Error searching series:", error);
    return [];
  }
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (TMDB_API_KEY === "YOUR_TMDB_API_KEY_HERE") {
    console.warn("TMDB API Key not set");
    return [];
  }

  try {
    const encoded = encodeURIComponent(query);
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encoded}&language=th-TH&include_adult=false`;

    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`TMDB Error: ${response.status}`);

    const data: TMDBSearchResponse = await response.json();
    return data.results
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
