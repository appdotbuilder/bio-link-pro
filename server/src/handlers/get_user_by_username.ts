
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetUserPageInput, type User } from '../schema';

export async function getUserByUsername(input: GetUserPageInput): Promise<User | null> {
  try {
    const results = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, input.username))
      .limit(1)
      .execute();

    if (results.length === 0) {
      return null;
    }

    const user = results[0];
    return {
      ...user,
      // Ensure proper typing for enum fields
      theme: user.theme as 'light' | 'dark',
      subscription_status: user.subscription_status as 'active' | 'inactive' | 'cancelled' | 'past_due' | null,
      // Convert dates to proper Date objects
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    };
  } catch (error) {
    console.error('Get user by username failed:', error);
    throw error;
  }
}
