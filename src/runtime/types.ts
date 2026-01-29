/** Dot shape in the halftone grid */
export type DotType = 'circle' | 'square' | 'triangle'

/** How brightness is encoded: dot size, opacity, or both */
export type EffectType = 'scale' | 'opacity' | 'both'

/** Coloring mode: solid, 2-color gradient, or 3-color gradient */
export type ColorMode = 'solid' | 'gradient2' | 'gradient3'

export interface Gradient2Options {
  readonly mode: 'gradient2'
  readonly colors: readonly [string, string]
  readonly angle: number
}

export interface Gradient3Options {
  readonly mode: 'gradient3'
  readonly colors: readonly [string, string, string]
  readonly angle: number
}

export interface SolidColorOptions {
  readonly mode: 'solid'
  readonly color: string
}

export type ColorStrategy = SolidColorOptions | Gradient2Options | Gradient3Options

export interface PerformanceOptions {
  readonly maxWidth?: number
  readonly maxHeight?: number
  readonly smoothing?: boolean
}

export interface ProcessingOptions {
  readonly spacing?: number
  readonly trim?: boolean
}

/** Halftone effect options (dot shape, effect type, color, performance, etc.) */
export interface HalftoneOptions {
  readonly dotType: DotType
  readonly effectType: EffectType
  readonly color?: string
  readonly colorMode?: ColorMode
  readonly gradientColors?: [string, string] | [string, string, string]
  readonly gradientAngle?: number
  readonly spacing?: number
  readonly maxWidth?: number
  readonly maxHeight?: number
  readonly smoothing?: boolean
  readonly trim?: boolean
}

/** Result of halftone rendering: canvas and optional PNG data URL */
export interface HalftoneResult {
  readonly canvas: HTMLCanvasElement
  readonly dataUrl: string | null
}

/** Brightness grid: rows × cols of values in [0, 1] */
export interface BrightnessGrid {
  readonly data: ReadonlyArray<ReadonlyArray<number>>
  readonly rows: number
  readonly cols: number
}

/** Grid step used for sampling (stepX, stepY in pixels) */
export interface GridSamplingParams {
  readonly stepX: number
  readonly stepY: number
}

export interface RenderMetadata {
  readonly originalWidth: number
  readonly originalHeight: number
  readonly scaleFactor: number
  readonly renderedWidth: number
  readonly renderedHeight: number
}
