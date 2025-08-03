
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, pageAnalyticsTable } from '../db/schema';
import { type GetAnalyticsInput, type CreateUserInput } from '../schema';
import { getUserAnalytics } from '../handlers/get_user_analytics';

// Test user inputs
const regularUserInput: CreateUserInput = {
  email: 'regular@example.com',
  username: 'regularuser'
};

const premiumUserInput: CreateUserInput = {
  email: 'premium@example.com',
  username: 'premiumuser'
};

describe('getUserAnalytics', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return analytics data for premium users', async () => {
    // Create premium user - explicitly set is_premium to true
    const premiumUsers = await db.insert(usersTable)
      .values({
        email: premiumUserInput.email,
        username: premiumUserInput.username,
        display_name: premiumUserInput.display_name,
        avatar_url: premiumUserInput.avatar_url,
        bio: premiumUserInput.bio,
        theme: premiumUserInput.theme || 'light',
        is_premium: true // Explicitly set to true
      })
      .returning()
      .execute();

    const premiumUser = premiumUsers[0];

    // Create some analytics data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await db.insert(pageAnalyticsTable)
      .values([
        {
          user_id: premiumUser.id,
          page_views: 100,
          total_clicks: 50,
          unique_visitors: 25,
          date: today
        },
        {
          user_id: premiumUser.id,
          page_views: 80,
          total_clicks: 40,
          unique_visitors: 20,
          date: yesterday
        }
      ])
      .execute();

    const input: GetAnalyticsInput = {
      user_id: premiumUser.id,
      days: 30
    };

    const result = await getUserAnalytics(input);

    expect(result).toHaveLength(2);
    expect(result[0].page_views).toEqual(100);
    expect(result[0].total_clicks).toEqual(50);
    expect(result[0].unique_visitors).toEqual(25);
    expect(result[0].user_id).toEqual(premiumUser.id);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-premium users', async () => {
    // Create regular user (not premium)
    const regularUsers = await db.insert(usersTable)
      .values({
        email: regularUserInput.email,
        username: regularUserInput.username,
        display_name: regularUserInput.display_name,
        avatar_url: regularUserInput.avatar_url,
        bio: regularUserInput.bio,
        theme: regularUserInput.theme || 'light',
        is_premium: false // Explicitly set to false
      })
      .returning()
      .execute();

    const regularUser = regularUsers[0];

    const input: GetAnalyticsInput = {
      user_id: regularUser.id,
      days: 30
    };

    await expect(getUserAnalytics(input)).rejects.toThrow(/premium users/i);
  });

  it('should throw error for non-existent user', async () => {
    // Use a valid UUID format for the test
    const input: GetAnalyticsInput = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      days: 30
    };

    await expect(getUserAnalytics(input)).rejects.toThrow(/user not found/i);
  });

  it('should filter analytics data by date range', async () => {
    // Create premium user
    const premiumUsers = await db.insert(usersTable)
      .values({
        email: premiumUserInput.email,
        username: premiumUserInput.username,
        display_name: premiumUserInput.display_name,
        avatar_url: premiumUserInput.avatar_url,
        bio: premiumUserInput.bio,
        theme: premiumUserInput.theme || 'light',
        is_premium: true // Explicitly set to true
      })
      .returning()
      .execute();

    const premiumUser = premiumUsers[0];

    // Create analytics data with different dates
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const fiftyDaysAgo = new Date(today);
    fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);

    await db.insert(pageAnalyticsTable)
      .values([
        {
          user_id: premiumUser.id,
          page_views: 100,
          total_clicks: 50,
          unique_visitors: 25,
          date: today
        },
        {
          user_id: premiumUser.id,
          page_views: 80,
          total_clicks: 40,
          unique_visitors: 20,
          date: tenDaysAgo
        },
        {
          user_id: premiumUser.id,
          page_views: 60,
          total_clicks: 30,
          unique_visitors: 15,
          date: fiftyDaysAgo // This should be filtered out
        }
      ])
      .execute();

    const input: GetAnalyticsInput = {
      user_id: premiumUser.id,
      days: 30 // Should only return data from last 30 days
    };

    const result = await getUserAnalytics(input);

    expect(result).toHaveLength(2); // Should exclude the 50-day-old record
    result.forEach(analytics => {
      const daysDiff = Math.floor((today.getTime() - analytics.date.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBeLessThanOrEqual(30);
    });
  });

  it('should return empty array when no analytics data exists', async () => {
    // Create premium user but no analytics data
    const premiumUsers = await db.insert(usersTable)
      .values({
        email: premiumUserInput.email,
        username: premiumUserInput.username,
        display_name: premiumUserInput.display_name,
        avatar_url: premiumUserInput.avatar_url,
        bio: premiumUserInput.bio,
        theme: premiumUserInput.theme || 'light',
        is_premium: true // Explicitly set to true
      })
      .returning()
      .execute();

    const premiumUser = premiumUsers[0];

    const input: GetAnalyticsInput = {
      user_id: premiumUser.id,
      days: 30
    };

    const result = await getUserAnalytics(input);

    expect(result).toHaveLength(0);
  });
});
