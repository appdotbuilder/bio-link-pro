
import { db } from '../db';
import { subscriptionsTable, usersTable } from '../db/schema';
import { type CreateSubscriptionInput, type Subscription } from '../schema';
import { eq } from 'drizzle-orm';

export const createSubscription = async (input: CreateSubscriptionInput): Promise<Subscription> => {
  try {
    // Verify that the user exists first to prevent foreign key constraint violations
    const userExists = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (userExists.length === 0) {
      throw new Error(`User with id ${input.user_id} not found`);
    }

    // Create subscription with current and end period dates
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1); // Default to 1 month subscription

    const result = await db.insert(subscriptionsTable)
      .values({
        user_id: input.user_id,
        stripe_subscription_id: input.stripe_subscription_id || null,
        status: input.status,
        current_period_start: now,
        current_period_end: periodEnd
      })
      .returning()
      .execute();

    const subscription = result[0];

    // Update user's premium status and subscription info if subscription is active
    if (input.status === 'active') {
      await db.update(usersTable)
        .set({
          is_premium: true,
          subscription_id: subscription.id,
          subscription_status: input.status,
          updated_at: now
        })
        .where(eq(usersTable.id, input.user_id))
        .execute();
    }

    // Return with proper type casting for the status field
    return {
      ...subscription,
      status: subscription.status as "active" | "inactive" | "cancelled" | "past_due"
    };
  } catch (error) {
    console.error('Subscription creation failed:', error);
    throw error;
  }
};
