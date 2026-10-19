export interface InvitationScopeItem {
  entity_type: 'organization' | 'mcn_partner' | 'channel'
  entity_id: string
  name?: string
}

export interface InvitationDetails {
  email: string
  role: string
  organization_id: string | null
  mcn_id: string | null
  status: 'pending' | 'accepted' | 'expired'
  assignment_bundle: InvitationScopeItem[]
  creator_link_mode?: 'legacy' | 'r3'
  channel_ids?: string[]
}
