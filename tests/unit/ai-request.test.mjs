import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFitRequest, validateReportRequest, createWindowLimiter } from '../../server/utils/ai-request.mjs';

test('fit endpoint input only accepts bounded fixture evidence', () => {
  assert.throws(() => validateFitRequest({ campaignId: 'campaign-lumina', creators: [{ id: 'attacker', title: 'x'.repeat(5000) }] }), /unknown|limit/i);
  const parsed = validateFitRequest({ campaignId: 'campaign-lumina', creators: [{ id: 'creator-arunika', channel: { title: 'Arunika Journal' }, videos: [{ id: 'video-arunika-1', title: 'Skincare routine', views: 1200 }] }] });
  assert.equal(parsed.creatorIds.length, 1);
});

test('fit endpoint accepts bounded campaign briefs for locally created campaigns', () => {
  const parsed = validateFitRequest({ campaignId: 'campaign-local-123', campaign: { name: 'Local brief', brandName: 'Aruna', product: 'Cleanser', objective: 'Find creators who can tell an ingredient-led skincare story.' }, creators: [{ id: 'creator-arunika' }] });
  assert.equal(parsed.campaign.name, 'Local brief');
  assert.throws(() => validateFitRequest({ campaignId: 'campaign-local-123', campaign: { name: 'x', objective: 'x'.repeat(700) }, creators: [{ id: 'creator-arunika' }] }), /characters/i);
});

test('report request accepts only fixture video IDs and bounded payloads', () => {
  assert.throws(() => validateReportRequest({ reportId: 'report-brand-deal', videoIds: ['external-id'] }), /unknown|invalid/i);
  assert.equal(validateReportRequest({ reportId: 'report-local-id', reportType: 'brand-deal', videoIds: ['video-maya-1'] }).videoIds.length, 1);
});

test('window limiter blocks excess calls and permits a new window', () => {
  const limiter = createWindowLimiter({ limit: 2, windowMs: 1000 });
  assert.equal(limiter.take('client', 10), true);
  assert.equal(limiter.take('client', 11), true);
  assert.equal(limiter.take('client', 12), false);
  assert.equal(limiter.take('client', 1011), true);
});
