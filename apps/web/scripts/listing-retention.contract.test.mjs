import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../../../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('archive and deletion use separate 30-day clocks', async () => {
  const sql = await read('apps/web/drizzle/0024_listing_retention.sql');
  assert.match(sql, /created_at <= p_now - interval '30 days'/);
  assert.match(sql, /SET archived_at = p_now,\s+is_available = false/);
  assert.doesNotMatch(sql, /archived_at IS NULL\s+AND is_available = true/);
  assert.match(sql, /archived_at <= p_now - interval '30 days'/);
  assert.doesNotMatch(sql, /updated_at\s*<=/);
});

test('transaction and swap history are snapshotted and detached', async () => {
  const sql = await read('apps/web/drizzle/0024_listing_retention.sql');
  assert.match(sql, /transaction_listing_id_shoe_listing_id_fk[\s\S]*ON DELETE SET NULL/);
  assert.match(sql, /swap_item_swap_item_id_shoe_listing_id_fk[\s\S]*ON DELETE SET NULL/);
  assert.match(sql, /SET listing_snapshot = COALESCE\(listing_snapshot, v_snapshot\), listing_id = NULL/);
  assert.match(sql, /SET listing_snapshot = COALESCE\(listing_snapshot, v_snapshot\), swap_item_id = NULL/);
});

test('deletion runs directly in Postgres without external configuration', async () => {
  const sql = await read('apps/web/drizzle/0024_listing_retention.sql');
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.delete_due_listings/);
  assert.match(sql, /'SELECT public\.delete_due_listings\(\);'/);
  assert.doesNotMatch(sql, /pg_net|net\.http_post|vault\.|LISTING_RETENTION_SECRET/);
});

test('owner and public access rules expose the archived state correctly', async () => {
  const ownerRoute = await read('apps/web/src/app/api/users/me/listings/route.ts');
  const detailRoute = await read('apps/web/src/app/api/listings/[id]/route.ts');
  const mobile = await read('apps/mobile/src/app/profile/listings.tsx');
  assert.match(ownerRoute, /getShoeListingsByUserId\(currentUser\.user\.id, filters, true\)/);
  assert.match(detailRoute, /shoeListing\.archivedAt && shoeListing\.seller\.id !== currentUser\.user\.id/);
  assert.match(mobile, /isArchived \? 'Archived' : 'Unavailable'/);
});

test('Cron schedules are named and safely replaceable', async () => {
  const migration = await read('apps/web/drizzle/0024_listing_retention.sql');
  const rollback = await read('apps/web/scripts/rollback-listing-retention.sql');
  for (const name of ['archive-listings-daily', 'delete-archived-listings-daily']) {
    assert.match(migration, new RegExp(`jobname = '${name}'[\\s\\S]*cron\\.unschedule`));
    assert.match(migration, new RegExp(`cron\\.schedule\\(\\s*'${name}'`));
    assert.match(rollback, new RegExp(`jobname = '${name}'[\\s\\S]*cron\\.unschedule`));
  }
});
