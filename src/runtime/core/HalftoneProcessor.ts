import type { DotType, EffectType, HalftoneOptions } from '../types'
import { computeGridStep, sampleGridBrightness } from '../utils/canvas'
import { HalftoneRenderer } from './HalftoneRenderer'

/** Orchestrates grid sampling and halftone rendering from a source canvas */
export class HalftoneProcessor {
  /**
   * Renders halftone from a source canvas using current options.
   * @param sourceCanvas - Input canvas (e.g. from drawImageToCanvas)
   * @param options - Halftone options
   * @returns Canvas with halftone dots
   */
  static process(
    sourceCanvas: HTMLCanvasElement,
    options: HalftoneOptions,
  ): HTMLCanvasElement {
    const params = computeGridStep(sourceCanvas.width, sourceCanvas.height, options)
    const grid = sampleGridBrightness(sourceCanvas, params.stepX, params.stepY)
    const renderer = new HalftoneRenderer(options)

    return renderer.render(
      {
        data: grid,
        rows: grid.length,
        cols: grid[0]?.length ?? 0,
      },
      params,
    )
  }

  static processWithSmoothing(
    sourceCanvas: HTMLCanvasElement,
    options: HalftoneOptions,
  ): HTMLCanvasElement {
    const params = computeGridStep(sourceCanvas.width, sourceCanvas.height, options)
    const gridSuper = sampleGridBrightness(
      sourceCanvas,
      params.stepX / 2,
      params.stepY / 2,
    )
    const renderer = new HalftoneRenderer(options)

    const scaledCanvas = renderer.render(
      {
        data: gridSuper,
        rows: gridSuper.length,
        cols: gridSuper[0]?.length ?? 0,
      },
      params,
      2,
    )

    return this.downscaleWithSmoothing(
      scaledCanvas,
      Math.round(sourceCanvas.width),
      Math.round(sourceCanvas.height),
    )
  }

  private static downscaleWithSmoothing(
    source: HTMLCanvasElement,
    targetW: number,
    targetH: number,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Halograph: could not get 2d context')

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(source, 0, 0, source.width, source.height, 0, 0, targetW, targetH)
    return canvas
  }

  /**
   * Crops canvas to the bounding box of pixels with alpha above threshold.
   * @param canvas - Rendered canvas
   * @param threshold - Alpha threshold 0–1 (default 0.01)
   * @returns New canvas containing only the visible region
   */
  static trimTransparent(
    canvas: HTMLCanvasElement,
    threshold: number = 0.01,
  ): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas

    const bounds = this.findVisibleBounds(canvas, threshold)
    return this.cropCanvas(canvas, bounds.x, bounds.y, bounds.width, bounds.height)
  }

  private static findVisibleBounds(
    canvas: HTMLCanvasElement,
    threshold: number,
  ): { x: number, y: number, width: number, height: number } {
    const ctx = canvas.getContext('2d')
    if (!ctx) return { x: 0, y: 0, width: canvas.width, height: canvas.height }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let minRow = canvas.height
    let maxRow = -1
    let minCol = canvas.width
    let maxCol = -1

    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i]!
      if (alpha > threshold * 255) {
        const pixelIndex = Math.floor(i / 4)
        const row = Math.floor(pixelIndex / canvas.width)
        const col = pixelIndex % canvas.width

        minRow = Math.min(minRow, row)
        maxRow = Math.max(maxRow, row)
        minCol = Math.min(minCol, col)
        maxCol = Math.max(maxCol, col)
      }
    }

    if (maxRow === -1) {
      return { x: 0, y: 0, width: canvas.width, height: canvas.height }
    }

    return {
      x: minCol,
      y: minRow,
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
    }
  }

  private static cropCanvas(
    source: HTMLCanvasElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Halograph: could not get 2d context')

    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh)
    return canvas
  }
}

/**
 * Computes dot radius from brightness and effect type (scale / opacity / both).
 * @param brightness - Sample brightness 0–1
 * @param halfStep - Half of grid step
 * @param effectType - Effect type
 * @returns Radius in pixels
 */
export function dotRadiusFromBrightness(
  brightness: number,
  halfStep: number,
  effectType: EffectType,
): number {
  if (effectType === 'opacity') return halfStep * 0.5
  const t = Math.max(0, Math.min(1, brightness))
  return halfStep * (0.2 + 0.8 * t)
}

/**
 * Computes globalAlpha from brightness and effect type (scale / opacity / both).
 * @param brightness - Sample brightness 0–1
 * @param effectType - Effect type
 * @returns Alpha 0–1
 */
export function alphaFromBrightness(brightness: number, effectType: EffectType): number {
  if (effectType === 'scale') return 1
  const t = Math.max(0, Math.min(1, brightness))
  return 0.2 + 0.8 * t
}

/**
 * Draws a single halftone dot (circle, square, or triangle). Caller must set fillStyle and globalAlpha.
 * @param ctx - 2D context
 * @param cx - Center X
 * @param cy - Center Y
 * @param radius - Dot radius
 * @param dotType - Shape of the dot
 */
export function drawDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  dotType: DotType,
): void {
  ctx.beginPath()
  if (dotType === 'circle') {
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (dotType === 'square') {
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    return
  }
  if (dotType === 'triangle') {
    const h = radius * 1.5
    ctx.moveTo(cx, cy - h)
    ctx.lineTo(cx + radius, cy + h * 0.6)
    ctx.lineTo(cx - radius, cy + h * 0.6)
    ctx.closePath()
    ctx.fill()
  }
}
