/**
 * Mock fixture for YouTube Brand Campaign notifications (doc10 §9, §10).
 * Scoped to this module — the app already has a global `NotificationMenu.vue`
 * in the header, but it's unwired template placeholder content shared across
 * every module; rebuilding that globally is out of scope here. This is a
 * module-local system, following doc09 §7.4's "submission confirmations,
 * approvals, rejections, and eligibility results" content, not its literal
 * "one shared header component" implementation.
 */

export type NotificationAudience = 'agency' | 'creator'

export type NotificationType =
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'eligibility_ready'
  | 'video_verified'

export interface AppNotification {
  id: string
  audience: NotificationAudience
  type: NotificationType
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export const notifications: AppNotification[] = [
  {
    id: 'notif_1',
    audience: 'agency',
    type: 'application_submitted',
    message: 'Salsa Food Diary applied to YA\'Bar Q3 2026 Brand Campaign.',
    link: '/app/youtube-brand-campaign/campaign-applications',
    read: false,
    created_at: '2026-07-21T09:00:00Z',
  },
  {
    id: 'notif_2',
    audience: 'creator',
    type: 'eligibility_ready',
    message: 'Your eligibility analysis for YA\'Bar Q3 2026 Brand Campaign is ready — Eligible.',
    link: '/app/youtube-brand-campaign/campaign-applications',
    read: true,
    created_at: '2026-07-18T09:00:00Z',
  },
]
