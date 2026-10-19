export interface ContentOwner {
  id: string
  organization_id: string
  organization_name?: string
  content_owner_id: string
  display_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContentOwnerCreate {
  organization_id: string
  content_owner_id: string
  display_name?: string
  is_active?: boolean
}

export interface ContentOwnerUpdate {
  display_name?: string
  is_active?: boolean
}

