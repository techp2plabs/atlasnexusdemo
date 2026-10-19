export type MCNPartnerType = 'inhouse' | 'agency' | 'talent_management'

export interface MCN {
  id: string
  organization_id: string
  organization_name?: string
  name: string
  partner_type: MCNPartnerType
  /** movie | music_label | default — revenue fetch scope & splittable gross */
  owner_type?: string
  alias?: string
  description?: string
  website_url?: string
  pic_contact_name?: string
  pic_contact_email?: string
  pic_contact_phone?: string
  address?: string
  city?: string
  country?: string
  tax_id?: string
  director?: string
  director_id_file_url?: string
  international_company_name?: string
  tax_id_file_url?: string
  bank_name?: string
  bank_account_name?: string
  bank_swift_code?: string
  bank_address?: string
  bank_country?: string
  bank_branch?: string
  bank_account_number?: string
  pic_partner_name?: string
  pic_partner_phone?: string
  pic_partner_email?: string
  pic_legal_name?: string
  pic_legal_phone?: string
  pic_legal_email?: string
  channel_count?: number
  status?: string
  created_at: string
  updated_at: string
}

