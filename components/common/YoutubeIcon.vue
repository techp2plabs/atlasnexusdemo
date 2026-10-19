<template>
  <img :src="src" :alt="alt" class="inline-block object-contain" />
</template>

<script setup lang="ts">
// Official YouTube icon per Brand Resource Center — only Red/White or Black/White
// variants are approved. Do not recolor, restyle, or replace with a generic icon glyph.
type Variant = 'red' | 'black' | 'white'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    alt?: string
  }>(),
  {
    variant: 'red',
    alt: 'YouTube',
  }
)

const sources: Record<Variant, string> = {
  red: '/images/yt_icon_red_digital.png',
  black: '/images/yt_icon_almostblack_digital.png',
  white: '/images/yt_icon_white_digital.png',
}

const src = computed(() => sources[props.variant])
</script>
