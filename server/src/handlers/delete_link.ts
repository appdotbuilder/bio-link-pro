
import { db } from '../db';
import { linksTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const deleteLinkInputSchema = z.object({
    id: z.string(),
    user_id: z.string() // For authorization
});

export type DeleteLinkInput = z.infer<typeof deleteLinkInputSchema>;

export async function deleteLink(input: DeleteLinkInput): Promise<{ success: boolean }> {
    try {
        // First, verify the link exists and belongs to the user
        const existingLink = await db.select()
            .from(linksTable)
            .where(and(
                eq(linksTable.id, input.id),
                eq(linksTable.user_id, input.user_id)
            ))
            .execute();

        if (existingLink.length === 0) {
            throw new Error('Link not found or unauthorized');
        }

        const linkToDelete = existingLink[0];

        // Delete the link
        const result = await db.delete(linksTable)
            .where(and(
                eq(linksTable.id, input.id),
                eq(linksTable.user_id, input.user_id)
            ))
            .returning()
            .execute();

        if (result.length === 0) {
            throw new Error('Failed to delete link');
        }

        // Get all remaining links for this user with order_index greater than deleted link
        const higherOrderLinks = await db.select()
            .from(linksTable)
            .where(and(
                eq(linksTable.user_id, input.user_id)
            ))
            .execute();

        // Update order_index for each link that came after the deleted one
        for (const link of higherOrderLinks) {
            if (link.order_index > linkToDelete.order_index) {
                await db.update(linksTable)
                    .set({ 
                        order_index: link.order_index - 1,
                        updated_at: new Date()
                    })
                    .where(eq(linksTable.id, link.id))
                    .execute();
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Link deletion failed:', error);
        throw error;
    }
}
