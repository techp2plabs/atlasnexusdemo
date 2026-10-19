export interface TopUnmappedChannelSummary {
  id: string
  channel_id: string
  title?: string | null
  subscriber_count: number
  view_count: number
  thumbnail_url?: string | null
  content_owner_id: string
}

export interface Organization {
  id: string
  brand_name: string
  name: string
  logo_url?: string
  address?: string
  tax_id?: string
  city?: string
  nation?: string
  bank_account?: string
  bank_account_number?: string
  bank_account_name?: string
  created_at: string
  updated_at: string
  owner_email?: string
  mcn_count?: number
  /** @deprecated use mapped_channels_count/total_channels_count — kept as an alias of the active (non-deleted) count for one release. */
  channel_count?: number
  status?: string
   // Channel mapping summary (per organization)
  unmapped_channels_count?: number
  mapped_channels_count?: number
  archived_channels_count?: number
  total_channels_count?: number
  // Soft-deleted youtube_channels under this org's MCNs (explains legacy 47-vs-40 gaps; tooltip only)
  deleted_channels_count?: number
  // Overview snapshot list
  top_unmapped_channels?: TopUnmappedChannelSummary[]
}

