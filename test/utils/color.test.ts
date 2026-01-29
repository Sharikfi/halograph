import { describe, it, expect } from 'vitest'
import { parseColor, brightness, brightnessFromRgba } from '../../src/runtime/utils/color'

describe('parseColor', () => {
  it('parses 6-digit hex', () => {
    const [r, g, b] = parseColor('#ff0000')
    expect(r).toBeCloseTo(1)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('parses 3-digit hex', () => {
    const [r, g, b] = parseColor('#f00')
    expect(r).toBeCloseTo(1)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('parses hex without leading hash', () => {
    const [r, g, b] = parseColor('00ff00')
    expect(r).toBe(0)
    expect(g).toBeCloseTo(1)
    expect(b).toBe(0)
  })

  it('parses black', () => {
    const [r, g, b] = parseColor('#000000')
    expect(r).toBe(0)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it('parses white', () => {
    const [r, g, b] = parseColor('#ffffff')
    expect(r).toBeCloseTo(1)
    expect(g).toBeCloseTo(1)
    expect(b).toBeCloseTo(1)
  })

  it('parses rgb() with values 0–255', () => {
    const [r, g, b] = parseColor('rgb(255, 0, 128)')
    expect(r).toBeCloseTo(1)
    expect(g).toBe(0)
    expect(b).toBeCloseTo(128 / 255)
  })

  it('parses rgba() and ignores alpha for RGB result', () => {
    const [r, g, b] = parseColor('rgba(100, 150, 200, 0.5)')
    expect(r).toBeCloseTo(100 / 255)
    expect(g).toBeCloseTo(150 / 255)
    expect(b).toBeCloseTo(200 / 255)
  })

  it('parses hsl() and converts to RGB', () => {
    const [r, g, b] = parseColor('hsl(0, 100%, 50%)')
    expect(r).toBeCloseTo(1)
    expect(g).toBeCloseTo(0)
    expect(b).toBeCloseTo(0)
  })

  it('parses hsl(120, 100%, 50%) as green', () => {
    const [r, g, b] = parseColor('hsl(120, 100%, 50%)')
    expect(r).toBeCloseTo(0, 1)
    expect(g).toBeCloseTo(1, 1)
    expect(b).toBeCloseTo(0, 1)
  })

  it('returns [0,0,0] for invalid or unsupported input', () => {
    expect(parseColor('invalid')).toEqual([0, 0, 0])
    expect(parseColor('')).toEqual([0, 0, 0])
  })
})

describe('brightness', () => {
  it('black (0,0,0) yields 0', () => {
    expect(brightness(0, 0, 0)).toBe(0)
  })

  it('white (1,1,1) yields 1', () => {
    expect(brightness(1, 1, 1)).toBeCloseTo(1)
  })

  it('gray 0.5 yields 0.5', () => {
    expect(brightness(0.5, 0.5, 0.5)).toBeCloseTo(0.5)
  })

  it('uses luminance weights: red contributes ~0.299', () => {
    const b = brightness(1, 0, 0)
    expect(b).toBeGreaterThan(0)
    expect(b).toBeLessThan(1)
    expect(b).toBeCloseTo(0.299)
  })

  it('green contributes ~0.587', () => {
    const b = brightness(0, 1, 0)
    expect(b).toBeCloseTo(0.587)
  })

  it('blue contributes ~0.114', () => {
    const b = brightness(0, 0, 1)
    expect(b).toBeCloseTo(0.114)
  })
})

describe('brightnessFromRgba', () => {
  it('opaque black (0,0,0,255) yields 0', () => {
    expect(brightnessFromRgba(0, 0, 0, 255)).toBe(0)
  })

  it('opaque white (255,255,255,255) yields 1', () => {
    expect(brightnessFromRgba(255, 255, 255, 255)).toBeCloseTo(1)
  })

  it('fully transparent pixel yields 0 regardless of RGB', () => {
    expect(brightnessFromRgba(255, 255, 255, 0)).toBe(0)
    expect(brightnessFromRgba(100, 200, 50, 0)).toBe(0)
  })

  it('half transparent white yields ~0.5', () => {
    const b = brightnessFromRgba(255, 255, 255, 128)
    expect(b).toBeCloseTo(0.5, 1)
  })
})
