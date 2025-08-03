
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { type GetUserPageInput, type CreateUserInput, type CreateLinkInput } from '../schema';
import { getPublicUserLinks } from '../handlers/get_public_user_links';

const testUser: CreateUserInput = {
  email: 'testuser@example.com',
  username: 'testuser'
};

const testInput: GetUserPageInput = {
  username: 'testuser'
};

describe('getPublicUserLinks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return active links for a user', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        username: testUser.username
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create active links
    await db.insert(linksTable)
      .values([
        {
          user_id: userId,
          title: 'First Link',
          url: 'https://example.com/first',
          order_index: 1,
          is_active: true
        },
        {
          user_id: userId,
          title: 'Second Link',
          url: 'https://example.com/second',
          order_index: 0,
          is_active: true
        }
      ])
      .execute();

    const result = await getPublicUserLinks(testInput);

    expect(result).toHaveLength(2);
    // Should be ordered by order_index (ascending)
    expect(result[0].title).toEqual('Second Link');
    expect(result[0].order_index).toEqual(0);
    expect(result[1].title).toEqual('First Link');
    expect(result[1].order_index).toEqual(1);
    
    // Verify all links are active
    result.forEach(link => {
      expect(link.is_active).toBe(true);
    });
  });

  it('should not return inactive links', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        username: testUser.username
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create both active and inactive links
    await db.insert(linksTable)
      .values([
        {
          user_id: userId,
          title: 'Active Link',
          url: 'https://example.com/active',
          order_index: 0,
          is_active: true
        },
        {
          user_id: userId,
          title: 'Inactive Link',
          url: 'https://example.com/inactive',
          order_index: 1,
          is_active: false
        }
      ])
      .execute();

    const result = await getPublicUserLinks(testInput);

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Active Link');
    expect(result[0].is_active).toBe(true);
  });

  it('should return empty array for non-existent user', async () => {
    const result = await getPublicUserLinks({ username: 'nonexistent' });

    expect(result).toHaveLength(0);
  });

  it('should return empty array for user with no links', async () => {
    // Create user with no links
    await db.insert(usersTable)
      .values({
        email: testUser.email,
        username: testUser.username
      })
      .execute();

    const result = await getPublicUserLinks(testInput);

    expect(result).toHaveLength(0);
  });

  it('should order links by order_index correctly', async () => {
    // Create user
    const userResult = await db.insert(usersTable)
      .values({
        email: testUser.email,
        username: testUser.username
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create links with various order indices
    await db.insert(linksTable)
      .values([
        {
          user_id: userId,
          title: 'Third Link',
          url: 'https://example.com/third',
          order_index: 5,
          is_active: true
        },
        {
          user_id: userId,
          title: 'First Link',
          url: 'https://example.com/first',
          order_index: 1,
          is_active: true
        },
        {
          user_id: userId,
          title: 'Second Link',
          url: 'https://example.com/second',
          order_index: 3,
          is_active: true
        }
      ])
      .execute();

    const result = await getPublicUserLinks(testInput);

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('First Link');
    expect(result[0].order_index).toEqual(1);
    expect(result[1].title).toEqual('Second Link');
    expect(result[1].order_index).toEqual(3);
    expect(result[2].title).toEqual('Third Link');
    expect(result[2].order_index).toEqual(5);
  });
});
