/**
 * Mock fixture for Creator Applications (release-plan-09 §8.2).
 * Field names follow release-plan-02 §5 (campaign_applications).
 */

export type ApplicationStatus =
  | 'pending_brand'
  | 'approved'
  | 'rejected'
  | 'under_analysis'
  | 'eligible'
  | 'needs_review'
  | 'not_eligible'
  | 'withdrawn'

export interface EligibilityAssessment {
  status: 'processing' | 'completed' | 'failed'
  verdict: 'eligible' | 'needs_review' | 'not_eligible' | null
  fit_score: number | null
  gmv_potential_rating: string | null
  summary: string | null
}

export interface CampaignApplication {
  id: string
  campaign_id: string
  campaign_name: string
  creator_name: string
  creator_handle: string
  channel_url: string
  whatsapp: string | null
  email: string | null
  compensation_type: 'rate_card' | 'sample_only'
  rate_shorts: number | null
  rate_longform: number | null
  rate_currency?: string | null
  pricing_snapshot?: Record<string, any> | null
  message: string | null
  status: ApplicationStatus
  submitted_at: string
  eligibility: EligibilityAssessment | null
}

export const applications: CampaignApplication[] = [
  {
    id: 'app_salsa_yabar_q3',
    campaign_id: 'camp_yabar_q3_2026',
    campaign_name: "YA'Bar Q3 2026 Brand Campaign",
    creator_name: 'Salsa Food Diary',
    creator_handle: '@salsafooddiary',
    channel_url: 'https://youtube.com/@salsafooddiary',
    whatsapp: '+62 812-3456-7890',
    email: 'salsa@example.com',
    compensation_type: 'rate_card',
    rate_shorts: 3_000_000,
    rate_longform: 10_000_000,
    message: 'Suka banget sama produk YA’Bar, sudah pernah review organik sebelumnya.',
    status: 'pending_brand',
    submitted_at: '2026-07-21T09:00:00Z',
    eligibility: null,
  },
  {
    id: 'app_gymsnack_shorts_sprint',
    campaign_id: 'camp_shorts_sprint',
    campaign_name: 'YA’Bar Shorts Sprint',
    creator_name: 'GymSnack ID',
    creator_handle: '@gymsnackid',
    channel_url: 'https://youtube.com/@gymsnackid',
    whatsapp: null,
    email: null,
    compensation_type: 'sample_only',
    rate_shorts: null,
    rate_longform: null,
    message: null,
    status: 'under_analysis',
    submitted_at: '2026-07-20T14:30:00Z',
    eligibility: { status: 'processing', verdict: null, fit_score: null, gmv_potential_rating: null, summary: null },
  },
  {
    id: 'app_kakros_yabar_q3',
    campaign_id: 'camp_yabar_q3_2026',
    campaign_name: "YA'Bar Q3 2026 Brand Campaign",
    creator_name: 'Kak Ros',
    creator_handle: '@kakros',
    channel_url: 'https://youtube.com/@kakros',
    whatsapp: '+62 811-2233-4455',
    email: 'kakros@example.com',
    compensation_type: 'rate_card',
    rate_shorts: 4_000_000,
    rate_longform: 15_000_000,
    message: null,
    status: 'eligible',
    submitted_at: '2026-07-18T08:00:00Z',
    eligibility: {
      status: 'completed',
      verdict: 'eligible',
      fit_score: 88,
      gmv_potential_rating: 'high',
      summary: 'Strong niche match, consistent posting cadence, no brand-safety flags.',
    },
  },
]
