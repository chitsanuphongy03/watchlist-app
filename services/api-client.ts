import { API_ERRORS, TIMEOUTS } from "@/constants/api";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

export class ApiRequestError extends Error implements ApiError {
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      isNetworkError?: boolean;
      isTimeout?: boolean;
    }
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status;
    this.code = options?.code;
    this.isNetworkError = options?.isNetworkError;
    this.isTimeout = options?.isTimeout;
  }
}

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = TIMEOUTS.API, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiRequestError(API_ERRORS.TIMEOUT_ERROR, {
          isTimeout: true,
          code: "TIMEOUT",
        });
      }
      throw new ApiRequestError(API_ERRORS.NETWORK_ERROR, {
        isNetworkError: true,
        code: "NETWORK_ERROR",
      });
    }
    throw error;
  }
}

/**
 * Parse API error to user-friendly message
 */
export function parseApiError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.isTimeout) return API_ERRORS.TIMEOUT_ERROR;
    if (error.isNetworkError) return API_ERRORS.NETWORK_ERROR;
    if (error.status && error.status >= 500) return API_ERRORS.SERVER_ERROR;
    if (error.status === 429) return API_ERRORS.RATE_LIMIT_ERROR;
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return API_ERRORS.UNKNOWN_ERROR;
}

/**
 * Rate limiter class for controlling API request frequency
 */
export class RateLimiter {
  private lastRequestTime = 0;
  private minInterval: number;

  constructor(minIntervalMs: number) {
    this.minInterval = minIntervalMs;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.wait();
    return fn();
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 2, retryDelay = 1000, shouldRetry } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) break;

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
