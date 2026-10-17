import test from 'node:test';
import assert from 'node:assert/strict';
const suites = await import('../../demo/suite-metrics.mjs').catch(() => null);

test('report metrics aggregate selected public videos without using other reports', () => {
  assert.equal(typeof suites?.summarizeReport, 'function');
  const state = { videos: [
    { id: 'v1', channelId: 'c1', views: 100, likes: 8, comments: 2, publishedAt: '2026-10-03' },
    { id: 'v2', channelId: 'c1', views: 250, likes: 12, comments: 3, publishedAt: '2026-09-20' },
    { id: 'v3', channelId: 'c2', views: 500, likes: 40, comments: 11, publishedAt: '2026-10-06' },
  ], reports: [{ id: 'r1', videoIds: ['v1', 'v2'] }, { id: 'r2', videoIds: ['v3'] }] };
  assert.deepEqual(suites.summarizeReport(state, 'r1'), { videoCount: 2, views: 350, likes: 20, comments: 5, channels: 1 });
  assert.deepEqual(suites.summarizeReport(state, 'r2'), { videoCount: 1, views: 500, likes: 40, comments: 11, channels: 1 });
});

test('public YouTube period report selects videos by publication date but keeps lifetime counters', () => {
  assert.equal(typeof suites?.selectVideosForPeriod, 'function');
  const videos = [
    { id: 'v1', publishedAt: '2026-10-03', views: 1000 },
    { id: 'v2', publishedAt: '2026-09-30', views: 3000 },
  ];
  const result = suites.selectVideosForPeriod(videos, '2026-10-01', '2026-10-31');
  assert.deepEqual(result.map((video) => video.id), ['v1']);
  assert.equal(result[0].views, 1000);
});
