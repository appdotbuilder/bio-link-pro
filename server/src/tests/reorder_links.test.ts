
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { type ReorderLinksInput, type CreateUserInput, type CreateLinkInput } from '../schema';
import { reorderLinks } from '../handlers/reorder_links';
import { eq, and } from 'drizzle-orm';

describe('reorderLinks', () => {
  let testUserId: string;
  let testLinks: Array<{ id: string; title: string; originalOrder: number }>;

  beforeEach(async () => {
    await createDB();

    // Create test user
    const userInput: CreateUserInput = {
      email: 'test@example.com',
      username: 'testuser'
    };

    const [user] = await db.insert(usersTable)
      .values(userInput)
      .returning()
      .execute();

    testUserId = user.id;

    // Create test links with initial order
    const linkInputs: CreateLinkInput[] = [
      {
        user_id: testUserId,
        title: 'First Link',
        url: 'https://first.com',
        order_index: 0
      },
      {
        user_id: testUserId,
        title: 'Second Link',
        url: 'https://second.com',
        order_index: 1
      },
      {
        user_id: testUserId,
        title: 'Third Link',
        url: 'https://third.com',
        order_index: 2
      }
    ];

    const createdLinks = await db.insert(linksTable)
      .values(linkInputs)
      .returning()
      .execute();

    testLinks = createdLinks.map((link, index) => ({
      id: link.id,
      title: link.title,
      originalOrder: index
    }));
  });

  afterEach(resetDB);

  it('should reorder links successfully', async () => {
    // Reorder: move first link to last position
    const reorderInput: ReorderLinksInput = {
      user_id: testUserId,
      link_orders: [
        { id: testLinks[0].id, order_index: 2 }, // First -> Last
        { id: testLinks[1].id, order_index: 0 }, // Second -> First  
        { id: testLinks[2].id, order_index: 1 }  // Third -> Second
      ]
    };

    const result = await reorderLinks(reorderInput);
    expect(result.success).toBe(true);

    // Verify new order in database
    const updatedLinks = await db.select()
      .from(linksTable)
      .where(eq(linksTable.user_id, testUserId))
      .execute();

    // Sort by order_index to check new order
    updatedLinks.sort((a, b) => a.order_index - b.order_index);

    expect(updatedLinks[0].title).toBe('Second Link'); // order_index 0
    expect(updatedLinks[1].title).toBe('Third Link');  // order_index 1
    expect(updatedLinks[2].title).toBe('First Link');  // order_index 2
  });

  it('should update timestamps when reordering', async () => {
    const reorderInput: ReorderLinksInput = {
      user_id: testUserId,
      link_orders: [
        { id: testLinks[0].id, order_index: 1 },
        { id: testLinks[1].id, order_index: 0 }
      ]
    };

    const beforeUpdate = new Date();
    await reorderLinks(reorderInput);

    // Check that updated_at was modified
    const updatedLink = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, testLinks[0].id))
      .execute();

    expect(updatedLink[0].updated_at).toBeInstanceOf(Date);
    expect(updatedLink[0].updated_at >= beforeUpdate).toBe(true);
  });

  it('should reject reordering links that do not belong to user', async () => {
    // Create another user and their link
    const otherUserInput: CreateUserInput = {
      email: 'other@example.com',
      username: 'otheruser'
    };

    const [otherUser] = await db.insert(usersTable)
      .values(otherUserInput)
      .returning()
      .execute();

    const [otherLink] = await db.insert(linksTable)
      .values({
        user_id: otherUser.id,
        title: 'Other User Link',
        url: 'https://other.com',
        order_index: 0
      })
      .returning()
      .execute();

    // Try to reorder other user's link
    const reorderInput: ReorderLinksInput = {
      user_id: testUserId,
      link_orders: [
        { id: otherLink.id, order_index: 0 } // Link belongs to different user
      ]
    };

    await expect(reorderLinks(reorderInput)).rejects.toThrow(/Links do not belong to user/i);
  });

  it('should handle partial reordering of links', async () => {
    // Only reorder 2 out of 3 links
    const reorderInput: ReorderLinksInput = {
      user_id: testUserId,
      link_orders: [
        { id: testLinks[0].id, order_index: 5 }, // Change first link to order 5
        { id: testLinks[2].id, order_index: 3 }  // Change third link to order 3
      ]
    };

    const result = await reorderLinks(reorderInput);
    expect(result.success).toBe(true);

    // Verify changes
    const updatedLinks = await db.select()
      .from(linksTable)
      .where(eq(linksTable.user_id, testUserId))
      .execute();

    const linkMap = new Map(updatedLinks.map(link => [link.id, link]));

    expect(linkMap.get(testLinks[0].id)?.order_index).toBe(5);
    expect(linkMap.get(testLinks[1].id)?.order_index).toBe(1); // Unchanged
    expect(linkMap.get(testLinks[2].id)?.order_index).toBe(3);
  });

  it('should handle empty link orders array', async () => {
    const reorderInput: ReorderLinksInput = {
      user_id: testUserId,
      link_orders: []
    };

    const result = await reorderLinks(reorderInput);
    expect(result.success).toBe(true);

    // Verify no changes were made
    const links = await db.select()
      .from(linksTable)
      .where(eq(linksTable.user_id, testUserId))
      .execute();

    links.forEach((link, index) => {
      expect(link.order_index).toBe(index); // Original order preserved
    });
  });
});
