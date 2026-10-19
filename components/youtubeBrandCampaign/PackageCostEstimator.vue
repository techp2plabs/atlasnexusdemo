<template>
  <div class="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Shorts (max {{ maxShorts }})</label>
        <input
          :value="qty.shorts"
          type="number"
          min="0"
          :max="maxShorts"
          class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          @input="setShorts(($event.target as HTMLInputElement).valueAsNumber)"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Longform (max {{ maxLongform }})</label>
        <input
          :value="qty.longform"
          type="number"
          min="0"
          :max="maxLongform"
          class="h-9 w-full rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          @input="setLongform(($event.target as HTMLInputElement).valueAsNumber)"
        />
      </div>
    </div>

    <div class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="preset in presets"
        :key="preset.label"
        type="button"
        class="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-brand-300 hover:text-brand-700 dark:border-gray-700 dark:text-gray-300"
        @click="applyPreset(preset)"
      >
        {{ preset.label }}
      </button>
    </div>

    <div v-if="showEstimate && !missingSelectedRate" class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        Original estimate: {{ qty.shorts }} Shorts × {{ formatCurrency(shortsRateMid, currency) }} + {{ qty.longform }} Longform × {{ formatCurrency(longformRateMid, currency) }}
      </span>
      <span class="text-sm font-semibold text-gray-800 dark:text-white/90">{{ formatCurrency(total, currency) }}</span>
    </div>
    <p v-else class="mt-3 border-t border-gray-100 pt-2 text-xs text-amber-700 dark:border-gray-800">{{ !showEstimate ? 'Rate currency unverified; estimate unavailable.' : 'A selected video format has no rate. Add its rate or set its quantity to zero.' }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatCurrency } from '~/utils/youtubeBrandCampaignFormat'
import type { CreatorRateCard } from '~/mocks/fixtures/creators'

interface PackageQty {
  shorts: number
  longform: number
}

interface Props {
  rateCard: CreatorRateCard
  currency?: string
  showEstimate?: boolean
  shortsAvailable?: boolean
  longformAvailable?: boolean
  modelValue?: PackageQty
  maxShorts?: number
  maxLongform?: number
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'IDR',
  showEstimate: true,
  shortsAvailable: true,
  longformAvailable: true,
  modelValue: () => ({ shorts: 0, longform: 0 }),
  maxShorts: 12,
  maxLongform: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: PackageQty]
  'update:cost': [value: number]
}>()

const qty = ref<PackageQty>({ ...props.modelValue })
const missingSelectedRate = computed(() => (qty.value.shorts > 0 && !props.shortsAvailable) || (qty.value.longform > 0 && !props.longformAvailable))
watch(
  () => props.modelValue,
  (v) => {
    qty.value = { ...v }
  },
)

const shortsRateMid = computed(() => Math.round((props.rateCard.shorts_min + props.rateCard.shorts_max) / 2))
const longformRateMid = computed(() => Math.round((props.rateCard.longform_min + props.rateCard.longform_max) / 2))
const total = computed(() => qty.value.shorts * shortsRateMid.value + qty.value.longform * longformRateMid.value)

watch(total, (t) => emit('update:cost', t), { immediate: true })

function commit() {
  emit('update:modelValue', { ...qty.value })
}

function setShorts(v: number) {
  qty.value.shorts = Number.isFinite(v) ? Math.max(0, Math.min(props.maxShorts, v)) : 0
  commit()
}

function setLongform(v: number) {
  qty.value.longform = Number.isFinite(v) ? Math.max(0, Math.min(props.maxLongform, v)) : 0
  commit()
}

const presets = [
  { label: '3 Shorts', shorts: 3, longform: 0 },
  { label: '3 Shorts + 1 Longform', shorts: 3, longform: 1 },
  { label: '5 Shorts + 1 Longform', shorts: 5, longform: 1 },
  { label: 'Clear', shorts: 0, longform: 0 },
]

function applyPreset(preset: { shorts: number; longform: number }) {
  qty.value = { shorts: Math.min(preset.shorts, props.maxShorts), longform: Math.min(preset.longform, props.maxLongform) }
  commit()
}
</script>
