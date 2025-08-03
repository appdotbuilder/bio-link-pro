
import { db } from '../db';
import { pageAnalyticsTable, usersTable } from '../db/schema';
import { type GetAnalyticsInput, type PageAnalytics } from '../schema';
import { eq, gte, and } from 'drizzle-orm';

export async function getUserAnalytics(input: GetAnalyticsInput): Promise<PageAnalytics[]> {
  try {
    // First, verify the user exists and check if they're premium
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.user_id))
      .execute();

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    if (!user.is_premium) {
      throw new Error('Analytics data is only available for premium users');
    }

    // Calculate the start date based on the number of days requested
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - input.days);

    // Query analytics data for the specified time period
    const results = await db.select()
      .from(pageAnalyticsTable)
      .where(
        and(
          eq(pageAnalyticsTable.user_id, input.user_id),
          gte(pageAnalyticsTable.date, startDate)
        )
      )
      .execute();

    return results;
  } catch (error) {
    console.error('Get user analytics failed:', error);
    throw error;
  }
}
