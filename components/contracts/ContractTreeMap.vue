<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="rounded-lg border border-border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-3 text-sm font-semibold text-foreground dark:text-white">Organizations</div>
      <div class="space-y-2">
        <button
          v-for="o in nodes.organizations"
          :key="o.id"
          class="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          :class="selectedNode?.type === 'organization' && selectedNode?.id === o.id
            ? 'border-brand-400 bg-accent dark:border-brand-600 dark:bg-brand-900/20'
            : 'border-border bg-white dark:border-gray-800 dark:bg-gray-900'"
          @click="$emit('select-node', { type: 'organization', id: o.id })"
        >
          <div class="font-medium text-foreground dark:text-white">{{ o.name }}</div>
          <div class="mt-1 flex flex-wrap gap-2">
            <EdgeBadge
              v-if="platformEdgeByOrg[o.id]"
              :counts="platformEdgeByOrg[o.id].counts"
              @click.stop="$emit('select-edge', { type: 'platform_to_org', key: { organization_id: o.id } })"
            />
          </div>
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-3 text-sm font-semibold text-foreground dark:text-white">MCNs</div>
      <div class="space-y-2">
        <button
          v-for="m in nodes.mcns"
          :key="m.id"
          class="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          :class="selectedNode?.type === 'mcn' && selectedNode?.id === m.id
            ? 'border-brand-400 bg-accent dark:border-brand-600 dark:bg-brand-900/20'
            : 'border-border bg-white dark:border-gray-800 dark:bg-gray-900'"
          @click="$emit('select-node', { type: 'mcn', id: m.id })"
        >
          <div class="font-medium text-foreground dark:text-white">{{ m.name }}</div>
          <div class="mt-1 flex flex-wrap gap-2">
            <EdgeBadge
              v-if="orgEdgeByMcn[m.id]"
              :counts="orgEdgeByMcn[m.id].counts"
              @click.stop="$emit('select-edge', { type: 'org_to_mcn', key: { organization_id: m.organization_id, mcn_id: m.id } })"
            />
          </div>
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-3 text-sm font-semibold text-foreground dark:text-white">Channels</div>
      <div class="space-y-2">
        <button
          v-for="c in filteredChannels"
          :key="c.id"
          class="w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          :class="selectedNode?.type === 'channel' && selectedNode?.id === c.id
            ? 'border-brand-400 bg-accent dark:border-brand-600 dark:bg-brand-900/20'
            : 'border-border bg-white dark:border-gray-800 dark:bg-gray-900'"
          @click="$emit('select-node', { type: 'channel', id: c.id })"
        >
          <div class="font-medium text-foreground dark:text-white">{{ c.title }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ c.youtube_channel_id }}</div>
          <div class="mt-1 flex flex-wrap gap-2">
            <EdgeBadge
              v-if="mcnEdgeByChannel[c.id]"
              :counts="mcnEdgeByChannel[c.id].counts"
              @click.stop="$emit('select-edge', { type: 'mcn_to_channel', key: { mcn_id: c.mcn_id, channel_id: c.id } })"
            />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import type {
  ContractTreeResponse,
  EdgeCounts,
  PlatformToOrgEdge,
  OrgToMcnEdge,
  McnToChannelEdge,
} from '~/composables/useContractTree'

type SelectedNode = { type: 'organization' | 'mcn' | 'channel'; id: string } | null

const props = defineProps<{
  tree: ContractTreeResponse
  search: string
  selectedNode: SelectedNode
}>()

defineEmits<{
  (e: 'select-node', payload: { type: 'organization' | 'mcn' | 'channel'; id: string }): void
  (e: 'select-edge', payload: { type: 'platform_to_org' | 'org_to_mcn' | 'mcn_to_channel'; key: any }): void
}>()

const nodes = computed(() => props.tree.nodes)

const platformEdgeByOrg = computed<Record<string, PlatformToOrgEdge>>(() => {
  const out: Record<string, PlatformToOrgEdge> = {}
  for (const e of props.tree.edges.platform_to_org) out[e.organization_id] = e
  return out
})

const orgEdgeByMcn = computed<Record<string, OrgToMcnEdge>>(() => {
  const out: Record<string, OrgToMcnEdge> = {}
  for (const e of props.tree.edges.org_to_mcn) out[e.mcn_id] = e
  return out
})

const mcnEdgeByChannel = computed<Record<string, McnToChannelEdge>>(() => {
  const out: Record<string, McnToChannelEdge> = {}
  for (const e of props.tree.edges.mcn_to_channel) out[e.channel_id] = e
  return out
})

const filteredChannels = computed(() => {
  const s = props.search.trim().toLowerCase()
  if (!s) return nodes.value.channels
  return nodes.value.channels.filter(
    (c) => c.title.toLowerCase().includes(s) || c.youtube_channel_id.toLowerCase().includes(s),
  )
})

const EdgeBadge = defineComponent({
  name: 'EdgeBadge',
  props: {
    counts: { type: Object as () => EdgeCounts, required: true },
  },
  setup(props) {
    const variant = computed(() => {
      const { active, future, expired } = props.counts
      if (active > 0) return 'green'
      if (future > 0) return 'yellow'
      if (expired > 0) return 'gray'
      return 'red'
    })

    const classes = computed(() => {
      switch (variant.value) {
        case 'green':
          return 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200'
        case 'yellow':
          return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-200'
        case 'gray':
          return 'border-border bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200'
        default:
          return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200'
      }
    })

    return { classes }
  },
  template: `
    <span class="inline-flex cursor-pointer items-center gap-2 rounded-full border px-2 py-0.5 text-[11px]" :class="classes">
      <span>A:{{ counts.active }}</span>
      <span>F:{{ counts.future }}</span>
      <span>E:{{ counts.expired }}</span>
    </span>
  `,
})
</script>

