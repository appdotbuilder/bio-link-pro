
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateUserInput = {
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  theme: 'dark'
};

// Minimal test input
const minimalInput: CreateUserInput = {
  email: 'minimal@example.com',
  username: 'minimal'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with all fields', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.username).toEqual('testuser');
    expect(result.display_name).toEqual('Test User');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.bio).toEqual('Test bio');
    expect(result.theme).toEqual('dark');
    expect(result.is_premium).toEqual(false);
    expect(result.subscription_id).toBeNull();
    expect(result.subscription_status).toBeNull();
    expect(result.email_verified).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a user with minimal fields', async () => {
    const result = await createUser(minimalInput);

    expect(result.email).toEqual('minimal@example.com');
    expect(result.username).toEqual('minimal');
    expect(result.display_name).toBeNull();
    expect(result.avatar_url).toBeNull();
    expect(result.bio).toBeNull();
    expect(result.theme).toEqual('light'); // Default value
    expect(result.is_premium).toEqual(false);
    expect(result.subscription_id).toBeNull();
    expect(result.subscription_status).toBeNull();
    expect(result.email_verified).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].username).toEqual('testuser');
    expect(users[0].display_name).toEqual('Test User');
    expect(users[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(users[0].bio).toEqual('Test bio');
    expect(users[0].theme).toEqual('dark');
    expect(users[0].is_premium).toEqual(false);
    expect(users[0].email_verified).toEqual(false);
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for duplicate email', async () => {
    await createUser(testInput);

    const duplicateInput: CreateUserInput = {
      email: 'test@example.com', // Same email
      username: 'different'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value/i);
  });

  it('should throw error for duplicate username', async () => {
    await createUser(testInput);

    const duplicateInput: CreateUserInput = {
      email: 'different@example.com',
      username: 'testuser' // Same username
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value/i);
  });
});
