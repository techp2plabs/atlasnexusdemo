import type { CreatorLinkDetail, CreatorLinkPage, CreatorLinkResult, AdminCreatorLink } from '~/types/creatorChannelLink'
export function useCreatorChannelLinks() {
  const { get, post } = useApi()
  const inbox = () => get<CreatorLinkPage>('/api/v1/creator/channel-link-requests')
  const detail = (id: string) => get<CreatorLinkDetail>(`/api/v1/creator/channel-link-requests/${encodeURIComponent(id)}`)
  const respond = (id: string, decision: 'accept' | 'decline', channelIds: string[] = []) => post<CreatorLinkResult>(`/api/v1/creator/channel-link-requests/${encodeURIComponent(id)}/respond`, { decision, ...(decision === 'accept' ? { channel_ids: channelIds, consent_version: 'r3-2026-10' } : {}) })
  const adminList = (targetUserId?: string) => get<{items: AdminCreatorLink[]}>('/api/v1/admin/creator-channel-link-requests', { params: targetUserId ? { target_user_id: targetUserId } : {} })
  const action = (id: string, payload: Record<string, unknown>) => post<CreatorLinkResult>(`/api/v1/admin/creator-channel-link-requests/${encodeURIComponent(id)}/action`, payload)
  const retry = (id: string) => post<CreatorLinkResult>(`/api/v1/admin/creator-channel-link-requests/${encodeURIComponent(id)}/retry`, {})
  return { inbox, detail, respond, adminList, action, retry }
}
