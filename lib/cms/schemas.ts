import { z } from "zod";

const renderedSchema = z.object({
  rendered: z.string(),
  protected: z.boolean().optional(),
});

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonical: z.string().url().optional(),
    og_image: z
      .array(
        z.object({
          url: z.string().url(),
          width: z.number().optional(),
          height: z.number().optional(),
        }),
      )
      .optional(),
  })
  .passthrough();

const contentBaseSchema = z.object({
  id: z.number().int().positive(),
  date_gmt: z.string(),
  modified_gmt: z.string(),
  slug: z.string().min(1),
  status: z.literal("publish"),
  link: z.string().url(),
  title: renderedSchema,
  excerpt: renderedSchema,
  featured_media: z.number().int().nonnegative(),
  yoast_head_json: seoSchema.optional(),
});

export const wpPostSchema = contentBaseSchema.extend({
  content: renderedSchema,
  author: z.number().int().nonnegative(),
  categories: z.array(z.number().int().positive()),
  tags: z.array(z.number().int().positive()),
  sticky: z.boolean().default(false),
});

export const wpPostSummarySchema = contentBaseSchema.extend({
  author: z.number().int().nonnegative(),
  categories: z.array(z.number().int().positive()),
  tags: z.array(z.number().int().positive()),
  sticky: z.boolean().default(false),
});

export const wpPageSchema = contentBaseSchema.extend({
  content: renderedSchema,
  parent: z.number().int().nonnegative(),
});

export const wpCategorySchema = z.object({
  id: z.number().int().positive(),
  count: z.number().int().nonnegative(),
  description: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const wpTagSchema = wpCategorySchema;

export const wpMediaSchema = z.object({
  id: z.number().int().positive(),
  source_url: z.string().url(),
  alt_text: z.string().default(""),
  caption: renderedSchema.optional(),
  media_details: z
    .object({
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
    })
    .passthrough()
    .optional(),
});

export const wpAuthorSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  avatar_urls: z.record(z.string(), z.string().url()).optional(),
});

export type WpPost = z.infer<typeof wpPostSchema>;
export type WpPostSummary = z.infer<typeof wpPostSummarySchema>;
export type WpPage = z.infer<typeof wpPageSchema>;
export type WpCategory = z.infer<typeof wpCategorySchema>;
export type WpTag = z.infer<typeof wpTagSchema>;
export type WpMedia = z.infer<typeof wpMediaSchema>;
