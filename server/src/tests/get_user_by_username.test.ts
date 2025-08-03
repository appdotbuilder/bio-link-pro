
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type GetUserPageInput } from '../schema';
import { getUserByUsername } from '../handlers/get_user_by_username';

const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'This is a test bio',
  theme: 'dark',
  is_premium: true,
  subscription_id: 'sub_123',
  subscription_status: 'active',
  email_verified: true
};

describe('getUserByUsername', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return user by username', async () => {
    // Create test user
    const insertResult = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const createdUser = insertResult[0];

    const input: GetUserPageInput = {
      username: 'testuser'
    };

    const result = await getUserByUsername(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdUser.id);
    expect(result!.email).toEqual('test@example.com');
    expect(result!.username).toEqual('testuser');
    expect(result!.display_name).toEqual('Test User');
    expect(result!.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result!.bio).toEqual('This is a test bio');
    expect(result!.theme).toEqual('dark');
    expect(result!.is_premium).toEqual(true);
    expect(result!.subscription_id).toEqual('sub_123');
    expect(result!.subscription_status).toEqual('active');
    expect(result!.email_verified).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent username', async () => {
    const input: GetUserPageInput = {
      username: 'nonexistent'
    };

    const result = await getUserByUsername(input);

    expect(result).toBeNull();
  });

  it('should handle case-sensitive username lookup', async () => {
    // Create test user
    await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    // Query with different case
    const input: GetUserPageInput = {
      username: 'TestUser'
    };

    const result = await getUserByUsername(input);

    // Should return null since usernames are case-sensitive
    expect(result).toBeNull();
  });

  it('should return user with minimal required fields', async () => {
    const minimalUser = {
      email: 'minimal@example.com',
      username: 'minimal'
    };

    await db.insert(usersTable)
      .values(minimalUser)
      .returning()
      .execute();

    const input: GetUserPageInput = {
      username: 'minimal'
    };

    const result = await getUserByUsername(input);

    expect(result).not.toBeNull();
    expect(result!.email).toEqual('minimal@example.com');
    expect(result!.username).toEqual('minimal');
    expect(result!.display_name).toBeNull();
    expect(result!.avatar_url).toBeNull();
    expect(result!.bio).toBeNull();
    expect(result!.theme).toEqual('light'); // Default value
    expect(result!.is_premium).toEqual(false); // Default value
    expect(result!.email_verified).toEqual(false); // Default value
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
