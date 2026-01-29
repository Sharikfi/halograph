import type { HalftoneOptions } from '../types'
import { drawImageToCanvas, computeGridStep, sampleGridBrightness } from './canvas'
import { HalftoneProcessor } from '../core/HalftoneProcessor'

class GridWorkerManager {
  private static readonly PIXEL_THRESHOLD = 512 * 512

  static isLargeImage(width: number, height: number): boolean {
    return width * height > this.PIXEL_THRESHOLD
  }

  static async processWithWorker(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    stepX: number,
    stepY: number,
  ): Promise<number[][]> {
    const workerCode = this.generateWorkerCode()
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)
    URL.revokeObjectURL(url)

    return new Promise((resolve, reject) => {
      const onMessage = (e: MessageEvent<number[][]>) => {
        worker.terminate()
        resolve(e.data)
      }

      const onError = () => {
        worker.terminate()
        reject(new Error('Halograph: worker failed'))
      }

      worker.onmessage = onMessage
      worker.onerror = onError

      worker.postMessage({ data, width, height, stepX, stepY }, [data.buffer])
    })
  }

  private static generateWorkerCode(): string {
    return `
      function calculateBrightness(r, g, b, a) {
        return (0.299 * r / 255 + 0.587 * g / 255 + 0.114 * b / 255) * (a / 255)
      }
      
      self.onmessage = function(event) {
        const { data, width, height, stepX, stepY } = event.data
        const grid = []
        
        for (let gy = 0; gy < height; gy += stepY) {
          const row = []
          for (let gx = 0; gx < width; gx += stepX) {
            const px = Math.min(gx, width - 1)
            const py = Math.min(gy, height - 1)
            const i = (py * width + px) * 4
            const brightness = calculateBrightness(data[i], data[i + 1], data[i + 2], data[i + 3])
            row.push(brightness)
          }
          grid.push(row)
        }
        
        self.postMessage(grid)
      }
    `
  }
}

/**
 * Renders a halftone canvas synchronously from a loaded image.
 * @param img - Loaded image element
 * @param options - Halftone options
 * @returns Canvas with halftone dots
 */
export function createHalftoneCanvas(
  img: HTMLImageElement,
  options: HalftoneOptions,
): HTMLCanvasElement {
  const sourceCanvas = drawImageToCanvas(img, options.maxWidth, options.maxHeight)
  return HalftoneProcessor.process(sourceCanvas, options)
}

/**
 * Renders a halftone canvas asynchronously; uses a Web Worker for large images (>512×512).
 * @param img - Loaded image element
 * @param options - Halftone options
 * @returns Promise resolving to canvas with halftone dots
 */
export async function createHalftoneCanvasAsync(
  img: HTMLImageElement,
  options: HalftoneOptions,
): Promise<HTMLCanvasElement> {
  const sourceCanvas = drawImageToCanvas(img, options.maxWidth, options.maxHeight)
  const width = sourceCanvas.width
  const height = sourceCanvas.height

  if (typeof document === 'undefined') {
    return HalftoneProcessor.process(sourceCanvas, options)
  }

  const { stepX, stepY } = computeGridStep(width, height, options)

  let grid: number[][]

  if (GridWorkerManager.isLargeImage(width, height)) {
    const ctx = sourceCanvas.getContext('2d')
    if (!ctx) {
      throw new Error('Halograph: could not get 2d context')
    }

    const imageData = ctx.getImageData(0, 0, width, height)
    const dataCopy = new Uint8ClampedArray(imageData.data)
    grid = await GridWorkerManager.processWithWorker(dataCopy, width, height, stepX, stepY)
  }
  else {
    grid = sampleGridBrightness(sourceCanvas, stepX, stepY)
  }

  const renderer = new (await import('../core/HalftoneRenderer')).HalftoneRenderer(options)
  let canvas = renderer.render(
    {
      data: grid,
      rows: grid.length,
      cols: grid[0]?.length ?? 0,
    },
    { stepX, stepY },
  )

  if (options.trim) {
    canvas = HalftoneProcessor.trimToContent(canvas, grid, stepX, stepY)
  }

  return canvas
}
