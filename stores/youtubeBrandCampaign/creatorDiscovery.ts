import { defineStore } from 'pinia'
import { creators as seedCreators, type CreatorProfile } from '~/mocks/fixtures/creators'

interface CreatorDiscoveryState {
  creators: CreatorProfile[]
  shortlists: { id: string; name: string; creatorIds: string[] }[]
}

/**
 * Mock-data-first store for Creator Discovery (release-plan-09 §8.3).
 * Backs `useCreatorDiscovery()` today; swapped for real `/api/v1/creator-bank`
 * calls per release-plan-03 §B.2 without touching any component.
 */
export const useCreatorDiscoveryStore = defineStore('ybc_creator_discovery', {
  state: (): CreatorDiscoveryState => ({
    creators: seedCreators,
    shortlists: [],
  }),

  persist: {
    key: 'ybc_mock_creator_discovery',
  },

  getters: {
    byId: (state) => (id: string) => state.creators.find((c) => c.id === id) ?? null,
  },

  actions: {
    addToShortlist(shortlistId: string, creatorId: string) {
      const shortlist = this.shortlists.find((s) => s.id === shortlistId)
      if (shortlist && !shortlist.creatorIds.includes(creatorId)) {
        shortlist.creatorIds.push(creatorId)
      }
    },
    createShortlist(name: string, creatorIds: string[] = []) {
      const id = `shortlist_${Date.now()}`
      this.shortlists.push({ id, name, creatorIds })
      return id
    },
    reset() {
      this.creators = seedCreators
      this.shortlists = []
    },
  },
})
