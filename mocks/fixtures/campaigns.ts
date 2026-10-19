/**
 * Mock fixture for Campaigns (release-plan-09 §8.2).
 * Field names follow release-plan-02 §5 (campaigns, campaign_creators, campaign_videos).
 */

export type CampaignStatus = 'draft' | 'open' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived'

export interface CampaignCreator {
  creator_id: string
  creator_name: string
  status: 'selected' | 'confirmed' | 'active' | 'completed' | 'withdrawn' | 'removed'
  package_cost: number
  source: 'discovery' | 'application'
}

export interface CampaignVideo {
  id: string
  creator_id: string
  creator_name: string
  url: string
  format: 'short' | 'longform'
  status: 'pending_verification' | 'tracked' | 'rejected' | 'removed'
  product_tagged: boolean
  posted_at: string
  views: number | null
  organic_views: number | null
  paid_views: number | null
  /** By Video table (doc10 §2, §6) — orders attributed to this video. */
  orders: number | null
}

export interface ActivityEvent {
  id: string
  label: string
  at: string
}

export interface CampaignProduct {
  sku: string
  name: string
  price: number
  gmv_share_pct: number
}

export interface Campaign {
  id: string
  name: string
  brand: string
  status: CampaignStatus
  currency: string
  budget_total: number
  investment_mix: 'creator' | 'ads' | 'hybrid'
  start_date: string
  end_date: string
  target_roi: number | null
  /** Overview tab forecast panel toggle (doc10 §1) — distinct from `investment_mix`, which is the payout structure. */
  forecast_mode: 'hybrid' | 'creator' | 'ads'
  completeness_pct: number
  missing_fields: string[]
  creators: CampaignCreator[]
  videos: CampaignVideo[]
  gmv_to_date: number | null
  // Monitoring tab secondary KPIs (doc10 §2, §12) — null until the campaign has live commerce data
  orders: number | null
  ad_spend: number | null
  creator_payout: number | null
  /** Weekly GMV trend for the Monitoring dual-funnel chart (doc10 §2, §8) — empty until the campaign has tracked weeks. */
  gmv_trend: { week: string; organic: number; paid: number }[]
  // Creator-facing brief (release-plan-09 §7.2)
  highlights: string[]
  requirements: string[]
  payout_model: string
  affiliate_commission_rate: number | null
  products: CampaignProduct[]
  activity: ActivityEvent[]
}

export const campaigns: Campaign[] = [
  {
    id: 'camp_yabar_q3_2026',
    name: "YA'Bar Q3 2026 Brand Campaign",
    brand: "YA'Bar",
    status: 'active',
    currency: 'IDR',
    budget_total: 250_000_000,
    investment_mix: 'hybrid',
    start_date: '2026-06-12',
    end_date: '2026-07-26',
    target_roi: 3.2,
    forecast_mode: 'hybrid',
    completeness_pct: 100,
    missing_fields: [],
    creators: [
      { creator_id: 'creator_neng_ayie', creator_name: 'Neng Ayie', status: 'active', package_cost: 12_000_000, source: 'discovery' },
      { creator_id: 'creator_kak_ros', creator_name: 'Kak Ros', status: 'active', package_cost: 7_000_000, source: 'discovery' },
    ],
    videos: [
      {
        id: 'video_1',
        creator_id: 'creator_neng_ayie',
        creator_name: 'Neng Ayie',
        url: 'https://youtube.com/shorts/abc123',
        format: 'short',
        status: 'tracked',
        product_tagged: true,
        posted_at: '2026-07-01T10:00:00Z',
        views: 184_000,
        organic_views: 121_000,
        paid_views: 63_000,
        orders: 268,
      },
      {
        id: 'video_2',
        creator_id: 'creator_kak_ros',
        creator_name: 'Kak Ros',
        url: 'https://youtube.com/shorts/def456',
        format: 'short',
        status: 'pending_verification',
        product_tagged: true,
        posted_at: '2026-07-10T09:00:00Z',
        views: null,
        organic_views: null,
        paid_views: null,
        orders: null,
      },
    ],
    gmv_to_date: 256_400_000,
    orders: 412,
    ad_spend: 38_000_000,
    creator_payout: 19_000_000,
    gmv_trend: [
      { week: '24 Jun', organic: 28_000_000, paid: 9_000_000 },
      { week: '01 Jul', organic: 41_000_000, paid: 14_000_000 },
      { week: '08 Jul', organic: 52_000_000, paid: 18_000_000 },
      { week: '15 Jul', organic: 63_000_000, paid: 20_000_000 },
      { week: '22 Jul', organic: 22_400_000, paid: 12_000_000 },
    ],
    highlights: ['Top-performing hybrid campaign this quarter', 'Two creators live, one shorts sprint in verification'],
    requirements: ['Min. 500K subscribers', 'Food or lifestyle niche', 'Brand-safe content only'],
    payout_model: 'Rate card + affiliate commission on tracked GMV',
    affiliate_commission_rate: 8,
    products: [
      { sku: 'YAB-CHOCO', name: 'YA’Bar Choco', price: 15_000, gmv_share_pct: 62 },
      { sku: 'YAB-ALMOND', name: 'YA’Bar Almond', price: 17_000, gmv_share_pct: 38 },
    ],
    activity: [
      { id: 'act_1', label: 'Campaign created as draft', at: '2026-06-01T08:00:00Z' },
      { id: 'act_2', label: 'Launched — status changed to active', at: '2026-06-12T08:00:00Z' },
      { id: 'act_3', label: 'Neng Ayie added to roster', at: '2026-06-12T08:05:00Z' },
      { id: 'act_4', label: 'Kak Ros added to roster', at: '2026-06-13T10:00:00Z' },
      { id: 'act_5', label: 'Video posted by Neng Ayie — verified', at: '2026-07-01T10:00:00Z' },
      { id: 'act_6', label: 'Video posted by Kak Ros — pending verification', at: '2026-07-10T09:00:00Z' },
    ],
  },
  {
    id: 'camp_yabar_back_to_school',
    name: "YA'Bar Back-to-School 2026",
    brand: "YA'Bar",
    status: 'draft',
    currency: 'IDR',
    budget_total: 120_000_000,
    investment_mix: 'creator',
    start_date: '2026-08-15',
    end_date: '2026-09-15',
    target_roi: null,
    forecast_mode: 'hybrid',
    completeness_pct: 40,
    missing_fields: ['Products', 'Forecast', 'Creators'],
    creators: [
      { creator_id: 'creator_gymsnack_id', creator_name: 'GymSnack ID', status: 'selected', package_cost: 2_800_000, source: 'discovery' },
    ],
    videos: [],
    gmv_to_date: null,
    orders: null,
    ad_spend: null,
    creator_payout: null,
    gmv_trend: [],
    highlights: [],
    requirements: ['Min. 200K subscribers', 'Food or fitness niche'],
    payout_model: 'Affiliate commission on tracked GMV',
    affiliate_commission_rate: 10,
    products: [{ sku: 'YAB-CHOCO', name: 'YA’Bar Choco', price: 15_000, gmv_share_pct: 100 }],
    activity: [
      { id: 'act_1', label: 'Campaign created as draft', at: '2026-08-01T08:00:00Z' },
      { id: 'act_2', label: 'GymSnack ID selected from Creator Discovery', at: '2026-08-02T09:30:00Z' },
    ],
  },
  {
    id: 'camp_shorts_sprint',
    name: 'YA’Bar Shorts Sprint',
    brand: "YA'Bar",
    status: 'open',
    currency: 'IDR',
    budget_total: 60_000_000,
    investment_mix: 'creator',
    start_date: '2026-07-20',
    end_date: '2026-08-20',
    target_roi: 2.5,
    forecast_mode: 'hybrid',
    completeness_pct: 100,
    missing_fields: [],
    creators: [],
    videos: [],
    gmv_to_date: null,
    orders: null,
    ad_spend: null,
    creator_payout: null,
    gmv_trend: [],
    highlights: ['Fixed-fee shorts sprint — fast turnaround, 4 weeks', '25 creator slots open'],
    requirements: ['Min. 100K subscribers', 'Shorts-first channel', 'Indonesia audience'],
    payout_model: 'Fixed fee per shorts, paid on verification',
    affiliate_commission_rate: null,
    products: [
      { sku: 'YAB-CHOCO', name: 'YA’Bar Choco', price: 15_000, gmv_share_pct: 45 },
      { sku: 'YAB-ALMOND', name: 'YA’Bar Almond', price: 17_000, gmv_share_pct: 35 },
      { sku: 'YAB-MATCHA', name: 'YA’Bar Matcha', price: 18_000, gmv_share_pct: 20 },
    ],
    activity: [{ id: 'act_1', label: 'Campaign opened for applications', at: '2026-07-20T08:00:00Z' }],
  },
]
