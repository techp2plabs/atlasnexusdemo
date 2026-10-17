const sampleFitLibrary = Object.fromEntries([
  ['creator-maya', 'video-maya'],
  ['creator-ruang', 'video-ruang'],
  ['creator-nara', 'video-nara'],
  ['creator-arunika', 'video-arunika'],
  ['creator-bima', 'video-bima'],
  ['creator-senja', 'video-senja'],
  ['creator-kin', 'video-kin'],
  ['creator-loka', 'video-loka'],
].map(([creatorId, videoId], index) => [creatorId, {
  fitScore: [68, 55, 51, 49, 63, 57, 46, 48][index],
  summary: 'Sample estimate only; the organization snapshot contains channel counters, not enough topic evidence to confirm a campaign fit.',
  reasons: ['The channel is listed under P2P Labs in the Atlas Nexus organization snapshot.', 'Review the creator’s current public videos to validate subject matter and format.'],
  evidenceIds: [`${videoId}-1`, `${videoId}-2`],
  recommendation: 'Open the channel and review recent public videos before adding this creator to a campaign shortlist.',
  limitations: ['This is a sample estimate, not a Gemini result.', 'Video records and counters in this demo are fixtures, not live YouTube data.', 'Channel subscriber and view counts are rounded snapshots from Atlas Nexus.', 'Public counters do not show audience demographics or brand safety.'],
}]));

export function sampleCreatorFit(creatorIds) {
  return creatorIds.map((creatorId) => ({ creatorId, ...(sampleFitLibrary[creatorId] || { fitScore: null, summary: 'There is not enough sample evidence to estimate a match.', reasons: ['Public channel profile data is incomplete for this creator.'], evidenceIds: [], recommendation: 'Review the public channel and video evidence before shortlisting.', limitations: ['This is a sample preview, not a Gemini result.'] }) }));
}

export function sampleReportInsight(metrics, name = 'this report') {
  return {
    summary: `${name} includes ${metrics.videoCount} sample videos with ${metrics.views.toLocaleString('en-US')} fixture views.`,
    strengths: metrics.videoCount ? ['The demo shows how a public video snapshot could be summarized.'] : [],
    recommendations: ['Replace sample video evidence with current public YouTube records before using fit results.'],
    limitations: ['This report uses fixture video titles and counters, not live YouTube data.', 'Audience demographics and private watch-time data are not included.'],
  };
}
