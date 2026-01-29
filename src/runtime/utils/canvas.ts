import type { HalftoneOptions, GridSamplingParams } from '../types'
import { brightnessFromRgba } from './color'

export class CanvasManager {
  static drawImageToCanvas(
    img: HTMLImageElement,
    maxWidth?: number,
    maxHeight?: number,
  ): HTMLCanvasElement {
    let width = img.naturalWidth
    let height = img.naturalHeight

    if (maxWidth !== undefined && width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    if (maxHeight !== undefined && height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width)
    canvas.height = Math.round(height)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Halograph: could not get 2d context')
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  }

  static sampleGridBrightness(
    canvas: HTMLCanvasElement,
    stepX: number,
    stepY: number,
  ): number[][] {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Halograph: could not get 2d context')
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return this.sampleGridBrightnessFromData(
      imageData.data,
      canvas.width,
      canvas.height,
      stepX,
      stepY,
    )
  }

  static sampleGridBrightnessFromData(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    stepX: number,
    stepY: number,
  ): number[][] {
    const grid: number[][] = []

    for (let gy = 0; gy < height; gy += stepY) {
      const row: number[] = []

      for (let gx = 0; gx < width; gx += stepX) {
        const px = Math.min(gx, width - 1)
        const py = Math.min(gy, height - 1)
        const i = (py * width + px) * 4

        const brightness = brightnessFromRgba(
          data[i]!,
          data[i + 1]!,
          data[i + 2]!,
          data[i + 3]!,
        )

        row.push(brightness)
      }

      grid.push(row)
    }

    return grid
  }
}

export class GridStepCalculator {
  private static readonly AUTO_COLUMNS = 80
  private static readonly MIN_STEP = 4

  static compute(
    width: number,
    height: number,
    options: HalftoneOptions,
  ): GridSamplingParams {
    if (options.spacing !== undefined) {
      return { stepX: options.spacing, stepY: options.spacing }
    }

    const maxDim = Math.max(width, height)
    const autoStep = Math.max(this.MIN_STEP, Math.floor(maxDim / this.AUTO_COLUMNS))

    return {
      stepX: autoStep * 1.5,
      stepY: autoStep * 1.5,
    }
  }
}

/**
 * Draws an image to a new canvas, optionally scaling down to fit max dimensions.
 * @param img - Loaded image element
 * @param maxWidth - Optional max width (aspect ratio preserved)
 * @param maxHeight - Optional max height (aspect ratio preserved)
 * @returns New canvas with the image drawn
 */
export function drawImageToCanvas(
  img: HTMLImageElement,
  maxWidth?: number,
  maxHeight?: number,
): HTMLCanvasElement {
  return CanvasManager.drawImageToCanvas(img, maxWidth, maxHeight)
}

/**
 * Samples brightness from RGBA pixel data on a grid (stepX, stepY).
 * @param data - Image data rgba array
 * @param width - Image width
 * @param height - Image height
 * @param stepX - Horizontal step
 * @param stepY - Vertical step
 * @returns 2D grid of brightness values 0–1
 */
export function sampleGridBrightnessFromData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  stepX: number,
  stepY: number,
): number[][] {
  return CanvasManager.sampleGridBrightnessFromData(data, width, height, stepX, stepY)
}

/**
 * Samples brightness from a canvas on a grid.
 * @param canvas - Source canvas
 * @param stepX - Horizontal step
 * @param stepY - Vertical step
 * @returns 2D grid of brightness values 0–1
 */
export function sampleGridBrightness(
  canvas: HTMLCanvasElement,
  stepX: number,
  stepY: number,
): number[][] {
  return CanvasManager.sampleGridBrightness(canvas, stepX, stepY)
}

/**
 * Computes grid step (stepX, stepY) from image size and options; uses spacing if set, else auto.
 * @param width - Image width
 * @param height - Image height
 * @param options - Halftone options (spacing optional)
 * @returns Grid sampling params
 */
export function computeGridStep(
  width: number,
  height: number,
  options: HalftoneOptions,
): GridSamplingParams {
  return GridStepCalculator.compute(width, height, options)
}
