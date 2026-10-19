import { useApi } from '~/composables/useApi'

/**
 * Real notification feed (F-7) — see release-plan-20260911-youtube-brand-campaign-r0-foundation-v1.md §7.
 *
 * Separate from composables/youtubeBrandCampaign/useNotifications.ts (the existing
 * mock-store composable behind NotificationBell.vue), which stays mock-backed for
 * the creator-audience side (R3, not built yet). This composable is the real,
 * agency-facing counterpart; wiring it into NotificationBell.vue's reactive store
 * shape is noted as follow-up, not part of either release plan's acceptance criteria.
 */

export interface NotificationRecord {
  id: string
  kind: string
  title: string
  body: string | null
  severity: 'info' | 'success' | 'warning' | 'danger'
  entity_type: string | null
  entity_id: string | null
  action_url: string | null
  read_at: string | null
  created_at: string
}

export interface PaginatedNotifications {
  items: NotificationRecord[]
  total: number
  page: number
  page_size: number
}

export function useNotificationsApi() {
  const { get, post } = useApi()

  async function list(page = 1): Promise<PaginatedNotifications> {
    const { data } = await get<PaginatedNotifications>('/api/v1/notifications', { params: { page } })
    return data
  }

  async function unreadCount(): Promise<number> {
    const { data } = await get<{ count: number }>('/api/v1/notifications/unread-count')
    return data.count
  }

  async function markRead(id: string): Promise<NotificationRecord> {
    const { data } = await post<NotificationRecord>(`/api/v1/notifications/${id}/read`)
    return data
  }

  return { list, unreadCount, markRead }
}
