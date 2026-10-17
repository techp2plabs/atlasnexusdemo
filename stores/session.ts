import { defineStore } from 'pinia'

const SESSION_KEY = 'atlas-nexus-demo-session-v1'
const demoProfiles: Record<string, any> = {
  admin: { role: 'admin', userId: 'admin-demo', name: 'Aditya Pratama', email: 'aditya@demo.atlasnexus.test' },
  agency: { role: 'agency', userId: 'agency-demo', name: 'Nadia Putri', email: 'nadia@demo.atlasnexus.test', organizationId: 'org-orbit' },
  creator: { role: 'creator', userId: 'creator-demo', name: 'Fetty Bismo Channel', email: 'creator@demo.atlasnexus.test', creatorId: 'creator-maya', channelId: 'channel-maya' },
}

export function getDemoProfile(role: string) {
  const profile = demoProfiles[role]
  if (!profile) return null
  return { role: profile.role, name: profile.name, email: profile.email }
}

export const useSessionStore = defineStore('session', {
  state: () => ({ session: null as Record<string, any> | null }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.role),
    roleLabel: (state) => ({ admin: 'Super Admin', agency: 'Agency', creator: 'Creator' }[state.session?.role as string] || 'Demo workspace'),
  },
  actions: {
    hydrate() {
      if (!import.meta.client || this.session) return
      try {
        const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
        if (saved && demoProfiles[saved.role]) this.session = { ...demoProfiles[saved.role], ...saved }
      } catch { this.session = null }
    },
    signIn(role: string, profile: Record<string, string> = {}) {
      if (!demoProfiles[role]) throw new Error('Choose Admin, Agency or Creator demo access.')
      this.session = { ...demoProfiles[role], ...profile, role, registeredAt: new Date().toISOString() }
      if (import.meta.client) sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session))
    },
    signOut() {
      this.session = null
      if (import.meta.client) sessionStorage.removeItem(SESSION_KEY)
    },
  },
})
