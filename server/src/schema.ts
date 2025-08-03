
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  display_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  bio: z.string().nullable(),
  theme: z.enum(['light', 'dark']).default('light'),
  is_premium: z.boolean().default(false),
  subscription_id: z.string().nullable(),
  subscription_status: z.enum(['active', 'inactive', 'cancelled', 'past_due']).nullable(),
  email_verified: z.boolean().default(false),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Link schema
export const linkSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  url: z.string().url(),
  icon: z.string().nullable(),
  description: z.string().nullable(),
  order_index: z.number().int(),
  is_active: z.boolean().default(true),
  click_count: z.number().int().default(0),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Link = z.infer<typeof linkSchema>;

// Page analytics schema
export const pageAnalyticsSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  page_views: z.number().int().default(0),
  total_clicks: z.number().int().default(0),
  unique_visitors: z.number().int().default(0),
  date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type PageAnalytics = z.infer<typeof pageAnalyticsSchema>;

// Link click tracking schema
export const linkClickSchema = z.object({
  id: z.string(),
  link_id: z.string(),
  user_id: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  referrer: z.string().nullable(),
  country: z.string().nullable(),
  clicked_at: z.coerce.date()
});

export type LinkClick = z.infer<typeof linkClickSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  stripe_subscription_id: z.string().nullable(),
  status: z.enum(['active', 'inactive', 'cancelled', 'past_due']),
  current_period_start: z.coerce.date(),
  current_period_end: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Input schemas for creating/updating
export const createUserInputSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().max(200).nullable().optional(),
  theme: z.enum(['light', 'dark']).optional()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(50).optional(),
  display_name: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().max(200).nullable().optional(),
  theme: z.enum(['light', 'dark']).optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const createLinkInputSchema = z.object({
  user_id: z.string(),
  title: z.string().min(1).max(100),
  url: z.string().url(),
  icon: z.string().nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  order_index: z.number().int().optional()
});

export type CreateLinkInput = z.infer<typeof createLinkInputSchema>;

export const updateLinkInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().max(200).nullable().optional(),
  order_index: z.number().int().optional(),
  is_active: z.boolean().optional()
});

export type UpdateLinkInput = z.infer<typeof updateLinkInputSchema>;

export const reorderLinksInputSchema = z.object({
  user_id: z.string(),
  link_orders: z.array(z.object({
    id: z.string(),
    order_index: z.number().int()
  }))
});

export type ReorderLinksInput = z.infer<typeof reorderLinksInputSchema>;

export const getUserPageInputSchema = z.object({
  username: z.string()
});

export type GetUserPageInput = z.infer<typeof getUserPageInputSchema>;

export const trackLinkClickInputSchema = z.object({
  link_id: z.string(),
  ip_address: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
  referrer: z.string().nullable().optional()
});

export type TrackLinkClickInput = z.infer<typeof trackLinkClickInputSchema>;

export const getAnalyticsInputSchema = z.object({
  user_id: z.string(),
  days: z.number().int().min(1).max(365).default(30)
});

export type GetAnalyticsInput = z.infer<typeof getAnalyticsInputSchema>;

export const createSubscriptionInputSchema = z.object({
  user_id: z.string(),
  stripe_subscription_id: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'cancelled', 'past_due'])
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>;
