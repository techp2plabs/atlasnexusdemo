/** Static route and menu map for the isolated YouTube Brand Campaign demo. */
export interface YoutubeBrandCampaignDemoNavItem {
  label: string
  slug: string
  file: string
  group: string
}

export const YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS: YoutubeBrandCampaignDemoNavItem[] = [
  { label: 'Overview', slug: '', file: 'index.html', group: 'Walkthrough' },
  { label: 'Creator Discovery', slug: 'creators', file: 'creators.html', group: 'Agency' },
  { label: 'Create Campaign', slug: 'campaign', file: 'campaign.html', group: 'Agency' },
  { label: 'Drafts', slug: 'campaign/draft', file: 'draft_campaign.html', group: 'Agency' },
  { label: 'Running', slug: 'campaign/running', file: 'running_campaign.html', group: 'Agency' },
  { label: 'Monitoring', slug: 'monitoring', file: 'monitoring.html', group: 'Agency' },
  { label: 'Creator Applications', slug: 'applications', file: 'applications.html', group: 'Agency' },
  { label: 'Browse Campaigns', slug: 'creator/home', file: 'creator_home.html', group: 'Creator' },
  { label: 'Apply to Campaign', slug: 'creator/apply', file: 'creator_apply.html', group: 'Creator' },
  { label: 'My Applications', slug: 'creator/apps', file: 'creator_apps.html', group: 'Creator' },
  { label: 'Campaign Details', slug: 'creator/campaign', file: 'creator_campaign.html', group: 'Creator' },
]

export const YOUTUBE_BRAND_CAMPAIGN_DEMO_ROUTES: Record<string, string> = Object.fromEntries(
  YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS.map(item => [item.slug, item.file]),
)

export const YOUTUBE_BRAND_CAMPAIGN_DEMO_BASE = '/demo/youtube-brand-campaign'
export const YOUTUBE_BRAND_CAMPAIGN_DEMO_ROUTE_BASE = '/apps/youtube-brand-campaign-prototype'
