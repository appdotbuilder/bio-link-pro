
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { type UpdateLinkInput } from '../schema';
import { updateLink } from '../handlers/update_link';
import { eq } from 'drizzle-orm';

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser'
};

const testLink = {
  title: 'Original Link',
  url: 'https://original.com',
  icon: 'original-icon',
  description: 'Original description',
  order_index: 0,
  is_active: true
};

describe('updateLink', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: string;
  let linkId: string;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    userId = userResult[0].id;

    // Create test link
    const linkResult = await db.insert(linksTable)
      .values({
        ...testLink,
        user_id: userId
      })
      .returning()
      .execute();
    linkId = linkResult[0].id;
  });

  it('should update link title', async () => {
    const input: UpdateLinkInput = {
      id: linkId,
      title: 'Updated Title'
    };

    const result = await updateLink(input);

    expect(result.id).toEqual(linkId);
    expect(result.title).toEqual('Updated Title');
    expect(result.url).toEqual(testLink.url); // Other fields unchanged
    expect(result.description).toEqual(testLink.description);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update link URL', async () => {
    const input: UpdateLinkInput = {
      id: linkId,
      url: 'https://updated.com'
    };

    const result = await updateLink(input);

    expect(result.url).toEqual('https://updated.com');
    expect(result.title).toEqual(testLink.title); // Other fields unchanged
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateLinkInput = {
      id: linkId,
      title: 'New Title',
      url: 'https://new.com',
      icon: 'new-icon',
      description: 'New description',
      order_index: 5,
      is_active: false
    };

    const result = await updateLink(input);

    expect(result.title).toEqual('New Title');
    expect(result.url).toEqual('https://new.com');
    expect(result.icon).toEqual('new-icon');
    expect(result.description).toEqual('New description');
    expect(result.order_index).toEqual(5);
    expect(result.is_active).toEqual(false);
  });

  it('should set nullable fields to null', async () => {
    const input: UpdateLinkInput = {
      id: linkId,
      icon: null,
      description: null
    };

    const result = await updateLink(input);

    expect(result.icon).toBeNull();
    expect(result.description).toBeNull();
    expect(result.title).toEqual(testLink.title); // Other fields unchanged
  });

  it('should update the updated_at timestamp', async () => {
    const originalLink = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, linkId))
      .execute();

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateLinkInput = {
      id: linkId,
      title: 'Updated Title'
    };

    const result = await updateLink(input);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalLink[0].updated_at.getTime());
  });

  it('should persist changes to database', async () => {
    const input: UpdateLinkInput = {
      id: linkId,
      title: 'Database Test',
      url: 'https://database.com'
    };

    await updateLink(input);

    // Verify changes in database
    const links = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, linkId))
      .execute();

    expect(links).toHaveLength(1);
    expect(links[0].title).toEqual('Database Test');
    expect(links[0].url).toEqual('https://database.com');
  });

  it('should throw error for non-existent link', async () => {
    const input: UpdateLinkInput = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format but non-existent
      title: 'Test'
    };

    expect(updateLink(input)).rejects.toThrow(/Link not found/i);
  });

  it('should only update provided fields', async () => {
    const input: UpdateLinkInput = {
      id: linkId,
      title: 'Only Title Updated'
    };

    const result = await updateLink(input);

    // Only title should change
    expect(result.title).toEqual('Only Title Updated');
    
    // All other fields should remain the same
    expect(result.url).toEqual(testLink.url);
    expect(result.icon).toEqual(testLink.icon);
    expect(result.description).toEqual(testLink.description);
    expect(result.order_index).toEqual(testLink.order_index);
    expect(result.is_active).toEqual(testLink.is_active);
  });
});
