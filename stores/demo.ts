import { defineStore } from 'pinia'
import { createSeed } from '~/demo/seed.mjs'
import { executeCommand } from '~/demo/commands.mjs'

export const DEMO_STORAGE_KEY = 'atlas-nexus-competition-demo-v2'

export const useDemoStore = defineStore('demo', {
  state: () => ({ data: createSeed(), ready: false, message: '', noticeTone: 'success' as 'success' | 'error' | 'success' }),
  actions: {
    hydrate() {
      if (this.ready || !import.meta.client) return
      try {
        const raw = localStorage.getItem(DEMO_STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed?.version === 2 && Array.isArray(parsed.channels) && Array.isArray(parsed.campaigns)) this.data = parsed
      } catch {
        this.message = 'Demo data could not be read. Reset the demo to restore its sample workspace.'
        this.noticeTone = 'error'
      }
      this.ready = true
      window.addEventListener('storage', (event) => {
        if (event.key !== DEMO_STORAGE_KEY) return
        try {
          this.data = event.newValue ? JSON.parse(event.newValue) : createSeed()
        } catch {
          this.data = createSeed()
        }
      })
    },
    run(command: Record<string, any>, session: Record<string, any>) {
      try {
        this.data = executeCommand(this.data, session, command)
        this.message = 'Saved in this browser.'
        this.noticeTone = 'success'
        if (import.meta.client) localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(this.data))
        return true
      } catch (error: any) {
        this.message = error?.message || 'That action could not be saved.'
        this.noticeTone = 'error'
        return false
      }
    },
    clearMessage() { this.message = '' },
  },
})
