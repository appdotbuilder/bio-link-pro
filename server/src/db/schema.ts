
import { text, pgTable, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  theme: text('theme').notNull().default('light'), // 'light' | 'dark'
  is_premium: boolean('is_premium').notNull().default(false),
  subscription_id: text('subscription_id'),
  subscription_status: text('subscription_status'), // 'active' | 'inactive' | 'cancelled' | 'past_due'
  email_verified: boolean('email_verified').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const linksTable = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  icon: text('icon'),
  description: text('description'),
  order_index: integer('order_index').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  click_count: integer('click_count').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const pageAnalyticsTable = pgTable('page_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  page_views: integer('page_views').notNull().default(0),
  total_clicks: integer('total_clicks').notNull().default(0),
  unique_visitors: integer('unique_visitors').notNull().default(0),
  date: timestamp('date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const linkClicksTable = pgTable('link_clicks', {
  id: uuid('id').primaryKey().defaultRandom(),
  link_id: uuid('link_id').notNull().references(() => linksTable.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  referrer: text('referrer'),
  country: text('country'),
  clicked_at: timestamp('clicked_at').defaultNow().notNull(),
});

export const subscriptionsTable = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  stripe_subscription_id: text('stripe_subscription_id'),
  status: text('status').notNull(), // 'active' | 'inactive' | 'cancelled' | 'past_due'
  current_period_start: timestamp('current_period_start').notNull(),
  current_period_end: timestamp('current_period_end').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many, one }) => ({
  links: many(linksTable),
  pageAnalytics: many(pageAnalyticsTable),
  linkClicks: many(linkClicksTable),
  subscription: one(subscriptionsTable, {
    fields: [usersTable.subscription_id],
    references: [subscriptionsTable.id],
  }),
}));

export const linksRelations = relations(linksTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [linksTable.user_id],
    references: [usersTable.id],
  }),
  clicks: many(linkClicksTable),
}));

export const pageAnalyticsRelations = relations(pageAnalyticsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [pageAnalyticsTable.user_id],
    references: [usersTable.id],
  }),
}));

export const linkClicksRelations = relations(linkClicksTable, ({ one }) => ({
  link: one(linksTable, {
    fields: [linkClicksTable.link_id],
    references: [linksTable.id],
  }),
  user: one(usersTable, {
    fields: [linkClicksTable.user_id],
    references: [usersTable.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [subscriptionsTable.user_id],
    references: [usersTable.id],
  }),
}));

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  links: linksTable,
  pageAnalytics: pageAnalyticsTable,
  linkClicks: linkClicksTable,
  subscriptions: subscriptionsTable,
};
