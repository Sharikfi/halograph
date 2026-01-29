import type { DotType } from '../types'

/** Draws a single dot shape (caller sets fillStyle and globalAlpha) */
export interface DotStrategy {
  draw(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
  ): void
}

export class CircleDotStrategy implements DotStrategy {
  draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

export class SquareDotStrategy implements DotStrategy {
  draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  }
}

export class TriangleDotStrategy implements DotStrategy {
  draw(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    const h = radius * Math.sqrt(3)
    ctx.beginPath()
    ctx.moveTo(cx, cy - h / 2)
    ctx.lineTo(cx + radius, cy + h / 4)
    ctx.lineTo(cx - radius, cy + h / 4)
    ctx.closePath()
    ctx.fill()
  }
}

/** Creates a dot strategy by dot type */
export class DotStrategyFactory {
  private static readonly strategies = new Map<DotType, DotStrategy>([
    ['circle', new CircleDotStrategy()],
    ['square', new SquareDotStrategy()],
    ['triangle', new TriangleDotStrategy()],
  ])

  static create(dotType: DotType): DotStrategy {
    const strategy = this.strategies.get(dotType)
    if (!strategy) {
      throw new Error(`Unknown dot type: ${dotType}`)
    }
    return strategy
  }
}
