
import { db } from '../db';
import { linksTable } from '../db/schema';
import { type UpdateLinkInput, type Link } from '../schema';
import { eq } from 'drizzle-orm';

export const updateLink = async (input: UpdateLinkInput): Promise<Link> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    if (input.url !== undefined) {
      updateData.url = input.url;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.order_index !== undefined) {
      updateData.order_index = input.order_index;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update the link
    const result = await db.update(linksTable)
      .set(updateData)
      .where(eq(linksTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Link not found');
    }

    return result[0];
  } catch (error) {
    console.error('Link update failed:', error);
    throw error;
  }
};
