
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, subscriptionsTable } from '../db/schema';
import { type CreateSubscriptionInput } from '../schema';
import { createSubscription } from '../handlers/create_subscription';
import { eq } from 'drizzle-orm';

// Test user data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  bio: null,
  theme: 'light' as const
};

describe('createSubscription', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;

  beforeEach(async () => {
    // Create a test user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    userId = userResult[0].id;
  });

  it('should create an active subscription', async () => {
    const input: CreateSubscriptionInput = {
      user_id: userId,
      stripe_subscription_id: 'sub_test123',
      status: 'active'
    };

    const result = await createSubscription(input);

    // Basic field validation
    expect(result.user_id).toEqual(userId);
    expect(result.stripe_subscription_id).toEqual('sub_test123');
    expect(result.status).toEqual('active');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.current_period_start).toBeInstanceOf(Date);
    expect(result.current_period_end).toBeInstanceOf(Date);

    // Verify period end is approximately 1 month from start
    const periodDuration = result.current_period_end.getTime() - result.current_period_start.getTime();
    const expectedDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    expect(Math.abs(periodDuration - expectedDuration)).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // Within 1 day
  });

  it('should save subscription to database', async () => {
    const input: CreateSubscriptionInput = {
      user_id: userId,
      stripe_subscription_id: 'sub_test456',
      status: 'active'
    };

    const result = await createSubscription(input);

    // Query database to verify
    const subscriptions = await db.select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.id, result.id))
      .execute();

    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].user_id).toEqual(userId);
    expect(subscriptions[0].stripe_subscription_id).toEqual('sub_test456');
    expect(subscriptions[0].status).toEqual('active');
  });

  it('should update user premium status for active subscription', async () => {
    const input: CreateSubscriptionInput = {
      user_id: userId,
      stripe_subscription_id: 'sub_premium123',
      status: 'active'
    };

    const subscription = await createSubscription(input);

    // Check that user was updated
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].is_premium).toBe(true);
    expect(users[0].subscription_id).toEqual(subscription.id);
    expect(users[0].subscription_status).toEqual('active');
  });

  it('should not update user premium status for inactive subscription', async () => {
    const input: CreateSubscriptionInput = {
      user_id: userId,
      stripe_subscription_id: 'sub_inactive123',
      status: 'inactive'
    };

    await createSubscription(input);

    // Check that user premium status wasn't changed
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].is_premium).toBe(false); // Should remain false
    expect(users[0].subscription_id).toBeNull();
    expect(users[0].subscription_status).toBeNull();
  });

  it('should create subscription without stripe_subscription_id', async () => {
    const input: CreateSubscriptionInput = {
      user_id: userId,
      status: 'active'
    };

    const result = await createSubscription(input);

    expect(result.stripe_subscription_id).toBeNull();
    expect(result.status).toEqual('active');
    expect(result.user_id).toEqual(userId);
  });

  it('should throw error for non-existent user', async () => {
    // Create a fake UUID that's properly formatted but doesn't exist
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    
    const input: CreateSubscriptionInput = {
      user_id: fakeUserId,
      status: 'active'
    };

    await expect(createSubscription(input)).rejects.toThrow(/User with id .* not found/i);
  });

  it('should handle cancelled subscription status', async () => {
    const input: CreateSubscriptionInput = {
      user_id: userId,
      stripe_subscription_id: 'sub_cancelled123',
      status: 'cancelled'
    };

    const result = await createSubscription(input);

    expect(result.status).toEqual('cancelled');

    // Verify user premium status is not updated for cancelled subscription
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users[0].is_premium).toBe(false);
    expect(users[0].subscription_status).toBeNull();
  });
});
