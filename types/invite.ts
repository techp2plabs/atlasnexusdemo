export interface Invite {
  id: string
  email: string
  role: string
  organization_id?: string | null
  mcn_id?: string | null
  status: string
  expires_at: string
  created_at: string
  assignment_bundle?: Array<{
    entity_type: 'organization' | 'mcn_partner' | 'channel'
    entity_id: string
  }>
}

/** Admin list/detail row from API (includes optional signup link for pending invites). */
export interface InviteAdmin extends Invite {
  invited_by_name?: string | null
  signup_url?: string | null
}

export interface InviteCreate {
  email: string
  role: string
  organization_id?: string | null
  mcn_id?: string | null
  channel_ids?: string[]
  assignment_bundle?: Array<{
    entity_type: 'organization' | 'mcn_partner' | 'channel'
    entity_id: string
  }>
}

export interface PaginatedInvitesResponse {
  items: InviteAdmin[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface InviteFilters {
  organization_id?: string
  mcn_id?: string
  email?: string
  status?: string
  page?: number
  page_size?: number
}
