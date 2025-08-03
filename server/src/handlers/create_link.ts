
import { db } from '../db';
import { linksTable, usersTable } from '../db/schema';
import { type CreateLinkInput, type Link } from '../schema';
import { eq, count, max } from 'drizzle-orm';

export const createLink = async (input: CreateLinkInput): Promise<Link> => {
  try {
    // First, verify the user exists
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    // Check existing link count for free users (premium users have no limit)
    if (!user.is_premium) {
      const linkCountResult = await db.select({ count: count() })
        .from(linksTable)
        .where(eq(linksTable.user_id, input.user_id))
        .execute();

      const currentLinkCount = linkCountResult[0].count;
      if (currentLinkCount >= 5) {
        throw new Error('Free users can only have up to 5 links');
      }
    }

    // Determine order_index if not provided
    let orderIndex = input.order_index;
    if (orderIndex === undefined) {
      // Get the highest order_index for this user and increment by 1
      const maxOrderResult = await db.select({ maxOrder: max(linksTable.order_index) })
        .from(linksTable)
        .where(eq(linksTable.user_id, input.user_id))
        .execute();

      const maxOrder = maxOrderResult[0].maxOrder;
      orderIndex = maxOrder !== null ? maxOrder + 1 : 0;
    }

    // Insert the new link
    const result = await db.insert(linksTable)
      .values({
        user_id: input.user_id,
        title: input.title,
        url: input.url,
        icon: input.icon || null,
        description: input.description || null,
        order_index: orderIndex
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Link creation failed:', error);
    // Handle PostgreSQL UUID format errors as user not found
    if (error instanceof Error && error.message.includes('invalid input syntax for type uuid')) {
      throw new Error('User not found');
    }
    throw error;
  }
};
