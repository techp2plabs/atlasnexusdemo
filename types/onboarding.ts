export interface OnboardingConfig {
  funnel_enabled: boolean
  creator_registration_enabled: boolean
  agency_access_intake_enabled: boolean
  brand_waitlist_enabled: boolean
  terms_version: string
  privacy_version: string
  support_email: string | null
}

export interface IntakePayload {
  contact_name: string
  email: string
  website?: string
  message?: string
  source?: string
  utm?: Record<string, string>
  consent_follow_up: boolean
  consent_version: string
  marketing_consent: boolean
  website_url?: string
}

export interface OnboardingIntake {
  id: string
  contact_name: string
  email: string
  company_name?: string
  brand_name?: string
  request_type?: string
  message?: string | null
  source?: string | null
  status: string
  delivery_status: string
  consent_version: string
  consent_at: string
  marketing_consent: boolean
  created_at: string
  current_invite_id?: string | null
  linked_user_id?: string | null
}

export interface PaginatedOnboardingIntake {
  items: OnboardingIntake[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type OnboardingEventKey =
  | 'get_started_viewed' | 'persona_selected'
  | 'creator_registration_submitted' | 'creator_registration_completed'
  | 'agency_request_submitted' | 'agency_request_accepted'
  | 'brand_waitlist_submitted' | 'brand_waitlist_accepted'
