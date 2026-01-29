import {
  type Ref,
  ref,
  watch,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import { useRuntimeConfig } from '#imports'
import type { HalftoneOptions, HalftoneResult } from '../../types'
import { ImageLoader } from '../../utils/image'
import { createHalftoneCanvasAsync } from '../../utils/halftone'

class HalftoneProcessor {
  static async process(
    url: string,
    options: HalftoneOptions,
  ): Promise<HalftoneResult> {
    const img = await ImageLoader.load(url, { crossOrigin: 'anonymous' })
    const canvas = await createHalftoneCanvasAsync(img, options)
    const dataUrl = canvas.toDataURL('image/png')

    return { canvas, dataUrl }
  }
}

class ProxyUrlResolver {
  static resolve(url: string, useProxy: boolean): string {
    if (!useProxy) return url

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `/api/_halograph/proxy?url=${encodeURIComponent(url)}`
    }

    return url
  }
}

/**
 * Composable that loads an image and renders it as halftone; reacts to src and options changes.
 * @param src - Image URL (ref or getter)
 * @param options - Halftone options (ref or getter)
 * @returns { result, error, isLoading, toDataURL }
 */
export function useHalograph<T extends HalftoneOptions = HalftoneOptions>(
  src: MaybeRefOrGetter<string>,
  options: MaybeRefOrGetter<T>,
): {
  result: Ref<HalftoneResult | null>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  toDataURL: (type?: string) => string | null
} {
  const result = ref<HalftoneResult | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref<boolean>(true)

  async function process() {
    let url = toValue(src)
    const opts = toValue(options)
    const config = useRuntimeConfig()

    const useProxy = config.public.halograph?.useProxy ?? false
    url = ProxyUrlResolver.resolve(url, useProxy)

    if (!url) {
      result.value = null
      error.value = null
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const processedResult = await HalftoneProcessor.process(url, opts)
      result.value = processedResult
      error.value = null
    } catch (err) {
      result.value = null
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => [toValue(src), toValue(options)] as const,
    process,
    { immediate: true, deep: true },
  )

  function toDataURL(type = 'image/png'): string | null {
    return result.value?.canvas.toDataURL(type) ?? null
  }

  return { result, error, isLoading, toDataURL }
}
