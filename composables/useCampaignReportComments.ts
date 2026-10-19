export type CommentFetchStatus = 'pending' | 'fetching' | 'completed' | 'partial_failure' | 'failed'
export type CommentSort = 'published_at_desc' | 'published_at_asc' | 'like_count_desc'

export interface ReportComment {
  id: string
  video_id: string
  comment_id: string
  parent_comment_id: string | null
  is_reply: boolean
  author_display_name: string | null
  author_channel_id: string | null
  text_display: string | null
  text_original: string | null
  like_count: number
  reply_count: number
  published_at: string | null
}

export interface PaginatedComments {
  items: ReportComment[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CommentFetchRun {
  id: string
  status: CommentFetchStatus
  videos_total: number
  videos_ok: number
  videos_failed: number
  comments_fetched: number
  failure_details: Record<string, string>
  error_message: string | null
  started_at: string
  completed_at: string | null
}

export function useCampaignReportComments() {
  const { get, post } = useApi()

  const loading = ref(false)
  const error = ref<string | null>(null)

  const triggerCommentsFetch = async (reportId: string): Promise<CommentFetchRun> => {
    loading.value = true
    error.value = null
    try {
      const res = await post<CommentFetchRun>(
        `/api/v1/tools/youtube-brand-deal-report/${reportId}/comments/fetch`,
      )
      return res.data
    } catch (e: any) {
      error.value = e?.response?.data?.detail || 'Failed to fetch comments'
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchComments = async (
    reportId: string,
    params: { videoId?: string; page?: number; pageSize?: number; sort?: CommentSort } = {},
  ): Promise<PaginatedComments> => {
    const res = await get<PaginatedComments>(`/api/v1/tools/youtube-brand-deal-report/${reportId}/comments`, {
      params: {
        video_id: params.videoId || undefined,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 50,
        sort: params.sort ?? 'published_at_desc',
      },
    })
    return res.data
  }

  const fetchCommentsFetchStatus = async (reportId: string): Promise<CommentFetchRun | null> => {
    const res = await get<CommentFetchRun | null>(
      `/api/v1/tools/youtube-brand-deal-report/${reportId}/comments/fetch-status`,
    )
    return res.data
  }

  return {
    loading,
    error,
    triggerCommentsFetch,
    fetchComments,
    fetchCommentsFetchStatus,
  }
}
