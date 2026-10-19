import { useNotificationsStore } from '~/stores/youtubeBrandCampaign/notifications'
import type { NotificationAudience, NotificationType } from '~/mocks/fixtures/notifications'

/**
 * Composable seam for YBC notifications (doc10 §9). See fixture header comment
 * for why this is module-scoped rather than the app's global NotificationMenu.
 */
export function useNotifications() {
  const store = useNotificationsStore()

  function list(audience: NotificationAudience) {
    return store.forAudience(audience)
  }

  function unreadCount(audience: NotificationAudience) {
    return store.unreadCount(audience)
  }

  function push(input: { audience: NotificationAudience; type: NotificationType; message: string; link?: string | null }) {
    store.push({ link: null, ...input })
  }

  function markRead(id: string) {
    store.markRead(id)
  }

  function markAllRead(audience: NotificationAudience) {
    store.markAllRead(audience)
  }

  return { list, unreadCount, push, markRead, markAllRead, store }
}
