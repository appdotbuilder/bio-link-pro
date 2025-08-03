
import { db } from '../db';
import { linkClicksTable, linksTable, usersTable } from '../db/schema';
import { type LinkClick } from '../schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export async function getLinkAnalytics(userId: string, days: number = 30): Promise<LinkClick[]> {
  try {
    // First verify user exists and is premium
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (user.length === 0) {
      throw new Error('User not found');
    }

    if (!user[0].is_premium) {
      throw new Error('Premium subscription required for detailed analytics');
    }

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Query link clicks with join to verify user owns the links
    const results = await db.select({
      id: linkClicksTable.id,
      link_id: linkClicksTable.link_id,
      user_id: linkClicksTable.user_id,
      ip_address: linkClicksTable.ip_address,
      user_agent: linkClicksTable.user_agent,
      referrer: linkClicksTable.referrer,
      country: linkClicksTable.country,
      clicked_at: linkClicksTable.clicked_at
    })
      .from(linkClicksTable)
      .innerJoin(linksTable, eq(linkClicksTable.link_id, linksTable.id))
      .where(
        and(
          eq(linksTable.user_id, userId),
          gte(linkClicksTable.clicked_at, dateThreshold)
        )
      )
      .orderBy(desc(linkClicksTable.clicked_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Link analytics fetch failed:', error);
    throw error;
  }
}
