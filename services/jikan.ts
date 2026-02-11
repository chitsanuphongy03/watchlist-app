import { JIKAN_BASE_URL, JIKAN_RATE_LIMIT_MS } from "@/constants/api";
import type {
    JikanAnimeResult,
    JikanSearchResponse,
    SearchResult,
} from "@/types";

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < JIKAN_RATE_LIMIT_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, JIKAN_RATE_LIMIT_MS - timeSinceLastRequest),
    );
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

function mapJikanToSearchResult(item: JikanAnimeResult): SearchResult {
  const year = item.aired?.from
    ? new Date(item.aired.from).getFullYear().toString()
    : undefined;

  return {
    id: `jikan-${item.mal_id}`,
    title: item.title,
    titleTh: item.title_japanese,
    type: "anime",
    posterUrl: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
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
    const encoded = encodeURIComponent(query);
    const url = `${JIKAN_BASE_URL}/anime?q=${encoded}&limit=10&sfw=true`;

    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`Jikan Error: ${response.status}`);

    const data: JikanSearchResponse = await response.json();
    return data.data.map(mapJikanToSearchResult);
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
}

export async function getAnimeDetails(
  malId: string,
): Promise<SearchResult | null> {
  try {
    const url = `${JIKAN_BASE_URL}/anime/${malId}`;

    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`Jikan Error: ${response.status}`);

    const data: { data: JikanAnimeResult } = await response.json();
    return mapJikanToSearchResult(data.data);
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
}
export async function getSeasonNowAnime(): Promise<SearchResult[]> {
  try {
    const url = `${JIKAN_BASE_URL}/seasons/now?limit=10&sfw=true`;
    const response = await rateLimitedFetch(url);
    if (!response.ok) throw new Error(`Jikan Error: ${response.status}`);

    const data: JikanSearchResponse = await response.json();
    return data.data.map(mapJikanToSearchResult);
  } catch (error) {
    console.error("Error fetching season now anime:", error);
    return [];
  }
}
