<template>
  <div>
    <span>basic</span>
    <ClientOnly>
      <HalographImage
        :src="pixelUrl"
        :options="{
          color: '#000000',
          dotType: 'circle',
          effectType: 'scale',
        }"
        output="canvas"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const pixelUrl
  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
</script>
