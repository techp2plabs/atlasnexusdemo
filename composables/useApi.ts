import {
  TARGET_IDS,
  mockOrganizations,
  mockMcns,
  mockChannels,
  mockContracts,
  mockUsers,
  mockContentOwners,
  mockCreators,
  mockCampaigns,
  mockCreatorSuitesCatalog,
  mockCreatorSuitesTools,
  mockCreatorSuitesSummary,
  mockBrandDealReport,
  mockReportComments,
  mockCommentFetchRun,
  mockReportShareStatus,
  mockCampaignReportInsight,
  mockCampaignReportInsightList,
  mockCampaignReportInsightSummary,
  mockPlatformOverviewData,
  mockActivityItems,
  mockAnalyticsSummaryResponse,
  mockAnalyticsTimeseriesResponse,
  mockAnalyticsTopChannelsResponse,
} from '~/mocks/mockData'

const mockNow = '2026-10-19T00:00:00Z'

function creatorProfile(creator: any) {
  const source = ['manual_lookup', 'import', 'managed_channel', 'brand_deal_report'].includes(creator.source)
    ? creator.source
    : creator.source === 'managed' ? 'managed_channel' : 'manual_lookup'
  const rateCard = creator.rate_card || {}
  return {
    ...creator,
    organization_id: creator.organization_id ?? null,
    mcn_id: creator.mcn_id ?? null,
    source,
    sources: Array.isArray(creator.sources) ? creator.sources : [source],
    channel_id: creator.channel_id || creator.id,
    title: creator.title || creator.name || null,
    description: creator.description || creator.bio || '',
    custom_url: creator.custom_url || creator.handle || null,
    thumbnail_url: creator.thumbnail_url || creator.avatar_url || null,
    country: creator.country || null,
    subscriber_count: creator.subscriber_count ?? null,
    view_count: creator.view_count ?? null,
    video_count: creator.video_count ?? null,
    topics: creator.topics || creator.niches || [],
    keywords: creator.keywords || [],
    performance_summary: creator.performance_summary || {
      avg_views_per_video: creator.avg_views ?? null,
      engagement_rate: creator.engagement_rate ?? null,
      sample_video_count: creator.avg_views ? 20 : 0,
      computed_at: mockNow,
    },
    rate_card: {
      currency: rateCard.currency || creator.currency || 'IDR',
      currency_verified: rateCard.currency_verified ?? false,
      shorts: rateCard.shorts || { min: rateCard.shorts_min ?? null, max: rateCard.shorts_max ?? null },
      longform: rateCard.longform || { min: rateCard.longform_min ?? null, max: rateCard.longform_max ?? null },
      social: rateCard.social || [],
    },
    rate_card_usd_snapshot: creator.rate_card_usd_snapshot ?? null,
    contact: creator.contact ?? null,
    social_links: creator.social_links || [],
    stats_fetched_at: creator.stats_fetched_at ?? mockNow,
    created_at: creator.created_at || mockNow,
    updated_at: creator.updated_at || mockNow,
  }
}

function campaignRecord(campaign: any) {
  const totalBudget = campaign.total_budget ?? campaign.budget_total ?? null
  const creatorBudget = campaign.creator_budget ?? campaign.creators?.reduce((sum: number, creator: any) => sum + (creator.package_cost || 0), 0) ?? 0
  return {
    ...campaign,
    organization_id: campaign.organization_id || TARGET_IDS.organizationDetail,
    organization_name: campaign.organization_name || 'PT Sorak Digital Media',
    mcn_id: campaign.mcn_id ?? null,
    mcn_name: campaign.mcn_name ?? null,
    brand_name: campaign.brand_name || campaign.brand || '',
    total_budget: totalBudget,
    creator_budget: campaign.creator_budget ?? creatorBudget,
    ads_budget: campaign.ads_budget ?? (totalBudget == null ? null : Math.max(0, totalBudget - creatorBudget)),
    duration_days: campaign.duration_days ?? (campaign.start_date && campaign.end_date
      ? Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / 86400000) + 1 : null),
    region: campaign.region || 'Indonesia',
    usd_pricing_snapshot: campaign.usd_pricing_snapshot ?? null,
    launched_at: campaign.launched_at ?? null,
    completed_at: campaign.completed_at ?? null,
    created_at: campaign.created_at || mockNow,
    updated_at: campaign.updated_at || mockNow,
    completeness: campaign.completeness || { percentage: campaign.completeness_pct ?? 0, missing: campaign.missing_fields || [] },
    roster_count: campaign.roster_count ?? campaign.creators?.length ?? 0,
    product_count: campaign.product_count ?? campaign.products?.length ?? 0,
    tracked_video_count: campaign.tracked_video_count ?? campaign.videos?.filter((video: any) => video.status === 'tracked').length ?? 0,
    pending_video_count: campaign.pending_video_count ?? campaign.videos?.filter((video: any) => video.status !== 'tracked').length ?? 0,
    budget_overrun: campaign.budget_overrun ?? null,
    forecast_stale: campaign.forecast_stale ?? false,
    campaign_code: campaign.campaign_code ?? null,
    external_campaign_code: campaign.external_campaign_code ?? null,
    campaign_code_version: campaign.campaign_code_version ?? 1,
  }
}

export function useApi() {
  const handleMockRequest = async (method: string, url: string, data?: any, params?: Record<string, any>) => {
    // Artificial small delay for realistic UX interaction (40ms)
    await new Promise((r) => setTimeout(r, 40))

    const cleanUrl = url.split('?')[0].replace('/api/v1', '').replace('/api', '')

    // 1. OVERVIEW & DASHBOARD
    if (cleanUrl === '/dashboard/platform-overview' || cleanUrl.includes('/overview/platform') || cleanUrl.includes('/overview/control-tower')) {
      return { data: { ...mockPlatformOverviewData } }
    }
    if (cleanUrl === '/dashboard/activity') {
      const timestamps = ['2026-10-19T00:30:00Z', '2026-10-18T22:00:00Z', '2026-10-18T04:00:00Z', '2026-10-17T08:00:00Z']
      return {
        data: {
          items: mockActivityItems.map((item, index) => ({
            id: item.id,
            action: item.action,
            actor_user_id: null,
            actor_name: item.user_name,
            organization_id: null,
            mcn_id: null,
            meta: { target: item.target, type: item.type },
            created_at: timestamps[index] || mockNow,
          })),
        },
      }
    }
    if (cleanUrl.includes('/overview/activity')) {
      return { data: [...mockActivityItems] }
    }
    if (cleanUrl.includes('/overview/creator-suites')) {
      return {
        data: {
          total_reports: 14,
          active_tools: 3,
          recent_summary: 'All tools operating normally',
        },
      }
    }
    if (cleanUrl.includes('/contracts/expiring/count')) {
      return { data: { total: 2, count: 2, expiring_soon: 2 } }
    }
    if (cleanUrl === '/users' || cleanUrl === '/users/') {
      let items = [...mockUsers]
      if (params?.organization_id) items = items.filter((user) => user.organization_id === params.organization_id)
      if (params?.mcn_id) items = items.filter((user) => user.mcn_id === params.mcn_id)
      const page = Number(params?.page) || 1
      const pageSize = Number(params?.page_size) || 10
      const total = items.length
      return { data: { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, page_size: pageSize, total_pages: Math.ceil(total / pageSize) } }
    }
    if (cleanUrl === '/content-owners' || cleanUrl === '/content-owners/') {
      const items = params?.organization_id
        ? mockContentOwners.filter((owner) => owner.organization_id === params.organization_id)
        : mockContentOwners
      return { data: [...items] }
    }
    const contractDetailMatch = cleanUrl.match(/^\/contracts\/([^/]+)$/)
    if (method === 'GET' && contractDetailMatch) {
      const contract = mockContracts.find((item) => item.id === decodeURIComponent(contractDetailMatch[1]))
      return { data: contract || null }
    }
    if (cleanUrl === '/contracts' || cleanUrl === '/contracts/') {
      let items = [...mockContracts]
      if (params?.organization_id) items = items.filter((item) => item.organization_id === params.organization_id)
      if (params?.mcn_id) items = items.filter((item) => item.mcn_id === params.mcn_id)
      if (params?.channel_id) items = items.filter((item) => item.channel_id === params.channel_id)
      const page = Number(params?.page) || 1
      const pageSize = Number(params?.page_size) || 10
      const total = items.length
      return { data: { items, total, page, page_size: pageSize, total_pages: Math.ceil(total / pageSize) } }
    }
    if (cleanUrl.includes('/overview/org')) {
      return {
        data: {
          org: {
            id: TARGET_IDS.organizationDetail,
            name: 'PT Sorak Digital Media',
            brand_name: 'P2P Labs',
          },
          channel_count: 40,
          partner_count: 3,
          active_contracts: 10,
          top_channels: mockPlatformOverviewData.top_channels,
          sync_health: mockPlatformOverviewData.sync_health,
        },
      }
    }
    if (cleanUrl.includes('/overview/mcn')) {
      return {
        data: {
          mcns: [
            {
              mcn_id: TARGET_IDS.mcnDetail,
              mcn_name: 'P2P Labs Studio',
              channel_count: 37,
              active_contracts: 8,
            },
          ],
          channels: mockChannels,
        },
      }
    }
    if (cleanUrl.includes('/overview/creator')) {
      return {
        data: {
          channels: mockChannels.slice(0, 2),
          subscriber_count: 1900,
          total_views: 679000,
          active_contracts: 1,
        },
      }
    }

    // 2. CREATOR DISCOVERY & CREATOR BANK
    if (cleanUrl === '/creator-bank/topics') {
      const counts = new Map<string, number>()
      mockCreators.forEach((creator) => (creator.topics || creator.niches || []).forEach((topic: string) => counts.set(topic, (counts.get(topic) || 0) + 1)))
      return { data: [...counts].map(([topic, count]) => ({ topic, count })) }
    }
    if (cleanUrl === '/creator-bank/summary') {
      return { data: { capabilities: { source_filter: true, verified_youtube_rate_filter: true }, creators_in_bank: mockCreators.length, synced_from_channels: 1, externally_discovered: mockCreators.length - 1, from_brand_deal_reports: 1, avg_subscriber_count: Math.round(mockCreators.reduce((sum, c) => sum + (c.subscriber_count || 0), 0) / mockCreators.length), niches_represented: new Set(mockCreators.flatMap((c) => c.topics || c.niches || [])).size } }
    }
    if (/^\/creator-bank\/[^/]+\/videos$/.test(cleanUrl)) {
      const id = cleanUrl.split('/')[2]
      const creator = mockCreators.find((item) => item.id === id)
      return { data: (creator?.recent_videos || []).map((video: any) => ({ video_id: video.id, title: video.title, thumbnail_url: video.thumbnail || '', published_at: video.published_at, duration: '', view_count: video.views || 0, like_count: video.likes || 0, comment_count: video.comments || 0, url: `https://youtube.com/watch?v=${video.id}` })) }
    }
    if (/^\/creator-bank\/[^/]+\/notes/.test(cleanUrl)) return { data: [] }
    if (
      (/^\/creator-bank\/[^/]+$/.test(cleanUrl)) ||
      cleanUrl.includes('/creator-discovery/') ||
      cleanUrl.includes('/creators/')
    ) {
      const parts = cleanUrl.split('/')
      const id = parts[parts.length - 1]
      const found = mockCreators.find((c) => c.id === id) || mockCreators[0]
      return { data: creatorProfile(found) }
    }
    if (cleanUrl.includes('/creator-bank') || cleanUrl.includes('/creator-discovery')) {
      let items = mockCreators.map(creatorProfile)
      const query = String(params?.q || '').trim().toLowerCase()
      if (query) {
        items = items.filter((creator) => [creator.title, creator.custom_url, creator.channel_id, creator.description]
          .some((value) => String(value || '').toLowerCase().includes(query)))
      }
      const topics = String(params?.topics || '').split(',').map((topic) => topic.trim().toLowerCase()).filter(Boolean)
      if (topics.length) items = items.filter((creator) => topics.some((topic) => creator.topics.some((item: string) => item.toLowerCase() === topic)))
      if (params?.country) items = items.filter((creator) => creator.country?.toLowerCase() === String(params.country).toLowerCase())
      if (params?.source) items = items.filter((creator) => creator.sources.includes(params.source))
      if (params?.has_verified_youtube_rates !== undefined) {
        const verified = String(params.has_verified_youtube_rates) === 'true'
        items = items.filter((creator) => Boolean(creator.rate_card?.currency_verified) === verified)
      }
      if (params?.min_subscribers != null) items = items.filter((creator) => (creator.subscriber_count || 0) >= Number(params.min_subscribers))
      if (params?.min_avg_views != null) items = items.filter((creator) => (creator.performance_summary?.avg_views_per_video || 0) >= Number(params.min_avg_views))
      if (params?.min_engagement_rate != null) items = items.filter((creator) => (creator.performance_summary?.engagement_rate || 0) >= Number(params.min_engagement_rate))
      const sortBy = String(params?.sort || '')
      if (sortBy === 'avg_views_desc') items.sort((a, b) => (b.performance_summary?.avg_views_per_video || 0) - (a.performance_summary?.avg_views_per_video || 0))
      else if (sortBy === 'engagement_rate_desc') items.sort((a, b) => (b.performance_summary?.engagement_rate || 0) - (a.performance_summary?.engagement_rate || 0))
      else if (sortBy === 'subscriber_count_desc') items.sort((a, b) => (b.subscriber_count || 0) - (a.subscriber_count || 0))
      else if (sortBy === 'title_asc') items.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      const page = Number(params?.page) || 1
      const pageSize = Number(params?.page_size) || 20
      const total = items.length
      return {
        data: {
          items: items.slice((page - 1) * pageSize, page * pageSize),
          creators: items,
          total,
          page,
          page_size: pageSize,
          limit: 20,
        },
      }
    }

    // 3. CAMPAIGNS
    if (/^\/campaigns\/[^/]+\/products$/.test(cleanUrl)) {
      const campaign = mockCampaigns.find((item) => item.id === cleanUrl.split('/')[2]) || mockCampaigns[0]
      return { data: (campaign.products || []).map((product: any, index: number) => ({ id: product.id || product.sku || `${campaign.id}-product-${index + 1}`, name: product.name, sku: product.sku || null, product_url: product.product_url || null, image_url: product.image_url || null, price: product.price ?? null, position: index })) }
    }
    if (/^\/campaigns\/[^/]+\/creators$/.test(cleanUrl)) {
      const campaign = mockCampaigns.find((item) => item.id === cleanUrl.split('/')[2]) || mockCampaigns[0]
      return { data: (campaign.creators || []).map((creator: any, index: number) => ({ id: creator.id || `${campaign.id}-creator-${index + 1}`, creator_profile_id: creator.creator_id, creator_name: creator.creator_name, status: creator.status, source: creator.source === 'application' ? 'application' : 'discovery', package: {}, planned_cost: creator.package_cost || 0, rate_card_snapshot: null, pricing_snapshot: null, added_at: mockNow })) }
    }
    if (/^\/campaigns\/[^/]+\/forecast$/.test(cleanUrl)) return { data: null }
    if (/^\/campaigns\/[^/]+\/videos$/.test(cleanUrl)) {
      const campaign = mockCampaigns.find((item) => item.id === cleanUrl.split('/')[2]) || mockCampaigns[0]
      return { data: (campaign.videos || []).map((video: any, index: number) => ({ id: video.id || `${campaign.id}-video-${index}`, campaign_creator_id: video.creator_id || '', video_url: video.url || null, video_id: video.url?.split('v=')[1] || null, format: video.format === 'short' ? 'shorts' : video.format || null, has_product_tag: Boolean(video.product_tagged), status: video.status || 'pending_upload', metadata_status: 'resolved', metadata_error: null, campaign_code_used: null, code_issuance_id: null, title: video.title || null, duration_seconds: null, published_at: video.posted_at || null, verified_at: null, verified_by: null, created_at: mockNow })) }
    }
    if (/^\/campaigns\/[^/]+$/.test(cleanUrl)) {
      const parts = cleanUrl.split('/')
      const id = parts[parts.length - 1]
      const found = mockCampaigns.find((c) => c.id === id) || mockCampaigns[0]
      return { data: campaignRecord(found) }
    }
    if (cleanUrl.includes('/campaigns')) {
      const campaigns = mockCampaigns.filter((campaign) => !params?.status || params.status === 'all' || campaign.status === params.status)
      return {
        data: {
          items: campaigns.map(campaignRecord),
          campaigns: mockCampaigns.map(campaignRecord),
          total: campaigns.length,
          page: Number(params?.page) || 1,
          page_size: Number(params?.page_size) || 20,
        },
      }
    }
    if (cleanUrl.includes('/campaign-applications')) {
      return {
        data: {
          items: mockCampaigns[0].applications,
          total: mockCampaigns[0].applications.length,
        },
      }
    }

    // 4. CREATOR SUITES & BRAND DEAL REPORT
    if (cleanUrl.includes('/dashboard/creator-suites-summary')) {
      return { data: { ...mockCreatorSuitesSummary } }
    }
    // `/api/v1/tools` returns a bare array (creator-suites index + report Setup tab).
    if (cleanUrl === '/tools' || cleanUrl === '/tools/') {
      return { data: [...mockCreatorSuitesTools] }
    }

    // 4a. Brand deal report sub-resources — these must be matched before the
    // generic report route below, which otherwise swallows every sub-path.
    if (cleanUrl.endsWith('/comments/fetch-status')) {
      return { data: { ...mockCommentFetchRun, failure_details: { ...mockCommentFetchRun.failure_details } } }
    }
    if (cleanUrl.endsWith('/comments/fetch')) {
      return { data: { ...mockCommentFetchRun, failure_details: { ...mockCommentFetchRun.failure_details } } }
    }
    if (cleanUrl.endsWith('/comments')) {
      return { data: { ...mockReportComments, items: [...mockReportComments.items] } }
    }
    if (cleanUrl.includes('/insight')) {
      // The comments lane starts with no generated insight so the UI shows its
      // "generate" state; the executive lane ships with a completed sample.
      const insightType = params?.insight_type === 'comments' ? 'comments' : 'executive'
      if (insightType === 'comments') {
        return { data: { latest: null, latest_attempt: null, history: [] } }
      }
      const parts = cleanUrl.split('/')
      const insightId = parts[parts.length - 1]
      if (insightId && insightId !== 'insight') {
        return { data: { ...mockCampaignReportInsight } }
      }
      if (method === 'POST') {
        return { data: { ...mockCampaignReportInsight } }
      }
      return { data: { ...mockCampaignReportInsightList, history: [mockCampaignReportInsightSummary] } }
    }
    if (cleanUrl.endsWith('/share')) {
      if (method === 'DELETE') return { data: { is_shared: false, public_url: null } }
      if (method === 'POST') {
        return { data: { ...mockReportShareStatus, code: 'share-lumina-q4-demo' } }
      }
      return { data: { ...mockReportShareStatus } }
    }
    if (
      cleanUrl.includes('/youtube-brand-deal-reports') ||
      cleanUrl.includes('/youtube-brand-deal-report') ||
      cleanUrl.includes('/brand-deal-reports')
    ) {
      return { data: { ...mockBrandDealReport } }
    }
    if (cleanUrl.includes('/creator-suites')) {
      return {
        data: {
          tools: [...mockCreatorSuitesCatalog],
          items: [...mockCreatorSuitesCatalog],
        },
      }
    }

    // 5. ORGANIZATIONS
    if (cleanUrl.includes('/organizations/')) {
      const parts = cleanUrl.split('/')
      const id = parts[parts.length - 1]
      const found = mockOrganizations.find((o) => o.id === id) || mockOrganizations[0]
      return {
        data: {
          ...found,
          mcns: mockMcns.filter((m) => m.organization_id === found.id),
          channels: mockChannels.filter((c) => c.organization_id === found.id),
        },
      }
    }
    if (cleanUrl.includes('/organizations')) {
      let items = [...mockOrganizations]
      for (const field of ['brand_name', 'name', 'owner_email']) {
        const needle = String(params?.[field] || '').trim().toLowerCase()
        if (needle) items = items.filter((org) => String(org[field] || '').toLowerCase().includes(needle))
      }
      const page = Number(params?.page) || 1
      const pageSize = Number(params?.page_size) || 10
      const total = items.length
      return {
        data: {
          items: items.slice((page - 1) * pageSize, page * pageSize),
          organizations: items,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
        },
      }
    }

    // 6. MCNS / PARTNER NETWORKS
    if (cleanUrl.includes('/mcns/')) {
      const parts = cleanUrl.split('/')
      const id = parts[parts.length - 1]
      const found = mockMcns.find((m) => m.id === id) || mockMcns[0]
      return {
        data: {
          ...found,
          channels: mockChannels.filter((c) => c.mcn_id === found.id),
        },
      }
    }
    if (cleanUrl.includes('/mcns')) {
      let items = [...mockMcns]
      if (params?.organization_id) items = items.filter((item) => item.organization_id === params.organization_id)
      for (const field of ['name', 'alias']) {
        const needle = String(params?.[field] || '').trim().toLowerCase()
        if (needle) items = items.filter((mcn) => String(mcn[field] || '').toLowerCase().includes(needle))
      }
      const page = Number(params?.page) || 1
      const pageSize = Number(params?.page_size) || 10
      const total = items.length
      return {
        data: {
          items: items.slice((page - 1) * pageSize, page * pageSize),
          mcns: items,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
        },
      }
    }

    // 7. CHANNELS — skipped for `/analytics/channels/...`, which section 8 owns.
    if (!cleanUrl.includes('/analytics/')) {
      if (cleanUrl.endsWith('/oauth/status')) {
        return { data: { connected: false, scopes: null, connected_at: null, status: 'disconnected' } }
      }
      if (cleanUrl.endsWith('/stats')) {
        const channelId = cleanUrl.split('/').at(-2)
        const channel = mockChannels.find((c) => c.id === channelId || c.channel_id === channelId) || mockChannels[0]
        return { data: { subscriber_count: channel.subscriber_count, video_count: channel.video_count, view_count: channel.view_count } }
      }
      if (cleanUrl.includes('/channels/')) {
        const parts = cleanUrl.split('/')
        const id = parts[parts.length - 1]
        const found = mockChannels.find((c) => c.id === id || c.channel_id === id) || mockChannels[0]
        return {
          data: {
            ...found,
            recent_videos: mockCreators[0].recent_videos,
          },
        }
      }
      if (cleanUrl.includes('/channels')) {
        let items = [...mockChannels]
        if (params?.organization_id) items = items.filter((item) => item.organization_id === params.organization_id)
        if (params?.mcn_id) items = items.filter((item) => item.mcn_id === params.mcn_id)
        const title = String(params?.title || '').trim().toLowerCase()
        if (title) items = items.filter((item) => String(item.title || item.name || '').toLowerCase().includes(title))
        const page = Number(params?.page) || 1
        const pageSize = Number(params?.page_size) || 10
        const total = items.length
        return {
          data: {
            items: items.slice((page - 1) * pageSize, page * pageSize),
            channels: items,
            total,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(total / pageSize),
          },
        }
      }
    }

    // 8. ANALYTICS (shapes mirror composables/useAnalytics.ts)
    if (cleanUrl.includes('/analytics/channels/')) {
      const parts = cleanUrl.split('/')
      const last = parts[parts.length - 1]
      const channelId = last === 'top-videos' ? parts[parts.length - 2] : last
      const channel = mockAnalyticsTopChannelsResponse.top_channels.find((c) => c.channel_id === channelId)
        || mockAnalyticsTopChannelsResponse.top_channels[0]
      if (last === 'top-videos') {
        return {
          data: {
            fetched_at: mockAnalyticsTimeseriesResponse.fetched_at,
            date_range: mockAnalyticsTimeseriesResponse.date_range,
            channel_id: channel.channel_id,
            top_videos: mockBrandDealReport.report_data.videos.map((video) => ({
              video_id: video.video_id,
              title: video.snippet.title,
              views: video.statistics.view_count,
              watch_time_minutes: Math.round((video.statistics.view_count * 178) / 60),
              published_at: video.snippet.published_at,
            })),
          },
        }
      }
      return {
        data: {
          fetched_at: mockAnalyticsTimeseriesResponse.fetched_at,
          date_range: mockAnalyticsTimeseriesResponse.date_range,
          channel_id: channel.channel_id,
          channel_title: channel.title,
          thumbnail_url: channel.thumbnail_url,
          mcn_id: channel.mcn_id,
          mcn_name: channel.mcn_name,
          creator_user_id: channel.creator_user_id,
          creator_name: channel.creator_name,
          summary: {
            ...mockAnalyticsSummaryResponse.summary,
            total_views: channel.views,
            total_watch_time_minutes: channel.watch_time_minutes,
            estimated_revenue_usd: channel.estimated_revenue_usd,
            channel_count: 1,
          },
          daily_timeseries: [...mockAnalyticsTimeseriesResponse.daily_timeseries],
        },
      }
    }
    if (cleanUrl.includes('/analytics/summary') || cleanUrl.includes('/analytics/overview')) {
      return { data: { ...mockAnalyticsSummaryResponse } }
    }
    if (cleanUrl.includes('/analytics/top-channels')) {
      const sortBy = params?.sort_by === 'revenue' ? 'revenue' : 'views'
      const items = [...mockAnalyticsTopChannelsResponse.top_channels].sort((a, b) =>
        sortBy === 'revenue'
          ? (b.estimated_revenue_usd ?? 0) - (a.estimated_revenue_usd ?? 0)
          : b.views - a.views,
      )
      return { data: { ...mockAnalyticsTopChannelsResponse, top_channels: items } }
    }
    if (cleanUrl.includes('/analytics/revenue-by-mcn')) {
      return { data: [...mockAnalyticsSummaryResponse.mcn_revenue_breakdown] }
    }
    if (cleanUrl.includes('/analytics/timeseries')) {
      return { data: { ...mockAnalyticsTimeseriesResponse } }
    }
    if (cleanUrl.includes('/analytics/refresh')) {
      return { data: { success: true, refreshed_at: new Date().toISOString() } }
    }
    if (cleanUrl.includes('/analytics')) {
      return { data: { ...mockAnalyticsSummaryResponse } }
    }

    // Default fallback
    return {
      data: data || { success: true },
    }
  }

  return {
    get: <T = any>(url: string, config?: any) => handleMockRequest('GET', url, undefined, config?.params) as Promise<{ data: T }>,
    post: <T = any>(url: string, data?: any, config?: any) => handleMockRequest('POST', url, data, config?.params) as Promise<{ data: T }>,
    put: <T = any>(url: string, data?: any, config?: any) => handleMockRequest('PUT', url, data, config?.params) as Promise<{ data: T }>,
    patch: <T = any>(url: string, data?: any, config?: any) => handleMockRequest('PATCH', url, data, config?.params) as Promise<{ data: T }>,
    delete: <T = any>(url: string, config?: any) => handleMockRequest('DELETE', url, undefined, config?.params) as Promise<{ data: T }>,
  }
}
