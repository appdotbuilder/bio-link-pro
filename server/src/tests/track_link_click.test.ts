
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, linksTable, linkClicksTable } from '../db/schema';
import { type TrackLinkClickInput } from '../schema';
import { trackLinkClick } from '../handlers/track_link_click';
import { eq } from 'drizzle-orm';

describe('trackLinkClick', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testUserId: string;
  let testLinkId: string;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        username: 'testuser'
      })
      .returning()
      .execute();
    testUserId = userResult[0].id;

    // Create test link
    const linkResult = await db.insert(linksTable)
      .values({
        user_id: testUserId,
        title: 'Test Link',
        url: 'https://example.com',
        order_index: 1
      })
      .returning()
      .execute();
    testLinkId = linkResult[0].id;
  });

  it('should track a link click with minimal data', async () => {
    const input: TrackLinkClickInput = {
      link_id: testLinkId
    };

    const result = await trackLinkClick(input);

    expect(result.id).toBeDefined();
    expect(result.link_id).toEqual(testLinkId);
    expect(result.user_id).toEqual(testUserId);
    expect(result.ip_address).toBeNull();
    expect(result.user_agent).toBeNull();
    expect(result.referrer).toBeNull();
    expect(result.country).toBeNull();
    expect(result.clicked_at).toBeInstanceOf(Date);
  });

  it('should track a link click with full metadata', async () => {
    const input: TrackLinkClickInput = {
      link_id: testLinkId,
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referrer: 'https://google.com'
    };

    const result = await trackLinkClick(input);

    expect(result.link_id).toEqual(testLinkId);
    expect(result.user_id).toEqual(testUserId);
    expect(result.ip_address).toEqual('192.168.1.1');
    expect(result.user_agent).toEqual('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    expect(result.referrer).toEqual('https://google.com');
    expect(result.clicked_at).toBeInstanceOf(Date);
  });

  it('should save click record to database', async () => {
    const input: TrackLinkClickInput = {
      link_id: testLinkId,
      ip_address: '10.0.0.1'
    };

    const result = await trackLinkClick(input);

    const clicks = await db.select()
      .from(linkClicksTable)
      .where(eq(linkClicksTable.id, result.id))
      .execute();

    expect(clicks).toHaveLength(1);
    expect(clicks[0].link_id).toEqual(testLinkId);
    expect(clicks[0].user_id).toEqual(testUserId);
    expect(clicks[0].ip_address).toEqual('10.0.0.1');
  });

  it('should increment link click count', async () => {
    const input: TrackLinkClickInput = {
      link_id: testLinkId
    };

    // Get initial click count
    const initialLink = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, testLinkId))
      .execute();
    const initialClickCount = initialLink[0].click_count;

    // Track a click
    await trackLinkClick(input);

    // Verify click count was incremented
    const updatedLink = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, testLinkId))
      .execute();

    expect(updatedLink[0].click_count).toEqual(initialClickCount + 1);
    expect(updatedLink[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent link', async () => {
    const input: TrackLinkClickInput = {
      link_id: '00000000-0000-0000-0000-000000000000'
    };

    await expect(trackLinkClick(input)).rejects.toThrow(/Link with id .* not found/);
  });

  it('should handle multiple clicks on same link', async () => {
    const input: TrackLinkClickInput = {
      link_id: testLinkId
    };

    // Track multiple clicks
    await trackLinkClick(input);
    await trackLinkClick(input);
    await trackLinkClick(input);

    // Verify all clicks were recorded
    const clicks = await db.select()
      .from(linkClicksTable)
      .where(eq(linkClicksTable.link_id, testLinkId))
      .execute();

    expect(clicks).toHaveLength(3);

    // Verify click count was properly incremented
    const link = await db.select()
      .from(linksTable)
      .where(eq(linksTable.id, testLinkId))
      .execute();

    expect(link[0].click_count).toEqual(3);
  });
});
