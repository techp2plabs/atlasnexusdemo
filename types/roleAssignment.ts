export interface RoleAssignment {
  id: string
  entity_type: 'organization' | 'mcn_partner' | 'channel'
  entity_id: string
  status: 'active' | 'inactive'
  granted_at: string
  /** Resolved label from API (org / MCN / channel title) */
  display_name?: string | null
  /** Extra context: alias, YouTube channel ID, parent org, etc. */
  display_detail?: string | null
}

export interface RoleAssignmentUser {
  user_id: string
  email: string
  name: string
  role: string
  status: string
  assignments: RoleAssignment[]
  /** Primary organization on the user profile (org_owner / org_admin, etc.) */
  organization_id?: string | null
  /** Primary MCN on the user profile (mcn_operator, etc.) */
  mcn_id?: string | null
  /** Resolved label for `organization_id` */
  home_organization_display?: string | null
  /** Resolved label for `mcn_id` */
  home_mcn_display?: string | null
}

export interface RoleAssignmentListResponse {
  items: RoleAssignmentUser[]
  total: number
}

export interface UpsertRoleAssignmentRequest {
  user_id: string
  entity_type: 'organization' | 'mcn_partner' | 'channel'
  entity_id: string
  status: 'active' | 'inactive'
}
