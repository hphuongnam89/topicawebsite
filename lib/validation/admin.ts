import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

export const articleCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(240),
  excerpt: optionalText(1000),
  content_html: z.string().min(1).max(1_000_000),
  featured_image: optionalText(2000),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  tags: z.union([z.string().max(2000), z.array(z.string().max(100)).max(50)]).optional(),
  author_name: optionalText(200),
  is_featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo_title: optionalText(240),
  seo_description: optionalText(500),
  published_at: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Ngày đăng không hợp lệ").optional(),
}).strict();

export const articleUpdateSchema = articleCreateSchema.partial();
export const categorySchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(240),
  description: optionalText(1000),
}).strict();
export const leadStatusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["new", "contacted", "consulted", "cancelled"]),
}).strict();

export const adminUserSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(12).max(256),
  name: z.string().trim().min(1).max(200),
  role: z.enum(["admin", "editor"]).default("editor"),
}).strict();

const optionalUrl = z.union([z.literal(""), z.string().url()]).optional();
export const siteSettingsSchema = z.object({
  hotline: z.string().trim().max(50),
  email: z.string().trim().email().max(254),
  address: z.string().trim().max(300),
  facebook: optionalUrl,
  youtube: optionalUrl,
  zalo: optionalUrl,
  siteTitle: z.string().trim().max(240),
  siteDescription: z.string().trim().max(1000),
  telegramBotToken: z.string().max(300).optional(),
  telegramChatId: z.string().trim().max(100).optional(),
}).strict();
