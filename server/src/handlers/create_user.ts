
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        email: input.email,
        username: input.username,
        display_name: input.display_name || null,
        avatar_url: input.avatar_url || null,
        bio: input.bio || null,
        theme: input.theme || 'light'
      })
      .returning()
      .execute();

    const user = result[0];
    return {
      ...user,
      theme: user.theme as 'light' | 'dark',
      subscription_status: user.subscription_status as 'active' | 'inactive' | 'cancelled' | 'past_due' | null
    };
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};
