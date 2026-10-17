export function scopedChannels(state, session = {}) {
  if (session.role === 'admin') return state.channels;
  if (session.role === 'agency') return state.channels.filter((channel) => channel.organizationId === session.organizationId);
  if (session.role === 'creator') return state.channels.filter((channel) => channel.creatorId === session.creatorId || channel.id === session.channelId);
  return [];
}

export function selectPublicAnalytics(state, session = {}, filters = {}) {
  const channelIds = new Set(scopedChannels(state, session)
    .filter((channel) => !filters.organizationId || channel.organizationId === filters.organizationId)
    .filter((channel) => !filters.networkId || channel.networkId === filters.networkId)
    .filter((channel) => !filters.channelId || channel.id === filters.channelId)
    .map((channel) => channel.id));
  const startDate = filters.startDate || '0000-01-01';
  const endDate = filters.endDate || '9999-12-31';
  const videos = state.videos
    .filter((video) => channelIds.has(video.channelId))
    .filter((video) => video.publishedAt >= startDate && video.publishedAt <= endDate)
    .filter((video) => !filters.query || video.title.toLowerCase().includes(filters.query.toLowerCase()))
    .sort((a, b) => b.views - a.views);
  const channels = state.channels
    .filter((channel) => channelIds.has(channel.id))
    .filter((channel) => !filters.query || channel.title.toLowerCase().includes(filters.query.toLowerCase()))
    .sort((a, b) => b.totalViews - a.totalViews);
  return {
    channels,
    videos,
    lifetimeViews: channels.reduce((sum, channel) => sum + (channel.totalViews || 0), 0),
    subscriberCount: channels.some((channel) => channel.subscriberCount === null) ? null : channels.reduce((sum, channel) => sum + (channel.subscriberCount || 0), 0),
    periodVideoViews: videos.reduce((sum, video) => sum + (video.views || 0), 0),
  };
}

export function selectCampaign(state, session, campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) return null;
  if (session.role === 'admin') return campaign;
  if (session.role === 'agency' && campaign.organizationId === session.organizationId) return campaign;
  return null;
}

export function selectCampaignMatches(state, session, campaignId) {
  if (!selectCampaign(state, session, campaignId)) return [];
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  const shortlisted = new Set(state.shortlists.filter((item) => item.campaignId === campaignId).map((item) => item.creatorId));
  return state.creators.map((creator) => ({
    ...creator,
    channel: state.channels.find((channel) => channel.id === creator.channelId),
    videos: state.videos.filter((video) => video.channelId === creator.channelId),
    fitResult: campaign.fitResults.find((result) => result.creatorId === creator.id) || null,
    shortlisted: shortlisted.has(creator.id),
  }));
}

export function selectReport(state, session, reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return null;
  if (session.role === 'admin') return report;
  if (session.role === 'agency' && (report.organizationId === session.organizationId || report.ownerId === session.userId)) return report;
  if (session.role === 'creator' && (report.ownerId === session.userId || (session.channelId && report.channelId === session.channelId))) return report;
  return null;
}

export function selectReportVideos(state, report) {
  if (!report) return [];
  return report.videoIds.map((id) => state.videos.find((video) => video.id === id)).filter(Boolean);
}

export function selectProfilingSet(state, session, setId) {
  const set = state.profilingSets.find((item) => item.id === setId);
  if (!set) return null;
  if (session.role === 'admin' || set.ownerId === session.userId) return set;
  if (session.role === 'agency' && set.organizationId === session.organizationId) return set;
  return null;
}

export function selectHierarchy(state, session = {}) {
  const organizations = session.role === 'admin'
    ? state.organizations
    : state.organizations.filter((organization) => organization.id === session.organizationId);
  return organizations.map((organization) => ({
    ...organization,
    networks: state.networks.filter((network) => network.organizationId === organization.id).map((network) => ({
      ...network,
      channels: state.channels.filter((channel) => channel.networkId === network.id),
    })),
  }));
}
