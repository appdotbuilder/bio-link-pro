
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput, type CreateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Test user creation helper
const createTestUser = async (): Promise<string> => {
  const testUserInput: CreateUserInput = {
    email: 'test@example.com',
    username: 'testuser',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Original bio',
    theme: 'light'
  };

  const result = await db.insert(usersTable)
    .values({
      email: testUserInput.email,
      username: testUserInput.username,
      display_name: testUserInput.display_name,
      avatar_url: testUserInput.avatar_url,
      bio: testUserInput.bio,
      theme: testUserInput.theme
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update user username', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'newusername'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.username).toEqual('newusername');
    expect(result.display_name).toEqual('Test User'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update user display name and bio', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      display_name: 'Updated Display Name',
      bio: 'Updated bio text'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.display_name).toEqual('Updated Display Name');
    expect(result.bio).toEqual('Updated bio text');
    expect(result.username).toEqual('testuser'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update user theme', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      theme: 'dark'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.theme).toEqual('dark');
    expect(result.username).toEqual('testuser'); // Should remain unchanged
  });

  it('should set nullable fields to null', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      display_name: null,
      avatar_url: null,
      bio: null
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.display_name).toBeNull();
    expect(result.avatar_url).toBeNull();
    expect(result.bio).toBeNull();
    expect(result.username).toEqual('testuser'); // Should remain unchanged
  });

  it('should save changes to database', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'updateduser',
      display_name: 'Updated Name'
    };

    await updateUser(updateInput);

    // Verify changes in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].username).toEqual('updateduser');
    expect(users[0].display_name).toEqual('Updated Name');
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields at once', async () => {
    const userId = await createTestUser();
    
    const updateInput: UpdateUserInput = {
      id: userId,
      username: 'multiupdate',
      display_name: 'Multi Update User',
      avatar_url: 'https://example.com/new-avatar.jpg',
      bio: 'New bio for multi update',
      theme: 'dark'
    };

    const result = await updateUser(updateInput);

    expect(result.id).toEqual(userId);
    expect(result.username).toEqual('multiupdate');
    expect(result.display_name).toEqual('Multi Update User');
    expect(result.avatar_url).toEqual('https://example.com/new-avatar.jpg');
    expect(result.bio).toEqual('New bio for multi update');
    expect(result.theme).toEqual('dark');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    // Use a valid UUID format that doesn't exist in the database
    const updateInput: UpdateUserInput = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'shouldfail'
    };

    expect(updateUser(updateInput)).rejects.toThrow(/user not found/i);
  });
});
