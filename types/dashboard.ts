export interface TopChannel {
    id: string
    title: string
    subscriber_count: number
    view_count: number
    thumbnail_url: string | null
}

export interface DashboardStats {
    total_subscribers: number
    total_views: number
    total_videos: number
    total_channels: number
    estimated_revenue: number
    top_channels: TopChannel[]
}
