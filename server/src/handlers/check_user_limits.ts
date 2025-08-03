
import { db } from '../db';
import { usersTable, linksTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export async function checkUserLimits(userId: string): Promise<{ 
    canCreateLink: boolean; 
    linkCount: number; 
    maxLinks: number; 
    isPremium: boolean 
}> {
    try {
        // Get user data to check premium status
        const users = await db.select({
            is_premium: usersTable.is_premium
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .execute();

        if (users.length === 0) {
            throw new Error('User not found');
        }

        const isPremium = users[0].is_premium;

        // Count active links for the user
        const links = await db.select()
            .from(linksTable)
            .where(
                and(
                    eq(linksTable.user_id, userId),
                    eq(linksTable.is_active, true)
                )
            )
            .execute();

        const linkCount = links.length;
        const maxLinks = isPremium ? Infinity : 5;
        const canCreateLink = linkCount < maxLinks;

        return {
            canCreateLink,
            linkCount,
            maxLinks: isPremium ? -1 : 5, // Return -1 for unlimited (Infinity can't be serialized)
            isPremium
        };
    } catch (error) {
        console.error('Check user limits failed:', error);
        throw error;
    }
}
