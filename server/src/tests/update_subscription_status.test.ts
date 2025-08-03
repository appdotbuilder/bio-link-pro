
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, subscriptionsTable } from '../db/schema';
import { type UpdateSubscriptionStatusInput } from '../handlers/update_subscription_status';
import { updateSubscriptionStatus } from '../handlers/update_subscription_status';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  theme: 'light' as const
};

const testSubscription = {
  status: 'inactive' as const,
  current_period_start: new Date(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
};

describe('updateSubscriptionStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update subscription status to active', async () => {
    // Create user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = users[0];

    // Create subscription
    const subscriptions = await db.insert(subscriptionsTable)
      .values({
        ...testSubscription,
        user_id: user.id
      })
      .returning()
      .execute();
    const subscription = subscriptions[0];

    const input: UpdateSubscriptionStatusInput = {
      user_id: user.id,
      status: 'active'
    };

    const result = await updateSubscriptionStatus(input);

    expect(result).toBeDefined();
    expect(result!.status).toEqual('active');
    expect(result!.id).toEqual(subscription.id);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update user premium status when subscription becomes active', async () => {
    // Create user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = users[0];

    // Create subscription
    await db.insert(subscriptionsTable)
      .values({
        ...testSubscription,
        user_id: user.id
      })
      .returning()
      .execute();

    const input: UpdateSubscriptionStatusInput = {
      user_id: user.id,
      status: 'active'
    };

    await updateSubscriptionStatus(input);

    // Check user premium status
    const updatedUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .execute();

    const updatedUser = updatedUsers[0];
    expect(updatedUser.is_premium).toBe(true);
    expect(updatedUser.subscription_status).toEqual('active');
    expect(updatedUser.updated_at).toBeInstanceOf(Date);
  });

  it('should remove premium status when subscription is cancelled', async () => {
    // Create user with premium status
    const users = await db.insert(usersTable)
      .values({
        ...testUser,
        is_premium: true,
        subscription_status: 'active'
      })
      .returning()
      .execute();
    const user = users[0];

    // Create active subscription
    await db.insert(subscriptionsTable)
      .values({
        ...testSubscription,
        user_id: user.id,
        status: 'active'
      })
      .returning()
      .execute();

    const input: UpdateSubscriptionStatusInput = {
      user_id: user.id,
      status: 'cancelled'
    };

    const result = await updateSubscriptionStatus(input);

    expect(result!.status).toEqual('cancelled');

    // Check user premium status is removed
    const updatedUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .execute();

    const updatedUser = updatedUsers[0];
    expect(updatedUser.is_premium).toBe(false);
    expect(updatedUser.subscription_status).toEqual('cancelled');
  });

  it('should handle past_due status correctly', async () => {
    // Create user
    const users = await db.insert(usersTable)
      .values({
        ...testUser,
        is_premium: true,
        subscription_status: 'active'
      })
      .returning()
      .execute();
    const user = users[0];

    // Create subscription
    await db.insert(subscriptionsTable)
      .values({
        ...testSubscription,
        user_id: user.id,
        status: 'active'
      })
      .returning()
      .execute();

    const input: UpdateSubscriptionStatusInput = {
      user_id: user.id,
      status: 'past_due'
    };

    const result = await updateSubscriptionStatus(input);

    expect(result!.status).toEqual('past_due');

    // Check user loses premium status for past_due
    const updatedUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .execute();

    const updatedUser = updatedUsers[0];
    expect(updatedUser.is_premium).toBe(false);
    expect(updatedUser.subscription_status).toEqual('past_due');
  });

  it('should return null when subscription does not exist', async () => {
    // Create user without subscription
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = users[0];

    const input: UpdateSubscriptionStatusInput = {
      user_id: user.id,
      status: 'active'
    };

    const result = await updateSubscriptionStatus(input);

    expect(result).toBeNull();
  });

  it('should save updated subscription to database', async () => {
    // Create user
    const users = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user = users[0];

    // Create subscription
    const subscriptions = await db.insert(subscriptionsTable)
      .values({
        ...testSubscription,
        user_id: user.id
      })
      .returning()
      .execute();
    const subscription = subscriptions[0];

    const input: UpdateSubscriptionStatusInput = {
      user_id: user.id,
      status: 'active'
    };

    await updateSubscriptionStatus(input);

    // Verify subscription was updated in database
    const updatedSubscriptions = await db.select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.id, subscription.id))
      .execute();

    const updatedSubscription = updatedSubscriptions[0];
    expect(updatedSubscription.status).toEqual('active');
    expect(updatedSubscription.updated_at).toBeInstanceOf(Date);
    expect(updatedSubscription.updated_at > subscription.updated_at).toBe(true);
  });
});
