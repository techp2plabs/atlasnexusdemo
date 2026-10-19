<template>
  <div v-if="!canAccess" class="grid grid-cols-12 gap-4 md:gap-6">
    <div class="col-span-12">
      <div class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <h2 class="text-lg font-semibold text-red-800 dark:text-red-300">Access Denied</h2>
        <p class="mt-2 text-sm text-red-700 dark:text-red-400">You don't have permission to manage entity permissions.</p>
      </div>
    </div>
  </div>

  <div v-else class="grid grid-cols-12 gap-4 md:gap-6">
    <div v-if="!isEmbedded" class="col-span-12">
      <nav class="text-sm text-gray-500 dark:text-gray-400">
        <NuxtLink
          to="/app/access-control/role-assignments"
          class="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Role Assignments
        </NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-gray-700 dark:text-gray-300">Entity access</span>
      </nav>
      <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Manage entity access</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Layout follows the hierarchy: Platform → Organization → MCN partner → Channel. What you can add depends on this user’s
        <strong>global role</strong> (one level of scoped assignments below that level).
      </p>
    </div>

    <div v-if="isEmbedded" class="col-span-12">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Entity permissions</h2>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Assign organizations, MCN partners, and channels for this user. The global role can be changed on the <strong>User details</strong> tab — switching role will deactivate assignments that no longer match.
      </p>
    </div>

    <div
      v-if="loadError && !loading"
      class="col-span-12 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
    >
      {{ loadError }}
      <div class="mt-3">
        <NuxtLink
          v-if="!isEmbedded"
          to="/app/access-control/role-assignments"
          class="font-medium text-purple-700 underline dark:text-purple-300"
        >
          Back to list
        </NuxtLink>
        <NuxtLink
          v-else
          :to="`/app/users/${targetUserId}?tab=details`"
          class="font-medium text-purple-700 underline dark:text-purple-300"
        >
          Back to user details
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="loading && !user" class="col-span-12 rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900">
      Loading…
    </div>

    <template v-else-if="user">
      <div class="col-span-12">
        <div class="rounded-xl border border-purple-200 bg-purple-50/80 p-5 dark:border-purple-900/40 dark:bg-purple-950/30">
          <p class="text-xs font-semibold uppercase tracking-wide text-purple-800 dark:text-purple-200">This user’s role level</p>
          <h2 class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{{ hierarchyMeta.levelTitle }}</h2>
          <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">{{ hierarchyMeta.description }}</p>
          <div class="mt-4 flex flex-wrap items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <template v-for="(step, i) in hierarchyMeta.steps" :key="step">
              <span
                :class="
                  i === hierarchyMeta.activeIndex
                    ? 'rounded-md bg-purple-600 px-2 py-1 font-semibold text-white dark:bg-purple-500'
                    : ''
                "
              >
                {{ step }}
              </span>
              <span v-if="i < hierarchyMeta.steps.length - 1" class="text-gray-400">→</span>
            </template>
          </div>
          <p v-if="authStore.user" class="mt-4 border-t border-purple-200/60 pt-3 text-xs text-gray-600 dark:border-purple-800/50 dark:text-gray-400">
            You are signed in as <span class="font-medium text-gray-900 dark:text-white">{{ formatRole(authStore.user.role) }}</span>
            — you can only grant entities that fall within your effective authorization scope (same checks as the API).
          </p>
        </div>
      </div>

      <div v-if="!isEmbedded" class="col-span-12 lg:col-span-4">
        <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p class="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">User</p>
          <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{{ user.name }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ user.email }}</p>
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            User ID
            <code class="mt-0.5 block break-all rounded bg-gray-100 px-2 py-1 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{{ user.user_id }}</code>
          </p>
          <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Global role:
            <span class="font-medium text-gray-900 dark:text-white">{{ formatRole(user.role) }}</span>
            <span class="block text-xs text-gray-500">(edit on User details tab)</span>
          </p>

          <div
            v-if="user.home_organization_display || user.organization_id"
            class="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/50"
          >
            <p class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Home organization</p>
            <p class="mt-1 font-medium text-gray-900 dark:text-white">{{ user.home_organization_display || '—' }}</p>
            <code v-if="user.organization_id" class="mt-1 block break-all text-[11px] text-gray-500 dark:text-gray-400">{{ user.organization_id }}</code>
          </div>

          <div
            v-if="user.home_mcn_display || user.mcn_id"
            class="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/50"
          >
            <p class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Home MCN partner</p>
            <p class="mt-1 font-medium text-gray-900 dark:text-white">{{ user.home_mcn_display || '—' }}</p>
            <code v-if="user.mcn_id" class="mt-1 block break-all text-[11px] text-gray-500 dark:text-gray-400">{{ user.mcn_id }}</code>
          </div>

          <NuxtLink
            to="/app/access-control/role-assignments"
            class="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Back to list
          </NuxtLink>
        </div>
      </div>

      <div :class="isEmbedded ? 'col-span-12 space-y-6' : 'col-span-12 space-y-6 lg:col-span-8'">
        <div v-if="formError" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          {{ formError }}
        </div>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ hierarchyMeta.primaryHeading }}</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Remove sets access to inactive (revoked). Restore re-enables a previous row.
          </p>
          <ul v-if="primaryAssignments.length" class="mt-4 space-y-3">
            <li
              v-for="a in primaryAssignments"
              :key="a.id"
              class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      {{ entityTypeLabel(a.entity_type) }}
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="
                        a.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      "
                    >
                      {{ a.status }}
                    </span>
                  </div>
                  <p class="mt-1 font-medium text-gray-900 dark:text-white">
                    {{ a.display_name || 'Unknown entity (check ID below)' }}
                  </p>
                  <p v-if="a.display_detail" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ a.display_detail }}
                  </p>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Entity UUID
                    <code class="mt-0.5 block break-all rounded bg-gray-50 px-2 py-1 font-mono text-gray-800 dark:bg-gray-950 dark:text-gray-200">{{ a.entity_id }}</code>
                  </p>
                </div>
                <div class="flex shrink-0 gap-2">
                  <button
                    v-if="a.status === 'active'"
                    type="button"
                    class="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                    :disabled="saving"
                    @click="setAssignmentStatus(a, 'inactive')"
                  >
                    Remove
                  </button>
                  <button
                    v-else
                    type="button"
                    class="rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                    :disabled="saving"
                    @click="setAssignmentStatus(a, 'active')"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </li>
          </ul>
          <p v-else class="mt-4 text-sm text-gray-500 dark:text-gray-400">No {{ primaryKindsHuman }} assignments yet.</p>
        </section>

        <section
          v-if="otherAssignments.length"
          class="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-5 dark:border-gray-600 dark:bg-gray-900/40"
        >
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">{{ hierarchyMeta.otherHeading }}</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Rows that are not the primary scope type for this global role (legacy or exceptional).</p>
          <ul class="mt-4 space-y-3">
            <li
              v-for="a in otherAssignments"
              :key="a.id"
              class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                      {{ entityTypeLabel(a.entity_type) }}
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="
                        a.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      "
                    >
                      {{ a.status }}
                    </span>
                  </div>
                  <p class="mt-1 font-medium text-gray-900 dark:text-white">
                    {{ a.display_name || 'Unknown entity (check ID below)' }}
                  </p>
                  <p v-if="a.display_detail" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {{ a.display_detail }}
                  </p>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Entity UUID
                    <code class="mt-0.5 block break-all rounded bg-gray-50 px-2 py-1 font-mono text-gray-800 dark:bg-gray-950 dark:text-gray-200">{{ a.entity_id }}</code>
                  </p>
                </div>
                <div class="flex shrink-0 gap-2">
                  <button
                    v-if="a.status === 'active'"
                    type="button"
                    class="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                    :disabled="saving"
                    @click="setAssignmentStatus(a, 'inactive')"
                  >
                    Remove
                  </button>
                  <button
                    v-else
                    type="button"
                    class="rounded-lg border border-green-200 px-3 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/20"
                    :disabled="saving"
                    @click="setAssignmentStatus(a, 'active')"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="text-base font-semibold text-gray-900 dark:text-white">Add assignment</h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Allowed entity types for this user’s role:
            <span class="font-medium text-gray-700 dark:text-gray-300">{{ allowedEntityTypes.map(entityTypeLabel).join(', ') }}</span>
          </p>

          <div v-if="allowedEntityTypes.length > 1" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Entity type</label>
              <select
                v-model="addEntityType"
                class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                @change="onAddEntityTypeChange"
              >
                <option v-for="t in allowedEntityTypes" :key="t" :value="t">
                  {{ entityTypeLabel(t) }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="addEntityType === 'organization'" class="mt-3">
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Organization</label>
            <select
              v-model="addSelectedId"
              class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select organization…</option>
              <option v-for="o in organizations" :key="o.id" :value="o.id">
                {{ orgOptionLabel(o) }}
              </option>
            </select>
            <p v-if="addSelectedId" class="mt-1 break-all font-mono text-xs text-gray-500">ID: {{ addSelectedId }}</p>
          </div>

          <template v-else-if="addEntityType === 'mcn_partner'">
            <p v-if="lockMcnsPickerToUserOrganization && user.organization_id" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
              MCN partners must belong to
              <span class="font-medium text-gray-900 dark:text-white">{{ user.home_organization_display || 'this user’s organization' }}</span>
              <code class="mt-1 block break-all text-xs text-gray-500">{{ user.organization_id }}</code>
            </p>
            <div v-if="!lockMcnsPickerToUserOrganization" class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Filter by organization (optional)</label>
                <select
                  v-model="addFilterOrgId"
                  class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  @change="loadMcnsForPicker"
                >
                  <option value="">All (in your access)</option>
                  <option v-for="o in organizations" :key="o.id" :value="o.id">
                    {{ orgOptionLabel(o) }}
                  </option>
                </select>
              </div>
            </div>
            <div class="mt-3">
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">MCN partner</label>
              <select
                v-model="addSelectedId"
                class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                :disabled="pickerMcnsLoading"
              >
                <option value="">{{ pickerMcnsLoading ? 'Loading…' : 'Select MCN…' }}</option>
                <option v-for="m in pickerMcns" :key="m.id" :value="m.id">
                  {{ mcnOptionLabel(m) }}
                </option>
              </select>
              <p v-if="addSelectedId" class="mt-1 break-all font-mono text-xs text-gray-500">ID: {{ addSelectedId }}</p>
            </div>
          </template>

          <template v-else>
            <p v-if="user.role === 'mcn_operator' && user.organization_id" class="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Pick an MCN under
              <span class="font-medium text-gray-900 dark:text-white">{{ user.home_organization_display || 'this user’s organization' }}</span>
              , then a channel. Channels on other MCNs in the same organization are allowed.
            </p>
            <div class="mt-3">
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">MCN partner</label>
              <select
                v-model="addChannelMcnId"
                class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                @change="loadChannelsForPicker"
              >
                <option value="">{{ pickerMcnsLoading ? 'Loading…' : 'Select MCN…' }}</option>
                <option v-for="m in pickerMcns" :key="m.id" :value="m.id">
                  {{ mcnOptionLabel(m) }}
                </option>
              </select>
            </div>
            <div class="mt-3">
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Channel</label>
              <select
                v-model="addSelectedId"
                class="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                :disabled="pickerChannelsLoading || !addChannelMcnId"
              >
                <option value="">{{ pickerChannelsLoading ? 'Loading…' : 'Select channel…' }}</option>
                <option v-for="ch in pickerChannels" :key="ch.id" :value="ch.id">
                  {{ channelOptionLabel(ch) }}
                </option>
              </select>
              <p v-if="addSelectedId" class="mt-1 break-all font-mono text-xs text-gray-500">ID: {{ addSelectedId }}</p>
            </div>
          </template>

          <div class="mt-5 flex justify-end">
            <button
              type="button"
              class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="saving || !canSubmitAdd"
              @click="submitAddAssignment"
            >
              {{ saving ? 'Saving…' : 'Add assignment' }}
            </button>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { roleCanManageUsersAndInvites } from '~/utils/canManageUsersAndInvites'
import type { RoleAssignment, RoleAssignmentUser } from '~/types/roleAssignment'
import type { MCN } from '~/types/mcn'
import type { YouTubeChannel } from '~/types/channel'
import type { Organization } from '~/types/organization'

type EntityKind = 'organization' | 'mcn_partner' | 'channel'

const props = withDefaults(
  defineProps<{
    targetUserId: string
    /** embedded: under /app/users/[id] tab; standalone: full page chrome (legacy) */
    variant?: 'embedded' | 'standalone'
  }>(),
  { variant: 'embedded' }
)

const authStore = useAuthStore()
const { loading, saving, error, fetchRoleAssignmentUser, upsertRoleAssignment } = useRoleAssignments()
const { success: toastOk, error: toastErr } = useToast()
const { organizations, fetchOrganizations } = useOrganizations()
const { get } = useApi()

const canAccess = computed(() => roleCanManageUsersAndInvites(authStore.user?.role))
const isEmbedded = computed(() => props.variant === 'embedded')

const user = ref<RoleAssignmentUser | null>(null)
const loadError = ref<string | null>(null)
const formError = ref<string | null>(null)

const addEntityType = ref<EntityKind>('organization')
const addFilterOrgId = ref('')
const addChannelMcnId = ref('')
const addSelectedId = ref('')

const pickerMcns = ref<MCN[]>([])
const pickerChannels = ref<YouTubeChannel[]>([])
const pickerMcnsLoading = ref(false)
const pickerChannelsLoading = ref(false)

const hierarchyMeta = computed(() => {
  const r = user.value?.role ?? ''
  const steps = ['Platform', 'Organization', 'MCN partner', 'Channel'] as const

  if (r === 'atlas_superadmin' || r === 'atlas_admin') {
    return {
      levelTitle: 'Platform (Global)',
      description:
        'Atlas roles operate at platform level. For org owners and org admins you manage, scoped access is expressed as Organization assignments (and you only manage users at organization scope and below per policy).',
      primaryKinds: ['organization'] as EntityKind[],
      primaryHeading: 'Organizations assigned',
      otherHeading: 'Other entity scopes',
      steps: [...steps],
      activeIndex: 0,
    }
  }
  if (r === 'org_owner') {
    return {
      levelTitle: 'Organization',
      description:
        'Organization owners operate within a specific organization. Organization assignments define which organization records this user may access in the product.',
      primaryKinds: ['organization'] as EntityKind[],
      primaryHeading: 'Organizations assigned',
      otherHeading: 'Other entity scopes',
      steps: [...steps],
      activeIndex: 1,
    }
  }
  if (r === 'org_admin') {
    return {
      levelTitle: 'Organization',
      description:
        'Organization admins are scoped at organization level; their day-to-day access is driven by MCN partner assignments within that organization.',
      primaryKinds: ['mcn_partner'] as EntityKind[],
      primaryHeading: 'MCN partners assigned',
      otherHeading: 'Other entity scopes',
      steps: [...steps],
      activeIndex: 1,
    }
  }
  if (r === 'mcn_operator') {
    return {
      levelTitle: 'MCN partner',
      description:
        'MCN operators can be granted multiple MCN partners under their home organization, and/or specific channels on those MCNs. Home MCN is the default profile record; assignments below define actual access.',
      primaryKinds: ['mcn_partner', 'channel'] as EntityKind[],
      primaryHeading: 'MCN partners & channels assigned',
      otherHeading: 'Other entity scopes',
      steps: [...steps],
      activeIndex: 2,
    }
  }
  if (r === 'creator') {
    return {
      levelTitle: 'Channel',
      description:
        'Creators are scoped at channel level. Channel assignments define which channels this user may access (multiple channels allowed).',
      primaryKinds: ['channel'] as EntityKind[],
      primaryHeading: 'Channels assigned',
      otherHeading: 'Other entity scopes',
      steps: [...steps],
      activeIndex: 3,
    }
  }
  return {
    levelTitle: 'Unknown role',
    description: 'Assignments are shown below; confirm entity types against your policy.',
    primaryKinds: ['organization'] as EntityKind[],
    primaryHeading: 'Assignments',
    otherHeading: 'Other',
    steps: [...steps],
    activeIndex: 0,
  }
})

const allowedEntityTypes = computed((): EntityKind[] => {
  const r = user.value?.role
  switch (r) {
    case 'atlas_superadmin':
    case 'atlas_admin':
    case 'org_owner':
      return ['organization']
    case 'org_admin':
      return ['mcn_partner']
    case 'mcn_operator':
      return ['mcn_partner', 'channel']
    case 'creator':
      return ['channel']
    default:
      return ['organization', 'mcn_partner', 'channel']
  }
})

const primaryKindsSet = computed(() => new Set(hierarchyMeta.value.primaryKinds))

const primaryAssignments = computed(() => {
  const u = user.value
  if (!u?.assignments?.length) return []
  const kinds = primaryKindsSet.value
  return u.assignments.filter((a) => kinds.has(a.entity_type as EntityKind))
})

const otherAssignments = computed(() => {
  const u = user.value
  if (!u?.assignments?.length) return []
  const kinds = primaryKindsSet.value
  return u.assignments.filter((a) => !kinds.has(a.entity_type as EntityKind))
})

const lockMcnsPickerToUserOrganization = computed(
  () =>
    (user.value?.role === 'org_admin' && !!user.value?.organization_id) ||
    (user.value?.role === 'mcn_operator' && !!user.value?.organization_id)
)

const primaryKindsHuman = computed(() => hierarchyMeta.value.primaryKinds.map(entityTypeLabel).join(' or '))

const formatRole = (role: string) => {
  const map: Record<string, string> = {
    atlas_superadmin: 'Atlas Superadmin',
    atlas_admin: 'Atlas Admin',
    org_owner: 'Org Owner',
    org_admin: 'Org Admin',
    mcn_operator: 'MCN Operator',
    creator: 'Creator',
  }
  return map[role] || role
}

const entityTypeLabel = (t: string) => {
  if (t === 'organization') return 'Organization'
  if (t === 'mcn_partner') return 'MCN partner'
  if (t === 'channel') return 'Channel'
  return t
}

const orgOptionLabel = (o: Organization) => {
  return o.brand_name && o.name && o.brand_name !== o.name ? `${o.brand_name} — ${o.name}` : o.name || o.brand_name || o.id
}

const mcnOptionLabel = (m: MCN) => {
  const base = m.name || m.id
  return m.alias ? `${base} (${m.alias})` : base
}

const channelOptionLabel = (ch: YouTubeChannel) => {
  const yt = ch.channel_id || ''
  return yt ? `${ch.title} — ${yt}` : ch.title
}

const resetAddForm = () => {
  addFilterOrgId.value = ''
  addChannelMcnId.value = ''
  addSelectedId.value = ''
  pickerMcns.value = []
  pickerChannels.value = []
}

type Grantable = { id: string; label: string; detail?: string; organization_id?: string; mcn_id?: string }

const loadMcnsForPicker = async () => {
  if (!user.value) return
  pickerMcnsLoading.value = true
  formError.value = null
  try {
    const params: Record<string, string | number> = { target_user_id: user.value.user_id }
    if (addFilterOrgId.value) params.organization_id = addFilterOrgId.value
    const res = await get<{ items: Grantable[] }>('/api/v1/role-assignments/grantable-mcns', { params })
    const items = res.data?.items ?? []
    pickerMcns.value = items.map((i) => ({ id: i.id, name: i.label, alias: null, organization_id: i.organization_id || '' } as unknown as MCN))
    addSelectedId.value = ''
    addChannelMcnId.value = ''
    pickerChannels.value = []
  } catch {
    pickerMcns.value = []
    formError.value = 'Could not load grantable MCN list'
  } finally {
    pickerMcnsLoading.value = false
  }
}

const loadChannelsForPicker = async () => {
  if (!user.value) return
  if (!addChannelMcnId.value) {
    pickerChannels.value = []
    addSelectedId.value = ''
    return
  }
  pickerChannelsLoading.value = true
  formError.value = null
  try {
    const res = await get<{ items: Grantable[] }>('/api/v1/role-assignments/grantable-channels', {
      params: { target_user_id: user.value.user_id, mcn_id: addChannelMcnId.value },
    })
    const items = res.data?.items ?? []
    pickerChannels.value = items.map((i) => ({ id: i.id, title: i.label, channel_id: '', mcn_id: i.mcn_id || '' } as unknown as YouTubeChannel))
    addSelectedId.value = ''
  } catch {
    pickerChannels.value = []
    formError.value = 'Could not load grantable channels'
  } finally {
    pickerChannelsLoading.value = false
  }
}

const onAddEntityTypeChange = () => {
  addChannelMcnId.value = ''
  addSelectedId.value = ''
  pickerChannels.value = []
  const u = user.value
  if (u?.role === 'org_admin' && u.organization_id) {
    addFilterOrgId.value = u.organization_id
  } else if (
    u?.role === 'mcn_operator' &&
    u.organization_id &&
    (addEntityType.value === 'mcn_partner' || addEntityType.value === 'channel')
  ) {
    addFilterOrgId.value = u.organization_id
  } else {
    addFilterOrgId.value = ''
  }
  if (addEntityType.value === 'mcn_partner' || addEntityType.value === 'channel') {
    loadMcnsForPicker()
  }
}

const applyRoleDefaultsToAddForm = async () => {
  const u = user.value
  if (!u) return
  const allowed = allowedEntityTypes.value
  addEntityType.value = (allowed[0] ?? 'organization') as EntityKind
  resetAddForm()

  if (u.role === 'org_admin' && u.organization_id) {
    addFilterOrgId.value = u.organization_id
    await loadMcnsForPicker()
    return
  }
  if (u.role === 'mcn_operator') {
    addEntityType.value = 'mcn_partner'
    if (u.organization_id) {
      addFilterOrgId.value = u.organization_id
    }
    await loadMcnsForPicker()
    return
  }
  if (addEntityType.value === 'mcn_partner' || addEntityType.value === 'channel') {
    await loadMcnsForPicker()
  }
}

const loadUser = async () => {
  const userId = props.targetUserId
  if (!userId) return
  loadError.value = null
  user.value = null
  try {
    await fetchOrganizations({ page: 1, page_size: 100 })
  } catch {
    loadError.value = 'Could not load organizations'
    return
  }
  try {
    user.value = await fetchRoleAssignmentUser(userId)
    await applyRoleDefaultsToAddForm()
  } catch {
    loadError.value = error.value || 'Could not load this user'
  }
}

const canSubmitAdd = computed(() => {
  if (!user.value || !addSelectedId.value) return false
  return true
})

const submitAddAssignment = async () => {
  if (!user.value || !addSelectedId.value) return
  formError.value = null
  try {
    const updated = await upsertRoleAssignment({
      user_id: user.value.user_id,
      entity_type: addEntityType.value,
      entity_id: addSelectedId.value,
      status: 'active',
    })
    user.value = updated
    toastOk('Assignment added')
    addSelectedId.value = ''
    if (addEntityType.value === 'channel') {
      await loadChannelsForPicker()
    } else if (addEntityType.value === 'mcn_partner') {
      await loadMcnsForPicker()
    }
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to add assignment'
    toastErr(formError.value || 'Failed')
  }
}

const setAssignmentStatus = async (a: RoleAssignment, status: 'active' | 'inactive') => {
  if (!user.value) return
  formError.value = null
  try {
    const updated = await upsertRoleAssignment({
      user_id: user.value.user_id,
      entity_type: a.entity_type as EntityKind,
      entity_id: a.entity_id,
      status,
    })
    user.value = updated
    toastOk(status === 'inactive' ? 'Assignment removed' : 'Assignment restored')
  } catch (e: any) {
    formError.value = e?.response?.data?.detail || 'Failed to update assignment'
    toastErr(formError.value || 'Failed')
  }
}

watch(addFilterOrgId, () => {
  if (addEntityType.value === 'mcn_partner') {
    loadMcnsForPicker()
  }
})

watch(
  () => props.targetUserId,
  () => {
    if (canAccess.value && props.targetUserId) {
      loadUser()
    }
  }
)

onMounted(() => {
  if (canAccess.value && props.targetUserId) {
    loadUser()
  }
})
</script>
