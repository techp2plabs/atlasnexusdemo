export type UserStatus = 'pending_verification' | 'active' | 'inactive'

export type UserRole =
  | 'atlas_superadmin'
  | 'atlas_admin'
  | 'org_owner'
  | 'org_admin'
  | 'mcn_operator'
  | 'creator'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organization_id: string | null
  mcn_id: string | null
  /** Resolved labels from entity assignments (+ home org/MCN when not redundant) */
  organization_names?: string[]
  mcn_names?: string[]
  status: UserStatus
  can_verify?: boolean
  created_at: string
}

export interface UserVerifyRequest {
  status: UserStatus
}

export interface UserUpdate {
  role?: UserRole
  status?: UserStatus
}

/** Direct create — creates an active user and assigns the org/MCN/channel hierarchy immediately (no invite email). */
export interface UserCreate {
  email: string
  name: string
  /** Omit to let the backend generate one, returned once in UserCreateResult.temporary_password */
  password?: string
  role: UserRole
  organization_id?: string | null
  mcn_id?: string | null
  channel_ids?: string[]
  assignment_bundle?: Array<{
    entity_type: 'organization' | 'mcn_partner' | 'channel'
    entity_id: string
  }>
}

export interface UserCreateResult extends User {
  /** Only present when no password was supplied — show once, then discard. */
  temporary_password?: string | null
}

