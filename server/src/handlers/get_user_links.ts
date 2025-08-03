
import { db } from '../db';
import { linksTable } from '../db/schema';
import { type Link } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getUserLinks(userId: string): Promise<Link[]> {
  try {
    const results = await db.select()
      .from(linksTable)
      .where(eq(linksTable.user_id, userId))
      .orderBy(asc(linksTable.order_index))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get user links:', error);
    throw error;
  }
}
