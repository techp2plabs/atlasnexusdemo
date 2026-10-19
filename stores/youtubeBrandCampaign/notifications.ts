import { defineStore } from 'pinia'
import { notifications as seedNotifications, type AppNotification, type NotificationAudience, type NotificationType } from '~/mocks/fixtures/notifications'

interface NotificationsState {
  notifications: AppNotification[]
}

/**
 * Mock-data-first store for YBC notifications (doc10 §9).
 * Module-scoped — see mocks/fixtures/notifications.ts for why this doesn't
 * reuse the app's global (unwired) NotificationMenu.vue.
 */
export const useNotificationsStore = defineStore('ybc_notifications', {
  state: (): NotificationsState => ({
    notifications: seedNotifications,
  }),

  persist: {
    key: 'ybc_mock_notifications',
  },

  getters: {
    forAudience: (state) => (audience: NotificationAudience) =>
      state.notifications.filter((n) => n.audience === audience).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    unreadCount: (state) => (audience: NotificationAudience) =>
      state.notifications.filter((n) => n.audience === audience && !n.read).length,
  },

  actions: {
    push(input: { audience: NotificationAudience; type: NotificationType; message: string; link: string | null }) {
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        ...input,
        read: false,
        created_at: new Date().toISOString(),
      })
    },
    markRead(id: string) {
      const n = this.notifications.find((x) => x.id === id)
      if (n) n.read = true
    },
    markAllRead(audience: NotificationAudience) {
      this.notifications.filter((n) => n.audience === audience).forEach((n) => (n.read = true))
    },
    reset() {
      this.notifications = seedNotifications
    },
  },
})
