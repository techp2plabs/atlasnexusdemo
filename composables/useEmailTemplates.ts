export interface EmailTemplate {
  id: string
  key: string
  name: string
  subject: string
  body_html: string
  variables_schema: string[] | null
  is_active: boolean
  updated_by: string | null
  updated_by_name: string | null
  created_at: string
  updated_at: string | null
}

export interface EmailTemplateUpdatePayload {
  subject?: string
  body_html?: string
  is_active?: boolean
}

export interface EmailTemplatePreviewPayload {
  subject?: string
  body_html?: string
  sample_context?: Record<string, string>
}

export interface EmailTemplatePreview {
  subject: string
  body_html: string
}

export interface EmailDeliveryLog {
  id: string
  template_key: string
  to_email: string
  status: 'sent' | 'failed'
  error_message: string | null
  context_meta: Record<string, unknown> | null
  retried_from_id: string | null
  created_at: string
}

export interface EmailDeliveryLogDetail extends EmailDeliveryLog {
  subject: string | null
  body_html: string | null
}

export interface PaginatedEmailDeliveryLogs {
  items: EmailDeliveryLog[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export function useEmailTemplates() {
  const { get, put, post } = useApi()

  const fetchTemplates = async (): Promise<EmailTemplate[]> => {
    const res = await get<EmailTemplate[]>('/api/v1/settings/email-templates')
    return res.data
  }

  const fetchTemplate = async (key: string): Promise<EmailTemplate> => {
    const res = await get<EmailTemplate>(`/api/v1/settings/email-templates/${key}`)
    return res.data
  }

  const updateTemplate = async (key: string, payload: EmailTemplateUpdatePayload): Promise<EmailTemplate> => {
    const res = await put<EmailTemplate>(`/api/v1/settings/email-templates/${key}`, payload)
    return res.data
  }

  const previewTemplate = async (key: string, payload: EmailTemplatePreviewPayload): Promise<EmailTemplatePreview> => {
    const res = await post<EmailTemplatePreview>(`/api/v1/settings/email-templates/${key}/preview`, payload)
    return res.data
  }

  const fetchDeliveryLogs = async (params: {
    page?: number
    pageSize?: number
    templateKey?: string
    status?: string
  } = {}): Promise<PaginatedEmailDeliveryLogs> => {
    const query = new URLSearchParams()
    query.set('page', String(params.page || 1))
    query.set('page_size', String(params.pageSize || 50))
    if (params.templateKey) query.set('template_key', params.templateKey)
    if (params.status) query.set('status', params.status)
    const res = await get<PaginatedEmailDeliveryLogs>(`/api/v1/settings/email-delivery-logs?${query.toString()}`)
    return res.data
  }

  const fetchDeliveryLog = async (id: string): Promise<EmailDeliveryLogDetail> => {
    const res = await get<EmailDeliveryLogDetail>(`/api/v1/settings/email-delivery-logs/${id}`)
    return res.data
  }

  const retryDeliveryLog = async (id: string): Promise<EmailDeliveryLogDetail> => {
    const res = await post<EmailDeliveryLogDetail>(`/api/v1/settings/email-delivery-logs/${id}/retry`)
    return res.data
  }

  return {
    fetchTemplates,
    fetchTemplate,
    updateTemplate,
    previewTemplate,
    fetchDeliveryLogs,
    fetchDeliveryLog,
    retryDeliveryLog,
  }
}
