export interface ReleaseNoteListItem {
  slug: string
  title: string
  release_date: string
  status: string | null
  summary: string | null
  related_plan_path: string | null
}

export interface ReleaseNoteDetail extends ReleaseNoteListItem {
  body_html: string
  is_published: boolean
  created_at: string
  updated_at: string | null
}

export interface PaginatedReleaseNotes {
  items: ReleaseNoteListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useReleaseNotes() {
  const { get, patch } = useApi()

  const fetchReleaseNotes = async (params: {
    q?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    pageSize?: number
  } = {}): Promise<PaginatedReleaseNotes> => {
    const query = new URLSearchParams()
    query.set('page', String(params.page || 1))
    query.set('page_size', String(params.pageSize || 20))
    if (params.q) query.set('q', params.q)
    if (params.dateFrom) query.set('date_from', params.dateFrom)
    if (params.dateTo) query.set('date_to', params.dateTo)
    const res = await get<PaginatedReleaseNotes>(`/api/v1/settings/release-notes?${query.toString()}`)
    return res.data
  }

  const fetchReleaseNote = async (slug: string): Promise<ReleaseNoteDetail> => {
    const res = await get<ReleaseNoteDetail>(`/api/v1/settings/release-notes/${slug}`)
    return res.data
  }

  const setReleaseNotePublished = async (slug: string, isPublished: boolean): Promise<ReleaseNoteDetail> => {
    const res = await patch<ReleaseNoteDetail>(`/api/v1/settings/release-notes/${slug}`, {
      is_published: isPublished,
    })
    return res.data
  }

  return {
    fetchReleaseNotes,
    fetchReleaseNote,
    setReleaseNotePublished,
  }
}
