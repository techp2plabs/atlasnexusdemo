import { defineStore } from 'pinia'
import { roleCanManageUsersAndInvites } from '~/utils/canManageUsersAndInvites'

export interface User {
  id: string
  email: string
  name: string
  role: string
  organization_id: string | null
  mcn_id: string | null
  status: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

const STORAGE_KEY = 'atlas-nexus-demo-auth'

const DEFAULT_USERS: Record<string, User> = {
  atlas_superadmin: {
    id: 'user-superadmin-1',
    email: 'admin@atlasnexus.app',
    name: 'Super Admin',
    role: 'atlas_superadmin',
    organization_id: 'a3ce0027-3a9a-4acf-9dac-2c2cbff845cd',
    mcn_id: 'c6c43b07-6abc-4ce1-8813-6d5e91f03d61',
    status: 'active',
  },
  org_owner: {
    id: 'user-org-owner-1',
    email: 'owner@p2plabs.xyz',
    name: 'P2P Labs Owner',
    role: 'org_owner',
    organization_id: 'a3ce0027-3a9a-4acf-9dac-2c2cbff845cd',
    mcn_id: 'c6c43b07-6abc-4ce1-8813-6d5e91f03d61',
    status: 'active',
  },
  mcn_operator: {
    id: 'user-mcn-op-1',
    email: 'operator@p2pnetwork.xyz',
    name: 'Partner Network Lead',
    role: 'mcn_operator',
    organization_id: 'a3ce0027-3a9a-4acf-9dac-2c2cbff845cd',
    mcn_id: 'c6c43b07-6abc-4ce1-8813-6d5e91f03d61',
    status: 'active',
  },
  creator: {
    id: 'user-creator-1',
    email: 'creator@youtube.com',
    name: 'Fetty Bismo',
    role: 'creator',
    organization_id: 'a3ce0027-3a9a-4acf-9dac-2c2cbff845cd',
    mcn_id: 'c6c43b07-6abc-4ce1-8813-6d5e91f03d61',
    status: 'active',
  },
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    return {
      token: 'demo-token-nexus-2026',
      user: { ...DEFAULT_USERS.atlas_superadmin },
      isAuthenticated: true,
    }
  },

  actions: {
    hydrate() {
      if (typeof window === 'undefined') return
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.user) {
            this.user = parsed.user
            this.token = parsed.token || 'demo-token-nexus-2026'
            this.isAuthenticated = parsed.isAuthenticated ?? true
          }
        }
      } catch (e) {
        console.warn('Failed to hydrate auth store', e)
      }
    },

    save() {
      if (typeof window === 'undefined') return
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            token: this.token,
            user: this.user,
            isAuthenticated: this.isAuthenticated,
          }),
        )
      } catch (e) {
        console.warn('Failed to save auth store', e)
      }
    },

    setRole(roleName: string) {
      const match = DEFAULT_USERS[roleName] || {
        id: `user-${roleName}`,
        email: `${roleName}@atlasnexus.app`,
        name: roleName.toUpperCase(),
        role: roleName,
        organization_id: 'a3ce0027-3a9a-4acf-9dac-2c2cbff845cd',
        mcn_id: 'c6c43b07-6abc-4ce1-8813-6d5e91f03d61',
        status: 'active',
      }
      this.user = { ...match }
      this.token = 'demo-token-nexus-2026'
      this.isAuthenticated = true
      this.save()
    },

    async login(email: string, password?: string) {
      let role = 'atlas_superadmin'
      if (email.includes('owner') || email.includes('org')) role = 'org_owner'
      else if (email.includes('mcn') || email.includes('network')) role = 'mcn_operator'
      else if (email.includes('creator')) role = 'creator'

      this.setRole(role)
      return { success: true }
    },

    async fetchMe() {
      return { success: true }
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      this.save()
    },
  },

  getters: {
    isAdmin: (state): boolean => {
      return state.user?.role === 'atlas_superadmin' || state.user?.role === 'atlas_admin'
    },
    isOrgAdmin: (state): boolean => {
      return state.user?.role === 'org_owner' || state.user?.role === 'org_admin'
    },
    isMcnOperator: (state): boolean => {
      return state.user?.role === 'mcn_operator'
    },
    isCreator: (state): boolean => {
      return state.user?.role === 'creator'
    },
    canManageUsersAndInvites: (state): boolean => {
      return roleCanManageUsersAndInvites(state.user?.role)
    },
  },
})
