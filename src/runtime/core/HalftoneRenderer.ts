import type { HalftoneOptions, BrightnessGrid, GridSamplingParams } from '../types'
import type { EffectStrategy } from '../strategies/EffectStrategy'
import type { DotStrategy } from '../strategies/DotStrategy'
import type { ColorStrategyHandler } from '../strategies/ColorStrategy'
import { EffectStrategyFactory } from '../strategies/EffectStrategy'
import { DotStrategyFactory } from '../strategies/DotStrategy'
import { ColorStrategyFactory } from '../strategies/ColorStrategy'

/** Renders a brightness grid to a halftone canvas using effect, dot, and color strategies */
export class HalftoneRenderer {
  private readonly effectStrategy: EffectStrategy
  private readonly dotStrategy: DotStrategy
  private readonly colorHandler: ColorStrategyHandler

  /** @param options - Halftone options used to build strategies */
  constructor(options: HalftoneOptions) {
    this.effectStrategy = EffectStrategyFactory.create(options.effectType)
    this.dotStrategy = DotStrategyFactory.create(options.dotType)
    this.colorHandler = ColorStrategyFactory.create({
      color: options.color,
      colorMode: options.colorMode,
      gradientColors: options.gradientColors,
      gradientAngle: options.gradientAngle,
    })
  }

  /**
   * Renders the brightness grid to a new canvas.
   * @param grid - Brightness grid (rows × cols)
   * @param params - Grid step (stepX, stepY)
   * @param scale - Supersample scale (default 1)
   * @returns New canvas with halftone dots
   */
  render(
    grid: BrightnessGrid,
    params: GridSamplingParams,
    scale: number = 1,
  ): HTMLCanvasElement {
    const width = grid.cols * params.stepX * scale
    const height = grid.rows * params.stepY * scale
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width)
    canvas.height = Math.round(height)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Halograph: could not get 2d context')
    }

    const fillStyle = this.colorHandler.getCanvasGradient(ctx, canvas.width, canvas.height)
    ctx.fillStyle = fillStyle
    const halfStep = (params.stepX * scale) / 2

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const brightness = grid.data[row]?.[col] ?? 0
        const x = (col + 0.5) * params.stepX * scale
        const y = (row + 0.5) * params.stepY * scale

        ctx.globalAlpha = this.effectStrategy.getAlpha(brightness)
        const radius = this.effectStrategy.getDotRadius(brightness, halfStep)

        this.dotStrategy.draw(ctx, x, y, radius)
      }
    }

    ctx.globalAlpha = 1

    return canvas
  }
}
