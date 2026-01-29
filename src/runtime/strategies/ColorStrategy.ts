import type { ColorMode } from '../types'

interface Gradient2Options {
  readonly mode: 'gradient2'
  readonly colors: readonly [string, string]
  readonly angle: number
}

interface Gradient3Options {
  readonly mode: 'gradient3'
  readonly colors: readonly [string, string, string]
  readonly angle: number
}

/** Returns a fill style (solid color or gradient) for the halftone canvas */
export interface ColorStrategyHandler {
  getCanvasGradient(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): string | CanvasGradient
}

export class SolidColorHandler implements ColorStrategyHandler {
  constructor(private readonly color: string) {}

  getCanvasGradient(): string {
    return this.color
  }
}

export class Gradient2Handler implements ColorStrategyHandler {
  private readonly angle: number
  private readonly colors: readonly [string, string]

  constructor(options: Gradient2Options) {
    this.angle = options.angle
    this.colors = options.colors
  }

  getCanvasGradient(ctx: CanvasRenderingContext2D, width: number, height: number): CanvasGradient {
    return this.createLinearGradient(ctx, width, height, this.colors)
  }

  private createLinearGradient(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: readonly string[],
  ): CanvasGradient {
    const angleRad = (this.angle * Math.PI) / 180
    const centerX = width / 2
    const centerY = height / 2
    const diagonal = Math.sqrt(width * width + height * height)
    const dist = diagonal / 2
    const x1 = centerX - dist * Math.cos(angleRad)
    const y1 = centerY - dist * Math.sin(angleRad)
    const x2 = centerX + dist * Math.cos(angleRad)
    const y2 = centerY + dist * Math.sin(angleRad)

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color)
    })
    return gradient
  }
}

export class Gradient3Handler extends Gradient2Handler {
  constructor(options: Gradient3Options) {
    super({
      mode: 'gradient2',
      colors: [options.colors[0], options.colors[1]],
      angle: options.angle,
    })
  }
}

/** Creates a color handler from color mode and options */
export class ColorStrategyFactory {
  static create(
    options: {
      color?: string
      colorMode?: ColorMode
      gradientColors?: [string, string] | [string, string, string]
      gradientAngle?: number
    },
  ): ColorStrategyHandler {
    const colorMode = options.colorMode ?? 'solid'
    const angle = options.gradientAngle ?? 90

    switch (colorMode) {
      case 'solid':
        return new SolidColorHandler(options.color ?? '#000000')

      case 'gradient2':
        if (!options.gradientColors || options.gradientColors.length < 2) {
          return new Gradient2Handler({
            mode: 'gradient2',
            colors: ['#7C45D6', '#4C10AE'],
            angle,
          })
        }
        return new Gradient2Handler({
          mode: 'gradient2',
          colors: [options.gradientColors[0], options.gradientColors[1]],
          angle,
        })

      case 'gradient3':
        if (!options.gradientColors || options.gradientColors.length < 3) {
          return new Gradient3Handler({
            mode: 'gradient3',
            colors: ['#7C45D6', '#4C10AE', '#5E2AC2'],
            angle,
          })
        }
        return new Gradient3Handler({
          mode: 'gradient3',
          colors: [
            options.gradientColors[0]!,
            options.gradientColors[1]!,
            options.gradientColors[2]!,
          ],
          angle,
        })

      default: {
        const exhaustive: never = colorMode
        throw new Error(`Unknown color mode: ${exhaustive}`)
      }
    }
  }
}
