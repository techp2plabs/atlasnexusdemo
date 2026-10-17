const creatorIds = new Set(['creator-maya', 'creator-ruang', 'creator-nara', 'creator-arunika', 'creator-bima', 'creator-senja', 'creator-kin', 'creator-loka']);
const videoIds = new Set([...creatorIds].flatMap((id) => [1, 2].map((number) => `video-${id.replace('creator-', '')}-${number}`)));
const text = (value, field, max = 500) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`${field} must be a non-empty string under ${max} characters.`);
  return value.trim();
};
const number = (value, field) => {
  if (!Number.isFinite(value) || value < 0 || value > 10_000_000_000) throw new Error(`${field} is outside the allowed range.`);
  return value;
};

export function validateFitRequest(body) {
  if (!body || typeof body.campaignId !== 'string' || !/^campaign-[a-z0-9-]{3,90}$/.test(body.campaignId)) throw new Error('Unknown campaign.');
  let campaign = null;
  if (body.campaign) {
    const brief = body.campaign;
    const allowedTags = new Set(['Indonesian', 'English', 'Long-form', 'Shorts']);
    const tags = (items) => {
      if (items === undefined) return [];
      if (!Array.isArray(items) || items.length > 3 || items.some((item) => !allowedTags.has(item))) throw new Error('Campaign language or format is invalid.');
      return [...new Set(items)];
    };
    campaign = { id: body.campaignId, name: text(brief.name, 'Campaign name', 100), brandName: String(brief.brandName || '').slice(0, 100), product: String(brief.product || '').slice(0, 100), objective: text(brief.objective, 'Campaign objective', 600), audience: String(brief.audience || '').slice(0, 180), languages: tags(brief.languages), formats: tags(brief.formats) };
  } else if (!['campaign-lumina', 'campaign-northstar'].includes(body.campaignId)) throw new Error('Campaign brief is required.');
  const creators = body.creators;
  if (!Array.isArray(creators) || creators.length < 1 || creators.length > 8) throw new Error('Select 1 to 8 creators.');
  const ids = creators.map((creator) => {
    if (!creatorIds.has(creator?.id)) throw new Error('Unknown creator fixture.');
    return creator.id;
  });
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate creator fixtures are not allowed.');
  return { campaignId: body.campaignId, campaign, creatorIds: ids };
}

export function validateReportRequest(body) {
  if (!body || typeof body.reportId !== 'string' || !body.reportId.startsWith('report-') || body.reportId.length > 100 || !['brand-deal', 'channel'].includes(body.reportType)) throw new Error('Unknown report.');
  if (!Array.isArray(body.videoIds) || body.videoIds.length < 1 || body.videoIds.length > 20 || body.videoIds.some((id) => !videoIds.has(id))) throw new Error('Report video selection is invalid.');
  if (new Set(body.videoIds).size !== body.videoIds.length) throw new Error('Duplicate video fixtures are not allowed.');
  return { reportId: body.reportId, reportType: body.reportType, videoIds: [...body.videoIds], name: text(body.name || 'YouTube report', 'Report name', 100) };
}

export function createWindowLimiter({ limit = 10, windowMs = 60_000 } = {}) {
  const clients = new Map();
  return { take(key, now = Date.now()) {
    const previous = clients.get(key);
    if (!previous || now - previous.startedAt >= windowMs) { clients.set(key, { startedAt: now, count: 1 }); return true; }
    if (previous.count >= limit) return false;
    previous.count += 1;
    return true;
  } };
}
