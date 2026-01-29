<template>
  <div class="halograph-wrapper">
    <template v-if="error">
      <slot
        name="error"
        :error="error"
      >
        <span class="halograph-error">Failed to load image</span>
      </slot>
    </template>

    <template v-else-if="isLoading">
      <slot name="loading">
        <span class="halograph-loading">Loading…</span>
      </slot>
    </template>

    <template v-else-if="result">
      <canvas
        v-if="output === 'canvas'"
        ref="canvasRef"
        :width="result.canvas.width"
        :height="result.canvas.height"
        class="halograph-canvas"
      />

      <img
        v-else
        :src="result.dataUrl ?? undefined"
        :width="result.canvas.width"
        :height="result.canvas.height"
        class="halograph-img"
        alt="Halftone image"
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import { toRef, watch, onMounted, onUpdated, ref } from 'vue'
import { useHalograph } from '../composables/useHalograph'
import type { HalftoneOptions } from '../../types'

/** @param src - Image URL to render as halftone
 *  @param options - Halftone options
 *  @param output - 'canvas' (default) or 'image' (PNG data URL)
 */
const props = withDefaults(
  defineProps<{
    src: string
    options: HalftoneOptions
    output?: 'canvas' | 'image'
  }>(),
  { output: 'canvas' },
)

const srcRef = toRef(() => props.src)
const optionsRef = toRef(() => props.options)

const { result, error, isLoading } = useHalograph(srcRef, optionsRef)
const canvasRef = ref<HTMLCanvasElement | null>(null)

function renderCanvasToElement() {
  if (props.output !== 'canvas' || !result.value || !canvasRef.value) return

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  ctx.drawImage(
    result.value.canvas,
    0,
    0,
    result.value.canvas.width,
    result.value.canvas.height,
  )
}

watch(
  () => [result.value, props.output] as const,
  () => renderCanvasToElement(),
  { immediate: true, flush: 'post' },
)

onMounted(() => renderCanvasToElement())
onUpdated(() => renderCanvasToElement())
</script>

<style scoped>
.halograph-wrapper {
  display: contents;
}

.halograph-canvas,
.halograph-img {
  display: block;
  max-width: 100%;
  height: auto;
}

.halograph-loading,
.halograph-error {
  display: block;
  padding: 1rem;
  text-align: center;
}

.halograph-error {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 0.25rem;
}
</style>
