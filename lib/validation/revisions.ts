import { z } from "zod";
export const entityTypeSchema = z.enum([
  "article",
  "page",
  "program",
  "tuition_policy",
  "admission_round",
  "organization",
  "scholarship",
  "document",
]);
export const draftInputSchema = z
  .object({
    entityType: entityTypeSchema,
    entityId: z.string().trim().min(1).max(240),
    title: z.string().trim().min(1).max(240),
    payload: z.record(z.string(), z.unknown()),
    baseRevisionId: z.number().int().nonnegative(),
  })
  .strict();
export const transitionInputSchema = z
  .object({
    action: z.enum(["submit_review", "approve", "reject", "publish", "archive"]),
    expectedUpdatedAt: z.string().datetime(),
    reason: z.string().trim().max(1000).optional(),
    publishAt: z.string().datetime().optional(),
    expireAt: z.string().datetime().nullable().optional(),
    highlightUntil: z.string().datetime().nullable().optional(),
  })
  .strict();
