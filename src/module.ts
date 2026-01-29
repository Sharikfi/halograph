import {
  defineNuxtModule,
  addPlugin,
  addComponent,
  addImportsDir,
  addTypeTemplate,
  addServerHandler,
  createResolver,
} from '@nuxt/kit'
import { defu } from 'defu'
import type { HalftoneOptions } from './runtime/types'

export interface ModuleOptions {
  color?: string
  colorMode?: HalftoneOptions['colorMode']
  gradientColors?: HalftoneOptions['gradientColors']
  gradientAngle?: number
  dotType?: HalftoneOptions['dotType']
  effectType?: HalftoneOptions['effectType']
  useProxy?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'halograph',
    configKey: 'halograph',
    compatibility: { nuxt: '>=4.0.0' },
  },
  defaults: {
    color: '#000000',
    colorMode: 'solid',
    gradientColors: undefined,
    gradientAngle: 90,
    dotType: 'circle',
    effectType: 'scale',
    useProxy: false,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    const merged = defu(
      nuxt.options.runtimeConfig.public.halograph as ModuleOptions | undefined,
      {
        color: options.color,
        colorMode: options.colorMode,
        gradientColors: options.gradientColors,
        gradientAngle: options.gradientAngle,
        dotType: options.dotType,
        effectType: options.effectType,
        useProxy: options.useProxy,
      },
    )
    ;(nuxt.options.runtimeConfig.public as { halograph?: ModuleOptions }).halograph = {
      color: merged.color ?? undefined,
      colorMode: merged.colorMode ?? undefined,
      gradientColors: merged.gradientColors as ModuleOptions['gradientColors'],
      gradientAngle: merged.gradientAngle ?? undefined,
      dotType: merged.dotType ?? undefined,
      effectType: merged.effectType ?? undefined,
      useProxy: merged.useProxy ?? undefined,
    }

    addComponent({
      name: 'HalographImage',
      filePath: resolver.resolve('./runtime/app/components/HalographImage.vue'),
    })

    addImportsDir(resolver.resolve('./runtime/app/composables'))

    addServerHandler({
      route: '/api/_halograph/proxy',
      handler: resolver.resolve('./runtime/server/api/_halograph/proxy.get'),
    })

    addTypeTemplate({
      filename: 'types/halograph.d.ts',
      getContents: () => `
declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    halograph?: {
      color?: string
      colorMode?: 'solid' | 'gradient2' | 'gradient3'
      gradientColors?: [string, string] | [string, string, string]
      gradientAngle?: number
      dotType?: 'circle' | 'square' | 'triangle'
      effectType?: 'scale' | 'opacity' | 'both'
      useProxy?: boolean
    }
  }
}

export interface HalftoneOptions {
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
}

export interface HalftoneResult {
  canvas: HTMLCanvasElement
  dataUrl: string | null
}

export type DotType = 'circle' | 'square' | 'triangle'
export type EffectType = 'scale' | 'opacity' | 'both'
`,
    })

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
