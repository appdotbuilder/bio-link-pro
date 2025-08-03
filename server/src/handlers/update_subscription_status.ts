
import { db } from '../db';
import { subscriptionsTable, usersTable } from '../db/schema';
import { type Subscription } from '../schema';
import { eq } from 'drizzle-orm';

export interface UpdateSubscriptionStatusInput {
  user_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
}

export const updateSubscriptionStatus = async (input: UpdateSubscriptionStatusInput): Promise<Subscription | null> => {
  try {
    // First, find the user's subscription
    const existingSubscriptions = await db.select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.user_id, input.user_id))
      .execute();

    if (existingSubscriptions.length === 0) {
      return null;
    }

    const subscription = existingSubscriptions[0];

    // Update subscription status
    const updatedSubscriptions = await db.update(subscriptionsTable)
      .set({
        status: input.status,
        updated_at: new Date()
      })
      .where(eq(subscriptionsTable.id, subscription.id))
      .returning()
      .execute();

    const updatedSubscription = updatedSubscriptions[0];

    // Update user's premium status based on subscription status
    const isPremium = input.status === 'active';
    
    await db.update(usersTable)
      .set({
        is_premium: isPremium,
        subscription_status: input.status,
        updated_at: new Date()
      })
      .where(eq(usersTable.id, input.user_id))
      .execute();

    // Cast the database result to match our schema types
    return {
      ...updatedSubscription,
      status: updatedSubscription.status as 'active' | 'inactive' | 'cancelled' | 'past_due'
    };
  } catch (error) {
    console.error('Subscription status update failed:', error);
    throw error;
  }
};
