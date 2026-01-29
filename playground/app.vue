<template>
  <div class="playground">
    <header class="playground-header">
      <h1>Halograph</h1>
      <p>Halftone effect playground</p>
    </header>

    <div class="playground-body">
      <section
        class="playground-preview"
        :style="{ backgroundColor }"
      >
        <ClientOnly>
          <HalographImage
            v-if="imageSrc"
            :src="imageSrc"
            :options="computedOptions"
            :output="output"
          >
            <template #loading>
              <span class="preview-placeholder">Loading…</span>
            </template>
            <template #error="{ error }">
              <span class="preview-error">{{ error?.message ?? 'Failed to load' }}</span>
            </template>
          </HalographImage>
          <div
            v-else
            class="preview-placeholder"
          >
            Pick an image
          </div>
        </ClientOnly>
      </section>

      <section class="playground-controls">
        <div class="control-group">
          <label>Image</label>
          <input
            type="file"
            accept="image/*"
            @change="onFilePick"
          >
        </div>

        <div class="control-group">
          <label>Color mode</label>
          <select v-model="options.colorMode">
            <option value="solid">
              solid
            </option>
            <option value="gradient2">
              2-color gradient
            </option>
            <option value="gradient3">
              3-color gradient
            </option>
          </select>
        </div>

        <div
          v-if="options.colorMode === 'solid'"
          class="control-group"
        >
          <label>Dot color</label>
          <input
            v-model="options.color"
            type="color"
            class="color-input"
          >
          <input
            v-model="options.color"
            type="text"
            class="color-text"
            placeholder="#000 or hsl(0,0%,0%)"
          >
        </div>

        <template v-if="options.colorMode === 'gradient2'">
          <div class="control-group">
            <label>Gradient color 1</label>
            <input
              v-model="gradientColor1"
              type="text"
              class="color-text"
              placeholder="#7C45D6"
            >
          </div>
          <div class="control-group">
            <label>Gradient color 2</label>
            <input
              v-model="gradientColor2"
              type="text"
              class="color-text"
              placeholder="#4C10AE"
            >
          </div>
        </template>

        <template v-if="options.colorMode === 'gradient3'">
          <div class="control-group">
            <label>Gradient color 1</label>
            <input
              v-model="gradientColor1"
              type="text"
              class="color-text"
              placeholder="#7C45D6"
            >
          </div>
          <div class="control-group">
            <label>Gradient color 2</label>
            <input
              v-model="gradientColor2"
              type="text"
              class="color-text"
              placeholder="#5E2AC2"
            >
          </div>
          <div class="control-group">
            <label>Gradient color 3</label>
            <input
              v-model="gradientColor3"
              type="text"
              class="color-text"
              placeholder="#4C10AE"
            >
          </div>
        </template>

        <div
          v-if="options.colorMode !== 'solid'"
          class="control-group"
        >
          <label>Gradient angle (°)</label>
          <input
            v-model.number="options.gradientAngle"
            type="range"
            min="0"
            max="360"
            step="1"
          >
          <span>{{ options.gradientAngle ?? 90 }}</span>
        </div>

        <div class="control-group">
          <label>Background</label>
          <input
            v-model="backgroundColor"
            type="color"
            class="color-input"
          >
          <span class="color-hex">{{ backgroundColor }}</span>
        </div>

        <div class="control-group">
          <label>Spacing</label>
          <input
            v-model.number="options.spacing"
            type="range"
            min="4"
            max="32"
            step="1"
          >
          <span>{{ options.spacing ?? 12 }}</span>
        </div>

        <div class="control-group">
          <label>Max width</label>
          <input
            v-model.number="options.maxWidth"
            type="range"
            min="0"
            max="1200"
            step="50"
          >
          <span>{{ options.maxWidth ?? 600 }}</span>
        </div>

        <div class="control-group">
          <label>Dot shape</label>
          <select v-model="options.dotType">
            <option value="circle">
              circle
            </option>
            <option value="square">
              square
            </option>
            <option value="triangle">
              triangle
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>Effect</label>
          <select v-model="options.effectType">
            <option value="scale">
              scale
            </option>
            <option value="opacity">
              opacity
            </option>
            <option value="both">
              both
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>
            <input
              v-model="options.smoothing"
              type="checkbox"
            >
            Smoothing (antialiasing)
          </label>
        </div>

        <div class="control-group">
          <label>
            <input
              v-model="options.trim"
              type="checkbox"
            >
            Trim (crop to figure)
          </label>
        </div>

        <div class="control-group">
          <label>
            <input
              v-model="options.hideMinDots"
              type="checkbox"
            >
            Hide min dots
          </label>
        </div>

        <div class="control-group">
          <label>Output</label>
          <select v-model="output">
            <option value="canvas">
              canvas
            </option>
            <option value="image">
              image
            </option>
          </select>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HalftoneOptions {
  color: string
  colorMode?: 'solid' | 'gradient2' | 'gradient3'
  gradientColors?: [string, string] | [string, string, string]
  gradientAngle?: number
  dotType: 'circle' | 'square' | 'triangle'
  effectType: 'scale' | 'opacity' | 'both'
  spacing?: number
  maxWidth?: number
  maxHeight?: number
  smoothing?: boolean
  trim?: boolean
  hideMinDots?: boolean
}

const imageSrc = ref('')
const backgroundColor = ref('#f5f5f5')
const output = ref<'canvas' | 'image'>('canvas')
const gradientColor1 = ref('#7C45D6')
const gradientColor2 = ref('#4C10AE')
const gradientColor3 = ref('#5E2AC2')

const options = ref<HalftoneOptions>({
  color: '#1a1a1a',
  colorMode: 'solid',
  gradientColors: ['#7C45D6', '#4C10AE'],
  gradientAngle: 90,
  dotType: 'circle',
  effectType: 'scale',
  spacing: 12,
  maxWidth: 600,
  smoothing: false,
  trim: false,
  hideMinDots: false,
})

const computedOptions = computed(() => {
  const opts = { ...options.value }
  if (opts.colorMode === 'gradient2') {
    opts.gradientColors = [gradientColor1.value, gradientColor2.value]
  }
  if (opts.colorMode === 'gradient3') {
    opts.gradientColors = [gradientColor1.value, gradientColor2.value, gradientColor3.value]
  }
  return opts
})

function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
  }
  imageSrc.value = URL.createObjectURL(file)
}
</script>

<style scoped>
.playground {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: system-ui, sans-serif;
}

.playground-header {
  margin-bottom: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.playground-header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.playground-header p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.playground-body {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  align-items: flex-start;
}

.playground-preview {
  flex: 1 1 0;
  min-width: 0;
  min-height: 280px;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playground-controls {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  flex-shrink: 0;
  width: 320px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.control-group label:has(input[type="checkbox"]) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group input[type="range"] {
  width: 100%;
}

.control-group input[type="color"] {
  width: 100%;
  height: 32px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.control-group select {
  padding: 0.4rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.color-hex,
.color-text {
  font-size: 0.75rem;
  color: #666;
}

.color-text {
  width: 100%;
  padding: 0.35rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.preview-placeholder,
.preview-error {
  color: #999;
  font-size: 0.95rem;
}

.preview-error {
  color: #c00;
}

:deep(.halograph-wrapper) {
  display: inline-block;
  max-width: 100%;
}

:deep(.halograph-canvas),
:deep(.halograph-img) {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
