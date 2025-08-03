
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { type GetUserPageInput, type Link } from '../schema';
import { eq, and, asc } from 'drizzle-orm';

export const getPublicUserLinks = async (input: GetUserPageInput): Promise<Link[]> => {
  try {
    // Join users and links tables to get active links for the user by username
    const results = await db.select({
      id: linksTable.id,
      user_id: linksTable.user_id,
      title: linksTable.title,
      url: linksTable.url,
      icon: linksTable.icon,
      description: linksTable.description,
      order_index: linksTable.order_index,
      is_active: linksTable.is_active,
      click_count: linksTable.click_count,
      created_at: linksTable.created_at,
      updated_at: linksTable.updated_at
    })
    .from(linksTable)
    .innerJoin(usersTable, eq(linksTable.user_id, usersTable.id))
    .where(
      and(
        eq(usersTable.username, input.username),
        eq(linksTable.is_active, true)
      )
    )
    .orderBy(asc(linksTable.order_index))
    .execute();

    return results;
  } catch (error) {
    console.error('Get public user links failed:', error);
    throw error;
  }
};
