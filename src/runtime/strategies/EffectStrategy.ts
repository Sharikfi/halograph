import type { EffectType } from '../types'

/** Maps brightness to dot radius and alpha (scale / opacity / both) */
export interface EffectStrategy {
  getDotRadius(brightness: number, halfStep: number): number
  getAlpha(brightness: number): number
}

/** Brightness drives dot size; alpha is always 1 */
export class ScaleEffectStrategy implements EffectStrategy {
  getDotRadius(brightness: number, halfStep: number): number {
    const t = Math.max(0, Math.min(1, brightness))
    return halfStep * (0.2 + 0.8 * t)
  }

  getAlpha(): number {
    return 1
  }
}

/** Fixed dot size; brightness drives alpha */
export class OpacityEffectStrategy implements EffectStrategy {
  getDotRadius(_brightness: number, halfStep: number): number {
    return halfStep * 0.5
  }

  getAlpha(brightness: number): number {
    const t = Math.max(0, Math.min(1, brightness))
    return 0.2 + 0.8 * t
  }
}

/** Brightness drives both dot size and alpha */
export class BothEffectStrategy implements EffectStrategy {
  getDotRadius(brightness: number, halfStep: number): number {
    const t = Math.max(0, Math.min(1, brightness))
    return halfStep * (0.2 + 0.8 * t)
  }

  getAlpha(brightness: number): number {
    const t = Math.max(0, Math.min(1, brightness))
    return 0.2 + 0.8 * t
  }
}

/** Creates an effect strategy by effect type */
export class EffectStrategyFactory {
  private static readonly strategies = new Map<EffectType, EffectStrategy>([
    ['scale', new ScaleEffectStrategy()],
    ['opacity', new OpacityEffectStrategy()],
    ['both', new BothEffectStrategy()],
  ])

  static create(effectType: EffectType): EffectStrategy {
    const strategy = this.strategies.get(effectType)
    if (!strategy) {
      throw new Error(`Unknown effect type: ${effectType}`)
    }
    return strategy
  }
}
