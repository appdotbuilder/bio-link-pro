
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { type CreateUserInput, type CreateLinkInput } from '../schema';
import { getUserLinks } from '../handlers/get_user_links';

// Test user input
const testUser: CreateUserInput = {
  email: 'test@example.com',
  username: 'testuser'
};

// Test link inputs with different order indices
const testLinks: CreateLinkInput[] = [
  {
    user_id: '', // Will be set after user creation
    title: 'Instagram',
    url: 'https://instagram.com/user',
    icon: 'instagram',
    description: 'Follow me on Instagram',
    order_index: 2
  },
  {
    user_id: '', // Will be set after user creation
    title: 'Twitter',
    url: 'https://twitter.com/user',
    icon: 'twitter',
    description: 'Follow me on Twitter',
    order_index: 1
  },
  {
    user_id: '', // Will be set after user creation
    title: 'GitHub',
    url: 'https://github.com/user',
    icon: 'github',
    description: 'Check out my code',
    order_index: 3
  }
];

describe('getUserLinks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array for user with no links', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    const result = await getUserLinks(userId);

    expect(result).toEqual([]);
  });

  it('should return links ordered by order_index', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create links with different order indices
    const linksWithUserId = testLinks.map(link => ({
      ...link,
      user_id: userId
    }));

    await db.insert(linksTable)
      .values(linksWithUserId)
      .execute();

    const result = await getUserLinks(userId);

    expect(result).toHaveLength(3);
    
    // Should be ordered by order_index: Twitter (1), Instagram (2), GitHub (3)
    expect(result[0].title).toEqual('Twitter');
    expect(result[0].order_index).toEqual(1);
    expect(result[1].title).toEqual('Instagram');
    expect(result[1].order_index).toEqual(2);
    expect(result[2].title).toEqual('GitHub');
    expect(result[2].order_index).toEqual(3);
  });

  it('should return both active and inactive links', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create one active and one inactive link
    await db.insert(linksTable)
      .values([
        {
          user_id: userId,
          title: 'Active Link',
          url: 'https://example.com/active',
          order_index: 1,
          is_active: true
        },
        {
          user_id: userId,
          title: 'Inactive Link',
          url: 'https://example.com/inactive',
          order_index: 2,
          is_active: false
        }
      ])
      .execute();

    const result = await getUserLinks(userId);

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Active Link');
    expect(result[0].is_active).toBe(true);
    expect(result[1].title).toEqual('Inactive Link');
    expect(result[1].is_active).toBe(false);
  });

  it('should only return links for the specified user', async () => {
    // Create two users
    const user1Result = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const user1Id = user1Result[0].id;

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        username: 'testuser2'
      })
      .returning()
      .execute();
    const user2Id = user2Result[0].id;

    // Create links for both users
    await db.insert(linksTable)
      .values([
        {
          user_id: user1Id,
          title: 'User 1 Link',
          url: 'https://example.com/user1',
          order_index: 1
        },
        {
          user_id: user2Id,
          title: 'User 2 Link',
          url: 'https://example.com/user2',
          order_index: 1
        }
      ])
      .execute();

    const result = await getUserLinks(user1Id);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('User 1 Link');
    expect(result[0].user_id).toEqual(user1Id);
  });

  it('should return all link fields correctly', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();
    const userId = userResult[0].id;

    // Create link with all fields
    const linkInput = {
      user_id: userId,
      title: 'Complete Link',
      url: 'https://example.com/complete',
      icon: 'custom-icon',
      description: 'A complete link with all fields',
      order_index: 5
    };

    await db.insert(linksTable)
      .values(linkInput)
      .execute();

    const result = await getUserLinks(userId);

    expect(result).toHaveLength(1);
    const link = result[0];
    
    expect(link.id).toBeDefined();
    expect(link.user_id).toEqual(userId);
    expect(link.title).toEqual('Complete Link');
    expect(link.url).toEqual('https://example.com/complete');
    expect(link.icon).toEqual('custom-icon');
    expect(link.description).toEqual('A complete link with all fields');
    expect(link.order_index).toEqual(5);
    expect(link.is_active).toBe(true); // Default value
    expect(link.click_count).toEqual(0); // Default value
    expect(link.created_at).toBeInstanceOf(Date);
    expect(link.updated_at).toBeInstanceOf(Date);
  });
});
