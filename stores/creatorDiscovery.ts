import { defineStore } from 'pinia'
import type { CreatorProfile } from '~/composables/youtubeBrandCampaign/useCreatorDiscovery'

export const useCreatorDiscoverySessionStore = defineStore('creatorDiscoverySession', {
  state: () => ({
    scope: '',
    selected: [] as Pick<CreatorProfile, 'id' | 'title' | 'thumbnail_url'>[],
    listingPath: '/app/youtube-brand-campaign/creator-discovery',
    scrollY: 0,
    message: '',
  }),
  actions: {
    toggle(creator: Pick<CreatorProfile, 'id' | 'title' | 'thumbnail_url'>) {
      const index = this.selected.findIndex((item) => item.id === creator.id)
      if (index >= 0) this.selected.splice(index, 1)
      else if (this.selected.length < 3) this.selected.push({ id: creator.id, title: creator.title, thumbnail_url: creator.thumbnail_url })
      else { this.message = 'You can compare up to three creators. Remove one to select another.'; return }
      this.message = this.selected.length === 1 ? 'Choose one more creator to compare.' : this.selected.length === 3 ? 'Three creators selected. Remove one to select another.' : `${this.selected.length} creators selected.`
    },
  },
})
