import "server-only";

import { z } from "zod";
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

async function request(endpoint: string, options: WordPressFetchOptions): Promise<Response> {
  const url = buildUrl(endpoint, options.params);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      redirect: "error",
      signal: controller.signal,
      next: {
        revalidate: options.revalidate ?? env.CMS_REVALIDATE_SECONDS,
        tags: ["wordpress", ...(options.tags ?? [])],
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress request failed with status ${response.status}.`);
    }

    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("WordPress request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function wordpressCollection<T>(
  endpoint: string,
  itemSchema: z.ZodType<T>,
  options: WordPressFetchOptions = {},
): Promise<WordPressCollection<T>> {
  const response = await request(endpoint, options);
  const payload: unknown = await response.json();
  const result = z.array(itemSchema).safeParse(payload);

  if (!result.success) {
    throw new Error(`WordPress collection validation failed for ${endpoint}.`);
  }

  return {
    items: result.data,
    total: Number(response.headers.get("X-WP-Total") ?? result.data.length),
    totalPages: Number(response.headers.get("X-WP-TotalPages") ?? 1),
  };
}
