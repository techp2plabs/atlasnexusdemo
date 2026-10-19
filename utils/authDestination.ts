type DestinationUser = { role: string; status: string }

export function isAllowedInternalReturnPath(value?: string | null): boolean {
  if (!value || typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return false
  if (/[\\\u0000-\u001f]/.test(value) || value.includes('\\')) return false
  let decoded = value
  try { for (let i = 0; i < 3; i++) decoded = decodeURIComponent(decoded) } catch { return false }
  if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\')) return false
  if (/^\/auth\/signup\?token=[A-Za-z0-9_-]{20,}$/.test(decoded)) return true
  if (/^\/(?:login|register|auth\/signup)(?:[/?#]|$)/i.test(decoded)) return false
  return true
}

export function resolveAuthDestination(user: DestinationUser, returnTo?: string | null): string {
  if (user.status !== 'active') return '/auth/pending-approval'
  if (isAllowedInternalReturnPath(returnTo)) return returnTo!
  return user.role === 'creator' ? '/app/youtube-brand-campaign/campaigns' : '/app/home'
}
