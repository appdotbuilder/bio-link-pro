
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { deleteLink } from '../handlers/delete_link';
import { eq, and, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Test data
const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    display_name: 'Test User',
    avatar_url: null,
    bio: null,
    theme: 'light' as const
};

const testLinks = [
    {
        title: 'First Link',
        url: 'https://example1.com',
        icon: null,
        description: 'First test link',
        order_index: 0
    },
    {
        title: 'Second Link', 
        url: 'https://example2.com',
        icon: null,
        description: 'Second test link',
        order_index: 1
    },
    {
        title: 'Third Link',
        url: 'https://example3.com', 
        icon: null,
        description: 'Third test link',
        order_index: 2
    }
];

describe('deleteLink', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    it('should delete a link successfully', async () => {
        // Create test user
        const userResult = await db.insert(usersTable)
            .values(testUser)
            .returning()
            .execute();
        const user = userResult[0];

        // Create test links
        const linkResults = await db.insert(linksTable)
            .values(testLinks.map(link => ({
                ...link,
                user_id: user.id
            })))
            .returning()
            .execute();

        const linkToDelete = linkResults[1]; // Delete middle link

        const input = {
            id: linkToDelete.id,
            user_id: user.id
        };

        const result = await deleteLink(input);

        expect(result.success).toBe(true);

        // Verify link was deleted
        const deletedLink = await db.select()
            .from(linksTable)
            .where(eq(linksTable.id, linkToDelete.id))
            .execute();

        expect(deletedLink).toHaveLength(0);
    });

    it('should reorder remaining links after deletion', async () => {
        // Create test user
        const userResult = await db.insert(usersTable)
            .values(testUser)
            .returning()
            .execute();
        const user = userResult[0];

        // Create test links
        const linkResults = await db.insert(linksTable)
            .values(testLinks.map(link => ({
                ...link,
                user_id: user.id
            })))
            .returning()
            .execute();

        const linkToDelete = linkResults[1]; // Delete middle link (order_index: 1)

        const input = {
            id: linkToDelete.id,
            user_id: user.id
        };

        await deleteLink(input);

        // Verify remaining links are properly reordered
        const remainingLinks = await db.select()
            .from(linksTable)
            .where(eq(linksTable.user_id, user.id))
            .orderBy(asc(linksTable.order_index))
            .execute();

        expect(remainingLinks).toHaveLength(2);
        expect(remainingLinks[0].order_index).toBe(0);
        expect(remainingLinks[0].title).toBe('First Link');
        expect(remainingLinks[1].order_index).toBe(1); // Should be decremented from 2 to 1
        expect(remainingLinks[1].title).toBe('Third Link');
    });

    it('should throw error when link does not exist', async () => {
        // Create test user
        const userResult = await db.insert(usersTable)
            .values(testUser)
            .returning()
            .execute();
        const user = userResult[0];

        const input = {
            id: randomUUID(), // Use valid UUID format
            user_id: user.id
        };

        await expect(deleteLink(input)).rejects.toThrow(/Link not found or unauthorized/i);
    });

    it('should throw error when user does not own the link', async () => {
        // Create first user
        const userResult1 = await db.insert(usersTable)
            .values(testUser)
            .returning()
            .execute();
        const user1 = userResult1[0];

        // Create second user
        const userResult2 = await db.insert(usersTable)
            .values({
                ...testUser,
                email: 'test2@example.com',
                username: 'testuser2'
            })
            .returning()
            .execute();
        const user2 = userResult2[0];

        // Create link for first user
        const linkResult = await db.insert(linksTable)
            .values({
                ...testLinks[0],
                user_id: user1.id
            })
            .returning()
            .execute();
        const link = linkResult[0];

        // Try to delete with second user's ID
        const input = {
            id: link.id,
            user_id: user2.id
        };

        await expect(deleteLink(input)).rejects.toThrow(/Link not found or unauthorized/i);
    });

    it('should handle deletion of first link correctly', async () => {
        // Create test user
        const userResult = await db.insert(usersTable)
            .values(testUser)
            .returning()
            .execute();
        const user = userResult[0];

        // Create test links
        const linkResults = await db.insert(linksTable)
            .values(testLinks.map(link => ({
                ...link,
                user_id: user.id
            })))
            .returning()
            .execute();

        const firstLink = linkResults[0]; // Delete first link (order_index: 0)

        const input = {
            id: firstLink.id,
            user_id: user.id
        };

        await deleteLink(input);

        // Verify remaining links are properly reordered
        const remainingLinks = await db.select()
            .from(linksTable)
            .where(eq(linksTable.user_id, user.id))
            .orderBy(asc(linksTable.order_index))
            .execute();

        expect(remainingLinks).toHaveLength(2);
        expect(remainingLinks[0].order_index).toBe(0); // Should be decremented from 1 to 0
        expect(remainingLinks[0].title).toBe('Second Link');
        expect(remainingLinks[1].order_index).toBe(1); // Should be decremented from 2 to 1
        expect(remainingLinks[1].title).toBe('Third Link');
    });

    it('should handle deletion of last link correctly', async () => {
        // Create test user
        const userResult = await db.insert(usersTable)
            .values(testUser)
            .returning()
            .execute();
        const user = userResult[0];

        // Create test links
        const linkResults = await db.insert(linksTable)
            .values(testLinks.map(link => ({
                ...link,
                user_id: user.id
            })))
            .returning()
            .execute();

        const lastLink = linkResults[2]; // Delete last link (order_index: 2)

        const input = {
            id: lastLink.id,
            user_id: user.id
        };

        await deleteLink(input);

        // Verify remaining links maintain their order
        const remainingLinks = await db.select()
            .from(linksTable)
            .where(eq(linksTable.user_id, user.id))
            .orderBy(asc(linksTable.order_index))
            .execute();

        expect(remainingLinks).toHaveLength(2);
        expect(remainingLinks[0].order_index).toBe(0);
        expect(remainingLinks[0].title).toBe('First Link');
        expect(remainingLinks[1].order_index).toBe(1);
        expect(remainingLinks[1].title).toBe('Second Link');
    });
});
