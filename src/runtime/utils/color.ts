class ColorConverter {
  private static readonly CHANNEL_MIN = 0
  private static readonly CHANNEL_MAX = 1

  static hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
      return [l, l, l]
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    return [
      this.hueToChannel(p, q, h + 1 / 3),
      this.hueToChannel(p, q, h),
      this.hueToChannel(p, q, h - 1 / 3),
    ]
  }

  private static hueToChannel(p: number, q: number, t: number): number {
    let hue = t
    if (hue < 0) hue += 1
    if (hue > 1) hue -= 1

    if (hue < 1 / 6) return p + (q - p) * 6 * hue
    if (hue < 1 / 2) return q
    if (hue < 2 / 3) return p + (q - p) * (2 / 3 - hue) * 6
    return p
  }
}

class ColorParser {
  private static readonly HEX_PATTERN = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i
  private static readonly RGB_PATTERN = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  private static readonly HSL_PATTERN = /hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/
  private static readonly BYTE_MAX = 255

  static parseHex(color: string): [number, number, number] | null {
    const match = color.match(this.HEX_PATTERN)
    if (!match?.[1]) return null

    const hex = match[1]
    const isShort = hex.length === 3

    const r = isShort
      ? Number.parseInt(hex[0]! + hex[0], 16) / this.BYTE_MAX
      : Number.parseInt(hex.slice(0, 2), 16) / this.BYTE_MAX

    const g = isShort
      ? Number.parseInt(hex[1]! + hex[1], 16) / this.BYTE_MAX
      : Number.parseInt(hex.slice(2, 4), 16) / this.BYTE_MAX

    const b = isShort
      ? Number.parseInt(hex[2]! + hex[2], 16) / this.BYTE_MAX
      : Number.parseInt(hex.slice(4, 6), 16) / this.BYTE_MAX

    return [r, g, b]
  }

  static parseRgb(color: string): [number, number, number] | null {
    const match = color.match(this.RGB_PATTERN)
    if (!match) return null

    return [
      Math.min(this.BYTE_MAX, Number.parseInt(match[1]!, 10)) / this.BYTE_MAX,
      Math.min(this.BYTE_MAX, Number.parseInt(match[2]!, 10)) / this.BYTE_MAX,
      Math.min(this.BYTE_MAX, Number.parseInt(match[3]!, 10)) / this.BYTE_MAX,
    ]
  }

  static parseHsl(color: string): [number, number, number] | null {
    const match = color.match(this.HSL_PATTERN)
    if (!match) return null

    const h = Number.parseFloat(match[1]!) / 360
    const s = Number.parseFloat(match[2]!) / 100
    const l = Number.parseFloat(match[3]!) / 100

    return ColorConverter.hslToRgb(h, s, l)
  }

  static parseViaDom(cssColor: string): [number, number, number] | null {
    if (typeof document === 'undefined') return null

    const el = document.createElement('div')
    el.style.color = cssColor
    document.body.appendChild(el)

    const computed = getComputedStyle(el).color
    document.body.removeChild(el)

    const match = computed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (!match) return null

    return [
      Number.parseInt(match[1]!, 10) / this.BYTE_MAX,
      Number.parseInt(match[2]!, 10) / this.BYTE_MAX,
      Number.parseInt(match[3]!, 10) / this.BYTE_MAX,
    ]
  }
}

/**
 * Parses a color string (HEX, rgb/rgba, hsl/hsla, or DOM fallback) into normalized RGB [0–1].
 * @param color - CSS color string
 * @returns Tuple [r, g, b] in 0–1 range, or [0,0,0] on failure
 */
export function parseColor(color: string): [number, number, number] {
  return (
    ColorParser.parseHex(color)
    ?? ColorParser.parseRgb(color)
    ?? ColorParser.parseHsl(color)
    ?? ColorParser.parseViaDom(color)
    ?? [0, 0, 0]
  )
}

class BrightnessCalculator {
  private static readonly RED_WEIGHT = 0.299
  private static readonly GREEN_WEIGHT = 0.587
  private static readonly BLUE_WEIGHT = 0.114
  private static readonly BYTE_MAX = 255

  static calculate(r: number, g: number, b: number): number {
    return (
      (this.RED_WEIGHT * r)
      + (this.GREEN_WEIGHT * g)
      + (this.BLUE_WEIGHT * b)
    )
  }

  static calculateWithAlpha(r: number, g: number, b: number, a: number): number {
    const gray = this.calculate(
      r / this.BYTE_MAX,
      g / this.BYTE_MAX,
      b / this.BYTE_MAX,
    )
    return gray * (a / this.BYTE_MAX)
  }
}

/**
 * Grayscale luminance from normalized RGB (ITU-R BT.709 weights).
 * @param r - Red 0–1
 * @param g - Green 0–1
 * @param b - Blue 0–1
 * @returns Luminance 0–1
 */
export function brightness(r: number, g: number, b: number): number {
  return BrightnessCalculator.calculate(r, g, b)
}

/**
 * Luminance from RGBA bytes, weighted by alpha.
 * @param r - Red 0–255
 * @param g - Green 0–255
 * @param b - Blue 0–255
 * @param a - Alpha 0–255
 * @returns Effective luminance 0–1
 */
export function brightnessFromRgba(
  r: number,
  g: number,
  b: number,
  a: number,
): number {
  return BrightnessCalculator.calculateWithAlpha(r, g, b, a)
}
