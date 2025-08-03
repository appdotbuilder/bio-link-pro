
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { checkUserLimits } from '../handlers/check_user_limits';

describe('checkUserLimits', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    it('should return limits for free user with no links', async () => {
        // Create a free user
        const userResult = await db.insert(usersTable)
            .values({
                email: 'test@example.com',
                username: 'testuser',
                is_premium: false
            })
            .returning()
            .execute();

        const userId = userResult[0].id;

        const result = await checkUserLimits(userId);

        expect(result.canCreateLink).toBe(true);
        expect(result.linkCount).toBe(0);
        expect(result.maxLinks).toBe(5);
        expect(result.isPremium).toBe(false);
    });

    it('should return limits for free user at link limit', async () => {
        // Create a free user
        const userResult = await db.insert(usersTable)
            .values({
                email: 'test@example.com',
                username: 'testuser',
                is_premium: false
            })
            .returning()
            .execute();

        const userId = userResult[0].id;

        // Create 5 active links (at the limit)
        for (let i = 0; i < 5; i++) {
            await db.insert(linksTable)
                .values({
                    user_id: userId,
                    title: `Link ${i + 1}`,
                    url: `https://example${i + 1}.com`,
                    is_active: true,
                    order_index: i
                })
                .execute();
        }

        const result = await checkUserLimits(userId);

        expect(result.canCreateLink).toBe(false);
        expect(result.linkCount).toBe(5);
        expect(result.maxLinks).toBe(5);
        expect(result.isPremium).toBe(false);
    });

    it('should return limits for premium user with many links', async () => {
        // Create a premium user
        const userResult = await db.insert(usersTable)
            .values({
                email: 'premium@example.com',
                username: 'premiumuser',
                is_premium: true
            })
            .returning()
            .execute();

        const userId = userResult[0].id;

        // Create 10 active links (more than free limit)
        for (let i = 0; i < 10; i++) {
            await db.insert(linksTable)
                .values({
                    user_id: userId,
                    title: `Link ${i + 1}`,
                    url: `https://example${i + 1}.com`,
                    is_active: true,
                    order_index: i
                })
                .execute();
        }

        const result = await checkUserLimits(userId);

        expect(result.canCreateLink).toBe(true);
        expect(result.linkCount).toBe(10);
        expect(result.maxLinks).toBe(-1); // -1 represents unlimited
        expect(result.isPremium).toBe(true);
    });

    it('should only count active links', async () => {
        // Create a free user
        const userResult = await db.insert(usersTable)
            .values({
                email: 'test@example.com',
                username: 'testuser',
                is_premium: false
            })
            .returning()
            .execute();

        const userId = userResult[0].id;

        // Create 3 active links and 3 inactive links
        for (let i = 0; i < 3; i++) {
            await db.insert(linksTable)
                .values({
                    user_id: userId,
                    title: `Active Link ${i + 1}`,
                    url: `https://active${i + 1}.com`,
                    is_active: true,
                    order_index: i
                })
                .execute();

            await db.insert(linksTable)
                .values({
                    user_id: userId,
                    title: `Inactive Link ${i + 1}`,
                    url: `https://inactive${i + 1}.com`,
                    is_active: false,
                    order_index: i + 10
                })
                .execute();
        }

        const result = await checkUserLimits(userId);

        expect(result.canCreateLink).toBe(true);
        expect(result.linkCount).toBe(3); // Only active links counted
        expect(result.maxLinks).toBe(5);
        expect(result.isPremium).toBe(false);
    });

    it('should throw error for non-existent user', async () => {
        const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

        await expect(checkUserLimits(nonExistentUserId)).rejects.toThrow(/User not found/i);
    });
});
