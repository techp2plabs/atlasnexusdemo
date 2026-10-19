import { ref } from 'vue'
import { useCampaignReportInsight } from '~/composables/useCampaignReportInsight'
import { useChannelReportInsight } from '~/composables/useChannelReportInsight'

export type InsightJobKind = 'campaign' | 'channel'

export interface TrackedInsightJob {
  key: string
  reportId: string
  insightType: string
  kind: InsightJobKind
  label: string
  startedAt: number
}

const STORAGE_KEY = 'atlas:insight-jobs:v1'
const POLL_INTERVAL_MS = 5000

// Module-scoped singleton state — same pattern as useToast.ts's `toasts` ref — so
// tracked jobs and the poll loop survive Vue Router navigation between pages/tabs
// instead of being tied to whichever component happened to start the generation.
const jobs = ref<Record<string, TrackedInsightJob>>({})
let pollTimer: ReturnType<typeof setInterval> | null = null

// Captured once per call to useInsightJobTracker() from a real Nuxt component
// context (layouts/default.vue, InsightLane.vue, ChannelReportInsightTab.vue).
// useApi()'s underlying axios client is a lazily-created singleton, so re-capturing
// these on every call is cheap. This keeps the poll loop itself — which runs from a
// bare setInterval with no Vue/Nuxt component instance active — from ever needing
// to call a Nuxt composable (useRuntimeConfig, etc.) outside a valid context.
let campaignFetchSummary: ((reportId: string, insightType?: string) => Promise<any>) | null = null
let channelFetchSummary: ((reportId: string) => Promise<any>) | null = null

function jobKey(kind: InsightJobKind, reportId: string, insightType: string): string {
  return `${kind}:${reportId}:${insightType}`
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(jobs.value)))
  } catch {
    // best-effort — localStorage may be unavailable (private mode, quota exceeded)
  }
}

function untrack(key: string) {
  const next = { ...jobs.value }
  delete next[key]
  jobs.value = next
  persist()
  if (Object.keys(jobs.value).length === 0 && pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function requestNotificationPermissionIfNeeded() {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

function notify(job: TrackedInsightJob, ok: boolean, message: string) {
  // useToast.ts only touches Vue's `ref()`, never a Nuxt composable, so calling it
  // here (outside any component setup) is safe.
  const { success, error } = useToast()
  if (ok) success(message)
  else error(message)

  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  // Only bother with a native notification if the user isn't already looking at
  // this tab — the toast already covers that case.
  if (document.visibilityState === 'visible' && document.hasFocus()) return
  try {
    new Notification(ok ? 'Insight ready' : 'Insight generation failed', { body: message })
  } catch {
    // best-effort
  }
}

async function checkJob(job: TrackedInsightJob) {
  try {
    const fetchSummary = job.kind === 'campaign' ? campaignFetchSummary : channelFetchSummary
    if (!fetchSummary) return
    const summary =
      job.kind === 'campaign'
        ? await fetchSummary(job.reportId, job.insightType)
        : await fetchSummary(job.reportId)
    const attempt = summary?.latest_attempt
    if (!attempt || attempt.status === 'processing') return

    if (attempt.status === 'completed') {
      notify(job, true, `${job.label} is ready.`)
    } else if (attempt.status === 'failed') {
      notify(job, false, `${job.label} failed to generate${attempt.error_message ? `: ${attempt.error_message}` : '.'}`)
    }
    untrack(job.key)
  } catch {
    // transient network error — leave it tracked, the next tick will retry
  }
}

function pollTick() {
  Object.values(jobs.value).forEach((job) => {
    checkJob(job)
  })
}

function ensurePolling() {
  if (pollTimer || typeof window === 'undefined') return
  pollTimer = setInterval(pollTick, POLL_INTERVAL_MS)
}

export function useInsightJobTracker() {
  campaignFetchSummary = useCampaignReportInsight().fetchInsightSummary
  channelFetchSummary = useChannelReportInsight().fetchInsightSummary

  const trackJob = (job: Omit<TrackedInsightJob, 'key' | 'startedAt'>) => {
    const key = jobKey(job.kind, job.reportId, job.insightType)
    jobs.value = { ...jobs.value, [key]: { ...job, key, startedAt: Date.now() } }
    persist()
    requestNotificationPermissionIfNeeded()
    ensurePolling()
  }

  const isTracking = (kind: InsightJobKind, reportId: string, insightType: string) =>
    !!jobs.value[jobKey(kind, reportId, insightType)]

  // Called once on app boot (layouts/default.vue) to resume polling for jobs left
  // in flight from a previous page load — the very first tick immediately resolves
  // anything that already finished server-side while the browser was away.
  const rehydrate = () => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const persisted = raw ? (JSON.parse(raw) as TrackedInsightJob[]) : []
      if (!persisted.length) return
      const restored: Record<string, TrackedInsightJob> = {}
      persisted.forEach((j) => {
        restored[j.key] = j
      })
      jobs.value = restored
      ensurePolling()
      pollTick()
    } catch {
      // best-effort
    }
  }

  return { jobs, trackJob, isTracking, rehydrate }
}
