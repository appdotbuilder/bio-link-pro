
import { db } from '../db';
import { linksTable, linkClicksTable } from '../db/schema';
import { type TrackLinkClickInput, type LinkClick } from '../schema';
import { eq } from 'drizzle-orm';

export async function trackLinkClick(input: TrackLinkClickInput): Promise<LinkClick> {
  try {
    // First, verify the link exists and get its user_id
    const linkResult = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, input.link_id))
      .execute();

    if (linkResult.length === 0) {
      throw new Error(`Link with id ${input.link_id} not found`);
    }

    const link = linkResult[0];

    // Insert click record
    const clickResult = await db.insert(linkClicksTable)
      .values({
        link_id: input.link_id,
        user_id: link.user_id,
        ip_address: input.ip_address || null,
        user_agent: input.user_agent || null,
        referrer: input.referrer || null,
        country: null // Could be enhanced to derive from IP address
      })
      .returning()
      .execute();

    // Increment the link's click count
    await db.update(linksTable)
      .set({
        click_count: link.click_count + 1,
        updated_at: new Date()
      })
      .where(eq(linksTable.id, input.link_id))
      .execute();

    return clickResult[0];
  } catch (error) {
    console.error('Link click tracking failed:', error);
    throw error;
  }
}
