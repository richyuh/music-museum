import { z } from "zod";
import { IMPACT_TIERS } from "./constants";

// ─── Album ──────────────────────────────────────────────────

export const albumCreateSchema = z.object({
  title: z.string().min(1).max(500),
  artistName: z.string().min(1).max(500),
  releaseYear: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  coverUrl: z.string().max(2000).optional().default(""),
  summary: z.string().max(5000).optional().nullable(),
  impactTier: z.enum(IMPACT_TIERS).optional().default("Notable"),
  impactScore: z.coerce.number().int().min(0).max(100).optional().default(50),
  genreIds: z.array(z.number().int().positive()).optional().default([]),
  linksJson: z.string().max(5000).optional().default("{}"),
  subgenresJson: z.string().max(2000).optional().default("[]"),
});

export const albumUpdateSchema = albumCreateSchema.partial();

export const albumQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(60),
  genre: z.string().max(100).optional(),
  yearMin: z.coerce.number().int().min(1900).max(2100).optional(),
  yearMax: z.coerce.number().int().min(1900).max(2100).optional(),
  tier: z.enum(IMPACT_TIERS).optional(),
  sort: z
    .enum(["impact-desc", "year-asc", "year-desc", "title-asc"])
    .optional()
    .default("impact-desc"),
});

// ─── Search ─────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

// ─── Room ───────────────────────────────────────────────────

export const roomCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
});

export const roomUpdateSchema = roomCreateSchema.partial();

// ─── Shared ─────────────────────────────────────────────────

export const albumIdBodySchema = z.object({
  albumId: z.coerce.number().int().positive(),
});

export const idParamSchema = z.coerce.number().int().positive();

// ─── Auth ───────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  name: z.string().min(1).max(200).optional(),
});
