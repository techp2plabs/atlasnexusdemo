export interface Page {
  id: string
  slug: string
  title: string
  description: string | null
  content: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string | null
}

export interface PagePublic {
  slug: string
  title: string
  description: string | null
  content: string | null
}

export interface PaginatedPages {
  items: Page[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PageCreatePayload {
  slug: string
  title: string
  description?: string | null
  content?: string | null
  status?: 'active' | 'inactive'
}

export interface PageUpdatePayload {
  title?: string
  description?: string | null
  content?: string | null
  status?: 'active' | 'inactive'
}

export function usePages() {
  const { get, post, patch, delete: del } = useApi()

  const fetchPages = async (page = 1, pageSize = 50): Promise<PaginatedPages> => {
    const res = await get<PaginatedPages>(`/api/v1/admin/pages?page=${page}&page_size=${pageSize}`)
    return res.data
  }

  const fetchPage = async (id: string): Promise<Page> => {
    const res = await get<Page>(`/api/v1/admin/pages/${id}`)
    return res.data
  }

  const fetchPublicPage = async (slug: string): Promise<PagePublic> => {
    const res = await get<PagePublic>(`/api/v1/pages/${slug}`)
    return res.data
  }

  const createPage = async (payload: PageCreatePayload): Promise<Page> => {
    const res = await post<Page>('/api/v1/admin/pages', payload)
    return res.data
  }

  const updatePage = async (id: string, payload: PageUpdatePayload): Promise<Page> => {
    const res = await patch<Page>(`/api/v1/admin/pages/${id}`, payload)
    return res.data
  }

  const deletePage = async (id: string): Promise<void> => {
    await del(`/api/v1/admin/pages/${id}`)
  }

  return { fetchPages, fetchPage, fetchPublicPage, createPage, updatePage, deletePage }
}
