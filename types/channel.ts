export interface YouTubeChannel {
  id: string
  channel_id: string
  mcn_id: string
  creator_user_id: string | null
  title: string
  subscriber_count: number
  video_count: number
  view_count: number
  thumbnail_url: string | null
  custom_url: string | null
  description: string | null
  published_at: string | null
  content_owner_id: string | null
  synced_at: string | null
  channel_type: 'music_recording' | 'publishing' | 'owned_operated' | 'affiliate' | null
  created_at: string
  updated_at: string
  // Relationship fields
  creator_user_name: string | null
  mcn_name: string | null
  organization_id: string | null
  organization_name: string | null
}

export interface ChannelCreate {
  channel_id: string
  mcn_id: string
  creator_user_id?: string | null
  title: string
  subscriber_count?: number
  video_count?: number
  view_count?: number
  thumbnail_url?: string | null
  custom_url?: string | null
  description?: string | null
  published_at?: string | null
  content_owner_id?: string | null
  synced_at?: string | null
  channel_type?: 'music_recording' | 'publishing' | 'owned_operated' | 'affiliate' | null
}

export interface ChannelUpdate {
  creator_user_id?: string | null
  mcn_id?: string | null
  title?: string | null
  subscriber_count?: number | null
  video_count?: number | null
  view_count?: number | null
  thumbnail_url?: string | null
  custom_url?: string | null
  description?: string | null
  published_at?: string | null
  content_owner_id?: string | null
  synced_at?: string | null
  channel_type?: 'music_recording' | 'publishing' | 'owned_operated' | 'affiliate' | null
}

export interface ChannelFetchResponse {
  channel_id: string
  title: string
  subscriber_count: number
  video_count: number
  view_count: number
  thumbnail_url: string | null
  description: string | null
  published_at: string | null
}

export interface FetchedYouTubeChannel {
  id: string
  organization_id: string
  content_owner_id: string
  channel_id: string
  title: string | null
  subscriber_count: number
  video_count: number
  view_count: number
  thumbnail_url: string | null
  description: string | null
  published_at: string | null
  fetched_at: string
  archived_at: string | null
  archived_reason: string | null
}

export interface ChannelFetchListResponse {
  channels: ChannelFetchResponse[]
  total_count: number
  content_owner_id: string
}

export interface ChannelSyncResponse {
  total_processed: number
  added: number
  updated: number
  skipped: number
  errors: string[]
}

export interface ChannelStats {
  subscriber_count: number
  video_count: number
  view_count: number
  synced_at: string | null
}
