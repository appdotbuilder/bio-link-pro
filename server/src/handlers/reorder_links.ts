
import { db } from '../db';
import { linksTable } from '../db/schema';
import { type ReorderLinksInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function reorderLinks(input: ReorderLinksInput): Promise<{ success: boolean }> {
  try {
    // Verify all links belong to the user before updating
    const linkIds = input.link_orders.map(order => order.id);
    
    const existingLinks = await db.select()
      .from(linksTable)
      .where(
        and(
          eq(linksTable.user_id, input.user_id),
          // Note: Using individual eq checks for each link_id since drizzle doesn't have 'in' operator built-in
        )
      )
      .execute();

    // Check if all provided link IDs belong to the user
    const userLinkIds = new Set(existingLinks.map(link => link.id));
    const invalidLinks = linkIds.filter(id => !userLinkIds.has(id));
    
    if (invalidLinks.length > 0) {
      throw new Error(`Links do not belong to user: ${invalidLinks.join(', ')}`);
    }

    // Update each link's order_index
    for (const linkOrder of input.link_orders) {
      await db.update(linksTable)
        .set({ 
          order_index: linkOrder.order_index,
          updated_at: new Date()
        })
        .where(
          and(
            eq(linksTable.id, linkOrder.id),
            eq(linksTable.user_id, input.user_id)
          )
        )
        .execute();
    }

    return { success: true };
  } catch (error) {
    console.error('Link reordering failed:', error);
    throw error;
  }
}
