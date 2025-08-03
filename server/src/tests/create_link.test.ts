
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { type CreateLinkInput } from '../schema';
import { createLink } from '../handlers/create_link';
import { eq, count } from 'drizzle-orm';

const testUser = {
  email: 'testuser@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  bio: null,
  theme: 'light' as const
};

const testInput: CreateLinkInput = {
  user_id: '', // Will be set after user creation
  title: 'My Website',
  url: 'https://example.com',
  icon: 'globe',
  description: 'My personal website',
  order_index: 0
};

describe('createLink', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a link for a user', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;
    const linkInput = { ...testInput, user_id: userId };

    const result = await createLink(linkInput);

    // Basic field validation
    expect(result.user_id).toEqual(userId);
    expect(result.title).toEqual('My Website');
    expect(result.url).toEqual('https://example.com');
    expect(result.icon).toEqual('globe');
    expect(result.description).toEqual('My personal website');
    expect(result.order_index).toEqual(0);
    expect(result.is_active).toBe(true);
    expect(result.click_count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save link to database', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;
    const linkInput = { ...testInput, user_id: userId };

    const result = await createLink(linkInput);

    // Query database to verify link was saved
    const links = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, result.id))
      .execute();

    expect(links).toHaveLength(1);
    expect(links[0].title).toEqual('My Website');
    expect(links[0].url).toEqual('https://example.com');
    expect(links[0].user_id).toEqual(userId);
    expect(links[0].created_at).toBeInstanceOf(Date);
  });

  it('should auto-assign order_index when not provided', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create first link without order_index
    const firstLinkInput = {
      user_id: userId,
      title: 'First Link',
      url: 'https://first.com'
    };

    const firstResult = await createLink(firstLinkInput);
    expect(firstResult.order_index).toEqual(0);

    // Create second link without order_index
    const secondLinkInput = {
      user_id: userId,
      title: 'Second Link',
      url: 'https://second.com'
    };

    const secondResult = await createLink(secondLinkInput);
    expect(secondResult.order_index).toEqual(1);
  });

  it('should enforce 5 link limit for free users', async () => {
    // Create a free user (is_premium = false by default)
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create 5 links (the maximum for free users)
    for (let i = 0; i < 5; i++) {
      const linkInput = {
        user_id: userId,
        title: `Link ${i + 1}`,
        url: `https://example${i + 1}.com`
      };
      await createLink(linkInput);
    }

    // Verify we have 5 links
    const linkCount = await db.select({ count: count() })
      .from(linksTable)
      .where(eq(linksTable.user_id, userId))
      .execute();
    
    expect(linkCount[0].count).toEqual(5);

    // Try to create a 6th link - should fail
    const sixthLinkInput = {
      user_id: userId,
      title: 'Sixth Link',
      url: 'https://sixth.com'
    };

    await expect(createLink(sixthLinkInput)).rejects.toThrow(/free users can only have up to 5 links/i);
  });

  it('should allow unlimited links for premium users', async () => {
    // Create a premium user
    const premiumUser = { ...testUser, is_premium: true };
    const userResult = await db.insert(usersTable)
      .values(premiumUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create 6 links (more than free limit)
    for (let i = 0; i < 6; i++) {
      const linkInput = {
        user_id: userId,
        title: `Link ${i + 1}`,
        url: `https://example${i + 1}.com`
      };
      await createLink(linkInput);
    }

    // Verify we have 6 links
    const linkCount = await db.select({ count: count() })
      .from(linksTable)
      .where(eq(linksTable.user_id, userId))
      .execute();
    
    expect(linkCount[0].count).toEqual(6);
  });

  it('should throw error for non-existent user', async () => {
    // Use a valid UUID format but non-existent user
    const linkInput = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Link',
      url: 'https://example.com'
    };

    await expect(createLink(linkInput)).rejects.toThrow(/user not found/i);
  });

  it('should throw error for invalid user ID format', async () => {
    const linkInput = {
      user_id: 'invalid-uuid-format',
      title: 'Test Link',
      url: 'https://example.com'
    };

    await expect(createLink(linkInput)).rejects.toThrow(/user not found/i);
  });

  it('should handle optional fields correctly', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create link with minimal required fields only
    const minimalInput = {
      user_id: userId,
      title: 'Minimal Link',
      url: 'https://minimal.com'
    };

    const result = await createLink(minimalInput);

    expect(result.title).toEqual('Minimal Link');
    expect(result.url).toEqual('https://minimal.com');
    expect(result.icon).toBeNull();
    expect(result.description).toBeNull();
    expect(result.order_index).toEqual(0); // Auto-assigned
  });
});
