
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable, linkClicksTable } from '../db/schema';
import { getLinkAnalytics } from '../handlers/get_link_analytics';

describe('getLinkAnalytics', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return link analytics for premium user', async () => {
    // Create premium user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'premium@test.com',
        username: 'premiumuser',
        is_premium: true
      })
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create link
    const linkResult = await db.insert(linksTable)
      .values({
        user_id: userId,
        title: 'Test Link',
        url: 'https://example.com',
        order_index: 0
      })
      .returning()
      .execute();

    const linkId = linkResult[0].id;

    // Create link clicks
    await db.insert(linkClicksTable)
      .values([
        {
          link_id: linkId,
          user_id: userId,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0',
          referrer: 'https://google.com',
          country: 'US'
        },
        {
          link_id: linkId,
          user_id: userId,
          ip_address: '192.168.1.2',
          user_agent: 'Chrome/91.0',
          country: 'CA'
        }
      ])
      .execute();

    const analytics = await getLinkAnalytics(userId);

    expect(analytics).toHaveLength(2);
    expect(analytics[0].link_id).toEqual(linkId);
    expect(analytics[0].user_id).toEqual(userId);
    expect(analytics[0].ip_address).toBeDefined();
    expect(analytics[0].country).toBeDefined();
    expect(analytics[0].clicked_at).toBeInstanceOf(Date);
    
    // Should be ordered by clicked_at desc
    expect(analytics[0].clicked_at >= analytics[1].clicked_at).toBe(true);
  });

  it('should reject non-premium users', async () => {
    // Create non-premium user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'basic@test.com',
        username: 'basicuser',
        is_premium: false
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    await expect(getLinkAnalytics(userId)).rejects.toThrow(/premium subscription required/i);
  });

  it('should reject non-existent users', async () => {
    const fakeUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    await expect(getLinkAnalytics(fakeUserId)).rejects.toThrow(/user not found/i);
  });

  it('should filter by date range', async () => {
    // Create premium user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'premium2@test.com',
        username: 'premiumuser2',
        is_premium: true
      })
      .returning()
      .execute();
    
    const userId = userResult[0].id;

    // Create link
    const linkResult = await db.insert(linksTable)
      .values({
        user_id: userId,
        title: 'Test Link 2',
        url: 'https://example2.com',
        order_index: 0
      })
      .returning()
      .execute();

    const linkId = linkResult[0].id;

    // Create old click (40 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40);

    await db.insert(linkClicksTable)
      .values([
        {
          link_id: linkId,
          user_id: userId,
          ip_address: '192.168.1.3',
          clicked_at: oldDate
        },
        {
          link_id: linkId,
          user_id: userId,
          ip_address: '192.168.1.4'
        }
      ])
      .execute();

    // Get analytics for last 30 days
    const analytics = await getLinkAnalytics(userId, 30);

    // Should only return recent click, not the 40-day-old one
    expect(analytics).toHaveLength(1);
    expect(analytics[0].ip_address).toEqual('192.168.1.4');
  });

  it('should only return clicks for user owned links', async () => {
    // Create two premium users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@test.com',
        username: 'user1',
        is_premium: true
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@test.com',
        username: 'user2',
        is_premium: true
      })
      .returning()
      .execute();
    
    const user1Id = user1Result[0].id;
    const user2Id = user2Result[0].id;

    // Create links for both users
    const link1Result = await db.insert(linksTable)
      .values({
        user_id: user1Id,
        title: 'User 1 Link',
        url: 'https://user1.com',
        order_index: 0
      })
      .returning()
      .execute();

    const link2Result = await db.insert(linksTable)
      .values({
        user_id: user2Id,
        title: 'User 2 Link',
        url: 'https://user2.com',
        order_index: 0
      })
      .returning()
      .execute();

    // Create clicks for both links
    await db.insert(linkClicksTable)
      .values([
        {
          link_id: link1Result[0].id,
          user_id: user1Id,
          ip_address: '192.168.1.5'
        },
        {
          link_id: link2Result[0].id,
          user_id: user2Id,
          ip_address: '192.168.1.6'
        }
      ])
      .execute();

    // User 1 should only see their own link clicks
    const user1Analytics = await getLinkAnalytics(user1Id);
    expect(user1Analytics).toHaveLength(1);
    expect(user1Analytics[0].link_id).toEqual(link1Result[0].id);

    // User 2 should only see their own link clicks
    const user2Analytics = await getLinkAnalytics(user2Id);
    expect(user2Analytics).toHaveLength(1);
    expect(user2Analytics[0].link_id).toEqual(link2Result[0].id);
  });
});
