import test from 'node:test';
import assert from 'node:assert/strict';

const contracts = await import('../../demo/ai-contracts.mjs').catch(() => null);

test('creator fit output rejects unknown creator ids and scores outside 0–100', () => {
  assert.equal(typeof contracts?.validateCreatorFit, 'function');
  const allowed = ['creator-maya'];
  assert.throws(() => contracts.validateCreatorFit({ creatorId: 'unknown', fitScore: 95, summary: 'Strong fit', reasons: ['Evidence'], recommendation: 'Shortlist', limitations: [] }, allowed));
  assert.throws(() => contracts.validateCreatorFit({ creatorId: 'creator-maya', fitScore: 101, summary: 'Strong fit', reasons: ['Evidence'], recommendation: 'Shortlist', limitations: [] }, allowed));
  assert.doesNotThrow(() => contracts.validateCreatorFit({ creatorId: 'creator-maya', fitScore: 82, summary: 'Strong fit', reasons: ['Evidence'], evidenceIds: ['video-maya-1'], recommendation: 'Shortlist', limitations: [] }, allowed, ['video-maya-1']));
  assert.throws(() => contracts.validateCreatorFit({ creatorId: 'creator-maya', fitScore: 82, summary: 'Strong fit', reasons: ['Evidence'], evidenceIds: ['external-video'], recommendation: 'Shortlist', limitations: [] }, allowed, ['video-maya-1']));
});

test('report insight output contains concise evidence grounded in the report input', () => {
  assert.equal(typeof contracts?.validateReportInsight, 'function');
  const result = contracts.validateReportInsight({ summary: 'The videos reached 120000 views.', strengths: ['Routine videos led views.'], recommendations: ['Continue practical routine videos.'], limitations: ['Public counters are cumulative.'] }, { views: 120000 });
  assert.equal(result.summary, 'The videos reached 120000 views.');
  assert.throws(() => contracts.validateReportInsight({ summary: 'The videos earned $90000.', strengths: [], recommendations: [], limitations: [] }, { views: 120000 }));
});

test('sample fit preview covers all eight seeded creators with traceable public evidence', async () => {
  const { createSeed } = await import('../../demo/seed.mjs');
  const { sampleCreatorFit } = await import('../../demo/sample-insights.mjs');
  const seed = createSeed();
  const results = sampleCreatorFit(seed.creators.map((creator) => creator.id));
  assert.equal(results.length, 8);
  for (const result of results) {
    const creator = seed.creators.find((item) => item.id === result.creatorId);
    assert.ok(Number.isInteger(result.fitScore));
    assert.ok(result.evidenceIds.length > 0);
    assert.ok(result.evidenceIds.every((id) => seed.videos.some((video) => video.id === id && video.channelId === creator.channelId)));
  }
});
