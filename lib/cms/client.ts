import "server-only";

import { z } from "zod";
import { cache } from "react";
import { env } from "@/lib/env";

type QueryValue = string | number | boolean | readonly number[] | undefined;

interface WordPressFetchOptions {
  params?: Record<string, QueryValue>;
  tags?: string[];
  revalidate?: number;
}

export interface WordPressCollection<T> {
  items: T[];
  total: number;
  totalPages: number;
}

function buildUrl(endpoint: string, params: Record<string, QueryValue> = {}): URL {
  if (!endpoint.startsWith("/") || endpoint.startsWith("//")) {
    throw new Error("WordPress endpoint must be a relative API path.");
  }

  const apiBase = env.WORDPRESS_API_URL.replace(/\/$/, "");
  const url = new URL(`${apiBase}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }

  return url;
}

// Share parsed responses within one render, including metadata. A custom abort
// signal opts out of Next's automatic fetch memoization.
const request = cache(async (url: string, revalidate: number, tags: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4_000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: controller.signal,
      next: {
        revalidate,
        tags: JSON.parse(tags) as string[],
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress request failed with status ${response.status}.`);
    }

    // Keep the timeout active while reading the body as well as the headers.
    const payload: unknown = await response.json();
    return {
      payload,
      total: response.headers.get("X-WP-Total"),
      totalPages: response.headers.get("X-WP-TotalPages"),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("WordPress request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
});

export async function wordpressCollection<T>(
  endpoint: string,
  itemSchema: z.ZodType<T>,
  options: WordPressFetchOptions = {},
): Promise<WordPressCollection<T>> {
  const response = await request(
    buildUrl(endpoint, options.params).href,
    options.revalidate ?? env.CMS_REVALIDATE_SECONDS,
    JSON.stringify(["wordpress", ...(options.tags ?? [])].sort()),
  );
  const result = z.array(itemSchema).safeParse(response.payload);

  if (!result.success) {
    throw new Error(`WordPress collection validation failed for ${endpoint}.`);
  }

  return {
    items: result.data,
    total: Number(response.total ?? result.data.length),
    totalPages: Number(response.totalPages ?? 1),
  };
}
