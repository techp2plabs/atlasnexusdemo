<template>
  <div class="relative h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <DemoPrototypeBadge />
    <div class="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,9fr)_minmax(9rem,1fr)]">
      <div class="flex min-h-0 flex-col overflow-hidden">
        <div v-if="!activeItem" class="flex flex-1 items-center justify-center p-6 text-center" role="status">
          <div>
            <p class="text-sm font-medium text-gray-700">This demo page could not be found.</p>
            <NuxtLink :to="YOUTUBE_BRAND_CAMPAIGN_DEMO_ROUTE_BASE" class="mt-2 inline-block text-sm text-brand-600 hover:underline">
              Back to Overview
            </NuxtLink>
          </div>
        </div>
        <iframe
          v-else
          ref="demoFrame"
          :src="demoSrc"
          class="min-h-0 w-full flex-1 border-0"
          :title="`YouTube Brand Campaign demo — ${activeItem.label}`"
          @load="syncRouteFromDemo"
        />
      </div>

      <nav aria-label="Campaign prototype pages" class="min-h-0 overflow-y-auto border-t border-gray-200 bg-gray-50 p-2 md:border-l md:border-t-0 md:p-3">
        <template v-for="group in groups" :key="group.name">
          <h2 class="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 first:mt-1">{{ group.name }}</h2>
          <NuxtLink
            v-for="item in group.items"
            :key="item.slug"
            :to="routeForItem(item)"
            :aria-current="activeItem?.slug === item.slug ? 'page' : undefined"
            :title="item.label"
            class="mb-1 block rounded-md px-2 py-2 text-xs leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            :class="activeItem?.slug === item.slug ? 'bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-200' : 'text-gray-700 hover:bg-white hover:text-gray-950'"
          >
            <span class="line-clamp-2">{{ item.label }}</span>
          </NuxtLink>
        </template>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import DemoPrototypeBadge from '~/components/common/DemoPrototypeBadge.vue'
import {
  YOUTUBE_BRAND_CAMPAIGN_DEMO_BASE,
  YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS,
  YOUTUBE_BRAND_CAMPAIGN_DEMO_ROUTE_BASE,
  type YoutubeBrandCampaignDemoNavItem,
} from '~/utils/youtubeBrandCampaignDemoRoutes'

const route = useRoute()
const router = useRouter()
const demoFrame = ref<HTMLIFrameElement | null>(null)

const currentSlug = computed(() => Array.isArray(route.params.slug) ? route.params.slug.join('/') : '')
const activeItem = computed(() => YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS.find(item => item.slug === currentSlug.value))
const groups = computed(() => {
  const names = [...new Set(YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS.map(item => item.group))]
  return names.map(name => ({ name, items: YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS.filter(item => item.group === name) }))
})
const routeSuffix = computed(() => {
  const queryIndex = route.fullPath.indexOf('?')
  const hashIndex = route.fullPath.indexOf('#')
  const suffixIndex = [queryIndex, hashIndex].filter(index => index >= 0).sort((a, b) => a - b)[0]
  return suffixIndex === undefined ? '' : route.fullPath.slice(suffixIndex)
})
const demoSrc = computed(() => activeItem.value
  ? `${YOUTUBE_BRAND_CAMPAIGN_DEMO_BASE}/${activeItem.value.file}${routeSuffix.value}`
  : '')

function routeForItem(item: YoutubeBrandCampaignDemoNavItem) {
  return item.slug ? `${YOUTUBE_BRAND_CAMPAIGN_DEMO_ROUTE_BASE}/${item.slug}` : YOUTUBE_BRAND_CAMPAIGN_DEMO_ROUTE_BASE
}

function syncRouteFromDemo() {
  try {
    const frameUrl = new URL(demoFrame.value?.contentWindow?.location.href || '')
    const filename = frameUrl.pathname.split('/').pop()
    const item = YOUTUBE_BRAND_CAMPAIGN_DEMO_NAV_ITEMS.find(candidate => candidate.file === filename)
    if (!item) return
    const target = `${routeForItem(item)}${frameUrl.search}${frameUrl.hash}`
    if (target !== route.fullPath) router.replace(target)
  } catch {
    // Cross-origin documents cannot be inspected; static demo files are same-origin in this app.
  }
}
</script>
