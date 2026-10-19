import test from 'node:test';
import assert from 'node:assert/strict';

const selectors = await import('../../demo/selectors.mjs').catch(() => null);
const seedModule = await import('../../demo/seed.mjs').catch(() => null);
const commands = await import('../../demo/commands.mjs').catch(() => null);

test('public analytics uses public video metrics and the selected hierarchy scope only', () => {
  assert.equal(typeof selectors?.selectPublicAnalytics, 'function');
  const state = {
    channels: [
      { id: 'channel-a', organizationId: 'org-a', networkId: 'network-a', title: 'A', subscriberCount: 1200, totalViews: 9800 },
      { id: 'channel-b', organizationId: 'org-b', networkId: 'network-b', title: 'B', subscriberCount: null, totalViews: 4200 },
    ],
    videos: [
      { id: 'video-a', channelId: 'channel-a', title: 'Routine', publishedAt: '2026-10-04', views: 3000, likes: 120, comments: 14 },
      { id: 'video-b', channelId: 'channel-b', title: 'Review', publishedAt: '2026-09-18', views: 2300, likes: 88, comments: 9 },
    ],
  };
  const result = selectors.selectPublicAnalytics(state, { role: 'agency', organizationId: 'org-a' }, { startDate: '2026-10-01', endDate: '2026-10-31' });
  assert.deepEqual(result.channels.map((channel) => channel.id), ['channel-a']);
  assert.deepEqual(result.videos.map((video) => video.id), ['video-a']);
  assert.equal(result.lifetimeViews, 9800);
  assert.equal(result.periodVideoViews, 3000);
  assert.equal(result.campaignMetrics, undefined);
});

test('demo seed contains consistent hierarchy, creator evidence, reports, and public analytics fixtures', () => {
  assert.equal(typeof seedModule?.createSeed, 'function');
  const state = seedModule.createSeed('2026-10-17');
  // The seed models the single P2P Labs organization snapshot (see docs/provenance.md),
  // so the hierarchy is one organization with three partner networks beneath it.
  assert.ok(state.organizations.length >= 1);
  assert.ok(state.networks.length >= 3);
  assert.ok(state.channels.length >= 6);
  assert.ok(state.videos.length >= 10);
  assert.ok(state.campaigns.length >= 2);
  assert.ok(state.reports.length >= 1);
  assert.ok(state.profilingSets.length >= 1);
  assert.ok(state.channels.every((channel) => state.organizations.some((org) => org.id === channel.organizationId)));
  assert.ok(state.videos.every((video) => state.channels.some((channel) => channel.id === video.channelId)));
});

test('creator matching commands persist shortlist changes without changing public counters', () => {
  assert.equal(typeof commands?.executeCommand, 'function');
  const initial = seedModule.createSeed('2026-10-17');
  const creatorId = initial.creators[0].id;
  const session = { role: 'agency', userId: 'agency-demo', organizationId: 'org-orbit' };
  const next = commands.executeCommand(initial, session, { type: 'shortlist:add', campaignId: 'campaign-lumina', creatorId });
  assert.ok(next.shortlists.some((item) => item.campaignId === 'campaign-lumina' && item.creatorId === creatorId));
  assert.deepEqual(next.channels.map(({ id, totalViews }) => [id, totalViews]), initial.channels.map(({ id, totalViews }) => [id, totalViews]));
  assert.throws(() => commands.executeCommand(next, { role: 'creator', userId: 'creator-demo', channelId: 'channel-maya' }, { type: 'shortlist:add', campaignId: 'campaign-lumina', creatorId: initial.creators[1].id }));
});

test('saved reports and generated insight use the report owner scope', () => {
  assert.equal(typeof selectors?.selectReport, 'function');
  const state = seedModule.createSeed('2026-10-17');
  assert.ok(selectors.selectReport(state, { role: 'admin', userId: 'admin-demo' }, state.reports[0].id));
  assert.equal(selectors.selectReport(state, { role: 'creator', userId: 'other-creator' }, state.reports[0].id), null);
});

test('demo commands accept reactive state proxies used by the Pinia store', () => {
  const state = seedModule.createSeed('2026-10-17');
  const reactiveState = new Proxy(state, {});
  const next = commands.executeCommand(reactiveState, { role: 'agency', userId: 'agency-demo', organizationId: 'org-orbit' }, {
    type: 'campaign:save-fit', campaignId: 'campaign-lumina', results: [{ creatorId: 'creator-maya', fitScore: 88 }],
  });
  assert.equal(next.campaigns.find((campaign) => campaign.id === 'campaign-lumina').fitResults[0].fitScore, 88);
});
