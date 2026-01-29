import { describe, it, expect } from 'vitest'
import {
  dotRadiusFromBrightness,
  alphaFromBrightness,
  drawDot,
} from '../../src/runtime/core/HalftoneProcessor'
import { createHalftoneCanvas } from '../../src/runtime/utils/halftone'

describe('dotRadiusFromBrightness', () => {
  const halfStep = 5

  it('scale: brightness 0 yields minimum radius (0.2 * halfStep)', () => {
    const r = dotRadiusFromBrightness(0, halfStep, 'scale')
    expect(r).toBeCloseTo(halfStep * 0.2)
  })

  it('scale: brightness 1 yields maximum radius (full halfStep)', () => {
    const r = dotRadiusFromBrightness(1, halfStep, 'scale')
    expect(r).toBeCloseTo(halfStep)
  })

  it('scale: brightness 0.5 yields interpolated radius', () => {
    const r = dotRadiusFromBrightness(0.5, halfStep, 'scale')
    const expected = halfStep * (0.2 + 0.8 * 0.5)
    expect(r).toBeCloseTo(expected)
  })

  it('scale: clamps brightness above 1 to max radius', () => {
    const r = dotRadiusFromBrightness(1.5, halfStep, 'scale')
    expect(r).toBeCloseTo(halfStep)
  })

  it('scale: clamps negative brightness to min radius', () => {
    const r = dotRadiusFromBrightness(-0.1, halfStep, 'scale')
    expect(r).toBeCloseTo(halfStep * 0.2)
  })

  it('opacity: returns fixed half of halfStep regardless of brightness', () => {
    expect(dotRadiusFromBrightness(0, halfStep, 'opacity')).toBe(halfStep * 0.5)
    expect(dotRadiusFromBrightness(0.5, halfStep, 'opacity')).toBe(halfStep * 0.5)
    expect(dotRadiusFromBrightness(1, halfStep, 'opacity')).toBe(halfStep * 0.5)
  })

  it('both: radius increases monotonically with brightness', () => {
    const r0 = dotRadiusFromBrightness(0, halfStep, 'both')
    const rMid = dotRadiusFromBrightness(0.5, halfStep, 'both')
    const r1 = dotRadiusFromBrightness(1, halfStep, 'both')
    expect(r0).toBeLessThan(rMid)
    expect(rMid).toBeLessThan(r1)
  })
})

describe('alphaFromBrightness', () => {
  it('scale: always returns 1 regardless of brightness', () => {
    expect(alphaFromBrightness(0, 'scale')).toBe(1)
    expect(alphaFromBrightness(0.5, 'scale')).toBe(1)
    expect(alphaFromBrightness(1, 'scale')).toBe(1)
  })

  it('opacity: brightness 0 yields minimum alpha 0.2', () => {
    expect(alphaFromBrightness(0, 'opacity')).toBeCloseTo(0.2)
  })

  it('opacity: brightness 1 yields maximum alpha 1', () => {
    expect(alphaFromBrightness(1, 'opacity')).toBeCloseTo(1)
  })

  it('opacity: brightness 0.5 yields interpolated alpha', () => {
    const a = alphaFromBrightness(0.5, 'opacity')
    expect(a).toBeCloseTo(0.2 + 0.8 * 0.5)
  })

  it('opacity: clamps out-of-range brightness', () => {
    expect(alphaFromBrightness(-0.1, 'opacity')).toBeCloseTo(0.2)
    expect(alphaFromBrightness(1.1, 'opacity')).toBeCloseTo(1)
  })

  it('both: alpha increases monotonically with brightness', () => {
    const a0 = alphaFromBrightness(0, 'both')
    const a1 = alphaFromBrightness(1, 'both')
    expect(a1).toBeGreaterThan(a0)
  })
})

describe('drawDot', () => {
  it.skipIf(typeof document === 'undefined')('draws without throwing when given valid context', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 20
    canvas.height = 20
    const ctx = canvas.getContext('2d')
    expect(ctx).not.toBeNull()
    if (ctx) {
      expect(() => drawDot(ctx, 10, 10, 3, 'circle')).not.toThrow()
      expect(() => drawDot(ctx, 10, 10, 3, 'square')).not.toThrow()
      expect(() => drawDot(ctx, 10, 10, 3, 'triangle')).not.toThrow()
    }
  })
})

describe('createHalftoneCanvas', () => {
  const pixelUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

  it.skipIf(typeof Image === 'undefined')('returns a canvas element when given a loaded image', async () => {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = pixelUrl
    })
    const canvas = createHalftoneCanvas(img, {
      dotType: 'circle',
      effectType: 'scale',
      color: '#000000',
    })
    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
  })
})
