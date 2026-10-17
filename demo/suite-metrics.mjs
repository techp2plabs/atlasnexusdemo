export function selectVideosForPeriod(videos, startDate, endDate) {
  return videos.filter((video) => video.publishedAt >= startDate && video.publishedAt <= endDate);
}

export function summarizeReport(state, reportId) {
  const report = state.reports.find((item) => item.id === reportId);
  if (!report) return null;
  const selected = report.videoIds.map((id) => state.videos.find((video) => video.id === id)).filter(Boolean);
  return {
    videoCount: selected.length,
    views: selected.reduce((sum, video) => sum + (video.views || 0), 0),
    likes: selected.reduce((sum, video) => sum + (video.likes || 0), 0),
    comments: selected.reduce((sum, video) => sum + (video.comments || 0), 0),
    channels: new Set(selected.map((video) => video.channelId)).size,
  };
}

export function channelProfile(state, channelId) {
  const channel = state.channels.find((item) => item.id === channelId);
  const creator = state.creators.find((item) => item.id === channel?.creatorId);
  if (!channel || !creator) return null;
  return {
    channel,
    creator,
    videos: state.videos.filter((video) => video.channelId === channelId).sort((a, b) => b.views - a.views),
  };
}
