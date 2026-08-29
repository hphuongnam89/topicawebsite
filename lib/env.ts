
import 'server-only';
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://topicauni.edu.vn'),
});

const result = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `${issue.path.join('.')} : ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const siteUrl = new URL(result.data.NEXT_PUBLIC_SITE_URL);

if (siteUrl.username || siteUrl.password) {
  throw new Error('Public URLs must not contain credentials.');
}

if (process.env.NODE_ENV === 'production' && siteUrl.protocol !== 'https:' && siteUrl.hostname !== 'localhost') {
  throw new Error('Production site URLs must use HTTPS.');
}

export const env = Object.freeze(result.data);

