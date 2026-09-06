import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://topicauni.edu.vn"),
  WORDPRESS_API_URL: z.string().url().default("https://topicauni.edu.vn/wp-json/wp/v2"),
  CMS_REVALIDATE_SECONDS: z.coerce.number().int().min(0).max(86_400).default(300),
});

const result = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
  CMS_REVALIDATE_SECONDS: process.env.CMS_REVALIDATE_SECONDS,
});

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `${issue.path.join(".")} : ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

const siteUrl = new URL(result.data.NEXT_PUBLIC_SITE_URL);
const wordpressUrl = new URL(result.data.WORDPRESS_API_URL);

if (siteUrl.username || siteUrl.password || wordpressUrl.username || wordpressUrl.password) {
  throw new Error("Public URLs must not contain credentials.");
}

if (
  process.env.NODE_ENV === "production" &&
  ((siteUrl.protocol !== "https:" && siteUrl.hostname !== "localhost") ||
    (wordpressUrl.protocol !== "https:" && wordpressUrl.hostname !== "localhost"))
) {
  throw new Error("Production site and WordPress URLs must use HTTPS.");
}

export const env = Object.freeze(result.data);
