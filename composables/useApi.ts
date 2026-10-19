import {
  TARGET_IDS,
  mockOrganizations,
  mockMcns,
  mockChannels,
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

export function useApi() {
  const handleMockRequest = async (method: string, url: string, data?: any, params?: Record<string, any>) => {
    // Artificial small delay for realistic UX interaction (40ms)
    await new Promise((r) => setTimeout(r, 40))

    const cleanUrl = url.split('?')[0].replace('/api/v1', '').replace('/api', '')

    // 1. OVERVIEW & DASHBOARD
    if (cleanUrl.includes('/overview/platform') || cleanUrl.includes('/overview/control-tower')) {
      return { data: { ...mockPlatformOverviewData } }
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
    if (
      cleanUrl.includes('/creator-bank/') ||
      cleanUrl.includes('/creator-discovery/') ||
      cleanUrl.includes('/creators/')
    ) {
      const parts = cleanUrl.split('/')
      const id = parts[parts.length - 1]
      const found = mockCreators.find((c) => c.id === id) || mockCreators[0]
      return { data: { ...found } }
    }
    if (cleanUrl.includes('/creator-bank') || cleanUrl.includes('/creator-discovery')) {
      return {
        data: {
          items: [...mockCreators],
          creators: [...mockCreators],
          total: mockCreators.length,
          page: 1,
          page_size: 20,
          limit: 20,
        },
      }
    }

    // 3. CAMPAIGNS
    if (cleanUrl.includes('/campaigns/') || cleanUrl.includes('/youtube-brand-campaign/campaigns/')) {
      const parts = cleanUrl.split('/')
      const id = parts[parts.length - 1]
      const found = mockCampaigns.find((c) => c.id === id) || mockCampaigns[0]
      return { data: { ...found } }
    }
    if (cleanUrl.includes('/campaigns')) {
      return {
        data: {
          items: [...mockCampaigns],
          campaigns: [...mockCampaigns],
          total: mockCampaigns.length,
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
      return {
        data: {
          items: [...mockOrganizations],
          organizations: [...mockOrganizations],
          total: mockOrganizations.length,
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
      return {
        data: {
          items: [...mockMcns],
          mcns: [...mockMcns],
          total: mockMcns.length,
        },
      }
    }

    // 7. CHANNELS — skipped for `/analytics/channels/...`, which section 8 owns.
    if (!cleanUrl.includes('/analytics/')) {
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
        return {
          data: {
            items: [...mockChannels],
            channels: [...mockChannels],
            total: mockChannels.length,
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
