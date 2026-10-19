import { defineStore } from 'pinia'
import {
  campaigns as seedCampaigns,
  type Campaign,
  type CampaignStatus,
  type CampaignCreator,
  type CampaignVideo,
  type CampaignProduct,
} from '~/mocks/fixtures/campaigns'

interface CampaignsState {
  campaigns: Campaign[]
}

/**
 * Mock-data-first store for Campaigns (release-plan-09 §8.3, §5.3 state machine).
 * Backs `useCampaigns()` today; swapped for real `/api/v1/campaigns` calls
 * per release-plan-03 §B.2 without touching any component.
 */
export const useCampaignsStore = defineStore('ybc_campaigns', {
  state: (): CampaignsState => ({
    campaigns: seedCampaigns,
  }),

  persist: {
    key: 'ybc_mock_campaigns',
  },

  getters: {
    byId: (state) => (id: string) => state.campaigns.find((c) => c.id === id) ?? null,
    byStatus: (state) => (status: CampaignStatus | 'all') =>
      status === 'all' ? state.campaigns : state.campaigns.filter((c) => c.status === status),
    openForCreators: (state) => state.campaigns.filter((c) => c.status === 'open'),
  },

  actions: {
    createDraft(input: { name: string; brand: string; budget_total: number; start_date: string; end_date: string }) {
      const id = `camp_${Date.now()}`
      const campaign: Campaign = {
        id,
        name: input.name,
        brand: input.brand,
        status: 'draft',
        currency: 'IDR',
        budget_total: input.budget_total,
        investment_mix: 'hybrid',
        start_date: input.start_date,
        end_date: input.end_date,
        target_roi: null,
        forecast_mode: 'hybrid',
        completeness_pct: 20,
        missing_fields: ['Investment mix', 'Products', 'Forecast', 'Creators'],
        creators: [],
        videos: [],
        gmv_to_date: null,
        orders: null,
        ad_spend: null,
        creator_payout: null,
        gmv_trend: [],
        highlights: [],
        requirements: [],
        payout_model: '',
        affiliate_commission_rate: null,
        products: [],
        activity: [{ id: `act_${Date.now()}`, label: 'Campaign created as draft', at: new Date().toISOString() }],
      }
      this.campaigns.unshift(campaign)
      return campaign
    },

    addCreator(campaignId: string, creator: Pick<CampaignCreator, 'creator_id' | 'creator_name' | 'package_cost'>) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (!campaign) return
      if (campaign.creators.some((cc) => cc.creator_id === creator.creator_id)) return
      campaign.creators.push({ ...creator, status: 'selected', source: 'discovery' })
      campaign.activity.unshift({
        id: `act_${Date.now()}`,
        label: `${creator.creator_name} added to roster`,
        at: new Date().toISOString(),
      })
    },

    removeCreator(campaignId: string, creatorId: string) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (!campaign) return
      const removed = campaign.creators.find((cc) => cc.creator_id === creatorId)
      campaign.creators = campaign.creators.filter((cc) => cc.creator_id !== creatorId)
      if (removed) {
        campaign.activity.unshift({
          id: `act_${Date.now()}`,
          label: `${removed.creator_name} removed from roster`,
          at: new Date().toISOString(),
        })
      }
    },

    registerVideo(campaignId: string, video: Pick<CampaignVideo, 'creator_id' | 'creator_name' | 'url' | 'format' | 'product_tagged'>) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (!campaign) return
      const entry: CampaignVideo = {
        id: `video_${Date.now()}`,
        ...video,
        status: 'pending_verification',
        posted_at: new Date().toISOString(),
        views: null,
        organic_views: null,
        paid_views: null,
        orders: null,
      }
      campaign.videos.unshift(entry)
      campaign.activity.unshift({
        id: `act_${Date.now()}`,
        label: `Video registered for ${video.creator_name} — pending verification`,
        at: entry.posted_at,
      })
    },

    verifyVideo(campaignId: string, videoId: string) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      const video = campaign?.videos.find((v) => v.id === videoId)
      if (!campaign || !video) return
      video.status = 'tracked'
      video.views = video.views ?? Math.round(20_000 + Math.random() * 80_000)
      video.organic_views = video.views ? Math.round(video.views * 0.65) : null
      video.paid_views = video.views ? video.views - (video.organic_views ?? 0) : null
      campaign.activity.unshift({
        id: `act_${Date.now()}`,
        label: `Video verified — ${video.creator_name}`,
        at: new Date().toISOString(),
      })
    },

    setForecastMode(campaignId: string, mode: Campaign['forecast_mode']) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (campaign) campaign.forecast_mode = mode
    },

    setTargetRoi(campaignId: string, targetRoi: number) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (campaign) campaign.target_roi = targetRoi
    },

    addProduct(campaignId: string, product: CampaignProduct) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (!campaign) return
      if (campaign.products.some((p) => p.sku === product.sku)) return
      campaign.products.push(product)
    },

    removeProduct(campaignId: string, sku: string) {
      const campaign = this.campaigns.find((c) => c.id === campaignId)
      if (!campaign) return
      campaign.products = campaign.products.filter((p) => p.sku !== sku)
    },

    reset() {
      this.campaigns = seedCampaigns
    },
  },
})
