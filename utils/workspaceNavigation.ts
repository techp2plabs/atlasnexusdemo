export interface WorkspaceNavigationItem {
  label: string
  to: string
  icon: 'discovery' | 'campaigns' | 'applications'
}

/** Mirror existing campaign/discovery visibility; route/API guards remain authoritative. */
export function getCampaignNavigation(role?: string): WorkspaceNavigationItem[] {
  const agency = ['atlas_superadmin', 'atlas_admin', 'org_owner', 'org_admin'].includes(role ?? '')
  if (!agency && role !== 'creator') return []
  const base = '/app/youtube-brand-campaign'
  return [
    ...(agency ? [{ label: 'Creator Discovery', to: `${base}/creator-discovery`, icon: 'discovery' as const }] : []),
    { label: 'Campaigns', to: `${base}/campaigns`, icon: 'campaigns' },
    { label: 'Applications', to: `${base}/campaign-applications`, icon: 'applications' },
  ]
}

export function isNavigationActive(current: string, target: string): boolean {
  const path = current.replace(/\/$/, '')
  return path === target || path.startsWith(`${target}/`)
}
