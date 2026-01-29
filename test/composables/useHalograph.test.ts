import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ public: { halograph: { useProxy: false } } }),
}))

vi.mock('../../src/runtime/utils/image', () => ({
  loadImage: vi.fn().mockResolvedValue({
    naturalWidth: 100,
    naturalHeight: 100,
  } as unknown as HTMLImageElement),
}))

const mockCanvas = {
  width: 100,
  height: 100,
  toDataURL: vi.fn().mockReturnValue('data:image/png;base64,xxx'),
  getContext: vi.fn(),
}

vi.mock('../../src/runtime/utils/halftone', () => ({
  createHalftoneCanvasAsync: vi.fn().mockResolvedValue(mockCanvas),
}))

describe('useHalograph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns result, error, isLoading, toDataURL', async () => {
    const { useHalograph } = await import(
      '../../src/runtime/app/composables/useHalograph'
    )
    const src = ref('/test.png')
    const options = ref({
      color: '#000',
      dotType: 'circle' as const,
      effectType: 'scale' as const,
    })
    const out = useHalograph(src, options)
    expect(out).toHaveProperty('result')
    expect(out).toHaveProperty('error')
    expect(out).toHaveProperty('isLoading')
    expect(out).toHaveProperty('toDataURL')
    expect(typeof out.toDataURL).toBe('function')
  })
})
