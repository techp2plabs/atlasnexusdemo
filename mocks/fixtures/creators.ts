/**
 * Mock fixture for the Creator Discovery (release-plan-09 §8.2).
 * Field names follow release-plan-02 §5 / release-plan-03 §B.2 (creator_bank_profiles),
 * not the display-formatted strings used by the static demo prototype.
 */

export interface CreatorRateCard {
  shorts_min: number
  shorts_max: number
  longform_min: number
  longform_max: number
}

export interface SkuAffinity {
  sku_id: string
  score: number
}

export interface CreatorProfile {
  id: string
  name: string
  handle: string
  avatar_url: string | null
  subscriber_count: number
  fit_score: number
  safety_level: 'safe' | 'review' | 'unsafe'
  source: 'managed' | 'discovered'
  niches: string[]
  country: string
  currency: string
  gmv_month: number
  avg_views: number
  /** View-weighted engagement rate, percent (e.g. 2.4 = 2.4%) — used by the forecast calculator (doc10 §1). */
  engagement_rate: number
  channel_health_score: number
  rate_card: CreatorRateCard
  /** Scores against campaign products by SKU (doc10 §1, §7) — aligned to `Campaign.products[].sku`. */
  sku_affinity: SkuAffinity[]
  status: 'active' | 'archived'
}

export const creators: CreatorProfile[] = [
  {
    id: 'creator_neng_ayie',
    name: 'Neng Ayie',
    handle: '@nengayie2125',
    avatar_url: null,
    subscriber_count: 2_700_000,
    fit_score: 92,
    safety_level: 'safe',
    source: 'discovered',
    niches: ['Food', 'Lifestyle'],
    country: 'ID',
    currency: 'IDR',
    gmv_month: 187_000_000,
    avg_views: 210_000,
    engagement_rate: 2.6,
    channel_health_score: 93,
    rate_card: { shorts_min: 8_000_000, shorts_max: 12_000_000, longform_min: 25_000_000, longform_max: 35_000_000 },
    sku_affinity: [
      { sku_id: 'YAB-CHOCO', score: 91 },
      { sku_id: 'YAB-ALMOND', score: 84 },
      { sku_id: 'YAB-MATCHA', score: 76 },
    ],
    status: 'active',
  },
  {
    id: 'creator_kak_ros',
    name: 'Kak Ros',
    handle: '@kakros',
    avatar_url: null,
    subscriber_count: 1_100_000,
    fit_score: 88,
    safety_level: 'safe',
    source: 'managed',
    niches: ['Lifestyle'],
    country: 'ID',
    currency: 'IDR',
    gmv_month: 92_000_000,
    avg_views: 96_000,
    engagement_rate: 3.1,
    channel_health_score: 87,
    rate_card: { shorts_min: 4_000_000, shorts_max: 7_000_000, longform_min: 15_000_000, longform_max: 22_000_000 },
    sku_affinity: [
      { sku_id: 'YAB-CHOCO', score: 78 },
      { sku_id: 'YAB-ALMOND', score: 85 },
      { sku_id: 'YAB-MATCHA', score: 70 },
    ],
    status: 'active',
  },
  {
    id: 'creator_salsa_food_diary',
    name: 'Salsa Food Diary',
    handle: '@salsafooddiary',
    avatar_url: null,
    subscriber_count: 640_000,
    fit_score: 81,
    safety_level: 'review',
    source: 'discovered',
    niches: ['Food'],
    country: 'ID',
    currency: 'IDR',
    gmv_month: 41_000_000,
    avg_views: 58_000,
    engagement_rate: 2.2,
    channel_health_score: 76,
    rate_card: { shorts_min: 2_500_000, shorts_max: 4_000_000, longform_min: 9_000_000, longform_max: 14_000_000 },
    sku_affinity: [
      { sku_id: 'YAB-CHOCO', score: 88 },
      { sku_id: 'YAB-ALMOND', score: 72 },
      { sku_id: 'YAB-MATCHA', score: 65 },
    ],
    status: 'active',
  },
  {
    id: 'creator_gymsnack_id',
    name: 'GymSnack ID',
    handle: '@gymsnackid',
    avatar_url: null,
    subscriber_count: 310_000,
    fit_score: 74,
    safety_level: 'safe',
    source: 'discovered',
    niches: ['Fitness', 'Food'],
    country: 'ID',
    currency: 'IDR',
    gmv_month: 18_000_000,
    avg_views: 31_000,
    engagement_rate: 4.0,
    channel_health_score: 82,
    rate_card: { shorts_min: 1_500_000, shorts_max: 2_800_000, longform_min: 6_000_000, longform_max: 9_500_000 },
    sku_affinity: [
      { sku_id: 'YAB-CHOCO', score: 68 },
      { sku_id: 'YAB-ALMOND', score: 74 },
      { sku_id: 'YAB-MATCHA', score: 82 },
    ],
    status: 'active',
  },
]
