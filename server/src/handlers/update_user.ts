
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export const updateUser = async (input: UpdateUserInput): Promise<User> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof usersTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.username !== undefined) {
      updateData.username = input.username;
    }
    if (input.display_name !== undefined) {
      updateData.display_name = input.display_name;
    }
    if (input.avatar_url !== undefined) {
      updateData.avatar_url = input.avatar_url;
    }
    if (input.bio !== undefined) {
      updateData.bio = input.bio;
    }
    if (input.theme !== undefined) {
      updateData.theme = input.theme;
    }

    // Update user record
    const result = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('User not found');
    }

    return result[0] as User;
  } catch (error) {
    console.error('User update failed:', error);
    throw error;
  }
};
