import { createSeed } from './seed.mjs';
import { selectCampaign, selectReport, selectProfilingSet } from './selectors.mjs';

function nextId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function executeCommand(state, session, command) {
  // The Pinia store passes Vue reactive proxies here; JSON fixtures are
  // serializable, while structuredClone rejects those proxies.
  const next = JSON.parse(JSON.stringify(state));
  if (!session?.role || !command?.type) throw new Error('Choose a demo role and action.');
  if (command.type === 'demo:reset') return createSeed(state.seedDate);

  if (command.type === 'campaign:create') {
    if (session.role !== 'agency') throw new Error('Only Agency can create a campaign.');
    const name = String(command.name || '').trim();
    const objective = String(command.objective || '').trim();
    if (name.length < 3 || objective.length < 12) throw new Error('Add a campaign name and a clear objective.');
    const campaign = { id: nextId('campaign'), ownerId: session.userId, organizationId: session.organizationId, name, brandName: String(command.brandName || '').trim(), product: String(command.product || '').trim(), objective, audience: String(command.audience || '').trim(), languages: command.languages?.length ? command.languages : ['Indonesian'], formats: command.formats?.length ? command.formats : ['Long-form'], createdAt: state.seedDate, fitResults: [] };
    next.campaigns.unshift(campaign);
    return next;
  }

  if (command.type === 'shortlist:add' || command.type === 'shortlist:remove') {
    const campaign = selectCampaign(next, session, command.campaignId);
    if (!campaign || session.role !== 'agency') throw new Error('Only the campaign owner can change its shortlist.');
    if (!next.creators.some((creator) => creator.id === command.creatorId)) throw new Error('Choose a creator from the demo profiles.');
    next.shortlists = next.shortlists.filter((item) => !(item.campaignId === command.campaignId && item.creatorId === command.creatorId));
    if (command.type === 'shortlist:add') next.shortlists.push({ campaignId: command.campaignId, creatorId: command.creatorId });
    return next;
  }

  if (command.type === 'campaign:save-fit') {
    const campaign = selectCampaign(next, session, command.campaignId);
    if (!campaign || session.role !== 'agency') throw new Error('Only the campaign owner can save fit analysis.');
    if (!Array.isArray(command.results) || command.results.length > 8) throw new Error('Fit analysis has an invalid creator list.');
    for (const result of command.results) {
      if (!next.creators.some((creator) => creator.id === result.creatorId) || !Number.isInteger(result.fitScore) || result.fitScore < 0 || result.fitScore > 100) throw new Error('Fit analysis includes an invalid creator or score.');
    }
    campaign.fitResults = structuredClone(command.results);
    return next;
  }

  if (command.type === 'report:create') {
    const type = command.reportType;
    const allowed = ['brand-deal', 'channel'];
    if (!allowed.includes(type) || !Array.isArray(command.videoIds) || !command.videoIds.length || command.videoIds.length > 20) throw new Error('Choose up to 20 demo videos for the report.');
    const videoIds = [...new Set(command.videoIds)];
    if (videoIds.some((id) => !next.videos.some((video) => video.id === id))) throw new Error('A selected video is not in the public demo data.');
    const channelId = type === 'channel' ? command.channelId : null;
    if (channelId && !videoIds.every((id) => next.videos.find((video) => video.id === id)?.channelId === channelId)) throw new Error('Channel reports can only contain videos from the selected channel.');
    const organizationId = type === 'brand-deal' ? session.organizationId : undefined;
    if (type === 'brand-deal' && session.role !== 'agency') throw new Error('Brand Deal Reports are available to Agency in this demo.');
    const report = { id: nextId('report'), type, name: String(command.name || (type === 'brand-deal' ? 'Untitled creator report' : 'Channel performance report')).slice(0, 90), ownerId: session.userId, organizationId, channelId, period: command.period || null, brandName: String(command.brandName || '').slice(0, 80), videoIds, createdAt: state.seedDate, insight: null };
    next.reports.unshift(report);
    return next;
  }

  if (command.type === 'report:save-insight') {
    const report = selectReport(next, session, command.reportId);
    if (!report || !command.insight || !['sample', 'gemini'].includes(command.mode)) throw new Error('Report insight could not be saved.');
    report.insight = { ...structuredClone(command.insight), mode: command.mode, createdAt: new Date().toISOString() };
    next.insightAttempts.unshift({ id: nextId('insight'), reportId: report.id, mode: command.mode, createdAt: report.insight.createdAt });
    return next;
  }

  if (command.type === 'profiling:save') {
    const set = selectProfilingSet(next, session, command.setId);
    if (!set || session.role !== 'agency') throw new Error('Only the set owner can change profiling channels.');
    const channelIds = [...new Set(command.channelIds || [])];
    if (!channelIds.length || channelIds.some((id) => !next.channels.some((channel) => channel.id === id))) throw new Error('Keep at least one valid channel in this profiling set.');
    set.channelIds = channelIds;
    return next;
  }

  if (command.type === 'hierarchy:create-organization') {
    if (session.role !== 'admin') throw new Error('Only Admin can create organizations.');
    const name = String(command.name || '').trim();
    if (name.length < 2) throw new Error('Organization name must contain at least two characters.');
    next.organizations.push({ id: nextId('org'), name, city: String(command.city || '').trim(), status: 'Active' });
    return next;
  }

  if (command.type === 'hierarchy:create-network') {
    if (session.role !== 'admin') throw new Error('Only Admin can create networks.');
    const organization = next.organizations.find((item) => item.id === command.organizationId);
    const name = String(command.name || '').trim();
    if (!organization || name.length < 2) throw new Error('Choose an organization and enter a network name.');
    next.networks.push({ id: nextId('network'), organizationId: organization.id, name });
    return next;
  }

  if (command.type === 'hierarchy:assign-channel') {
    if (session.role !== 'admin') throw new Error('Only Admin can assign channels.');
    const channel = next.channels.find((item) => item.id === command.channelId);
    const network = next.networks.find((item) => item.id === command.networkId);
    if (!channel || !network) throw new Error('Choose a channel and network from the hierarchy.');
    channel.networkId = network.id;
    channel.organizationId = network.organizationId;
    return next;
  }

  throw new Error('That demo action is not available.');
}
