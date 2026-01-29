/** Options for loading an image (e.g. CORS) */
export interface LoadImageOptions {
  crossOrigin?: 'anonymous' | 'use-credentials'
}

export class ImageLoader {
  private static readonly DEFAULT_CORS = 'anonymous'

  /**
   * Loads an image from the given URL with optional CORS.
   * @param src - Image URL
   * @param options - Load options (crossOrigin)
   * @returns Promise resolving to the loaded image
   */
  static load(
    src: string,
    options: LoadImageOptions = {},
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const crossOrigin = options.crossOrigin ?? this.DEFAULT_CORS
      img.crossOrigin = crossOrigin

      const onLoad = () => {
        cleanup()
        resolve(img)
      }

      const onError = () => {
        cleanup()
        const corsHint = crossOrigin !== this.DEFAULT_CORS ? ' (with given CORS)' : ''
        reject(
          new Error(
            `Halograph: failed to load image from "${src}"${corsHint}. Check network, CORS settings, or URL validity.`,
          ),
        )
      }

      const cleanup = () => {
        img.onload = null
        img.onerror = null
      }

      img.onload = onLoad
      img.onerror = onError
      img.src = src
    })
  }
}

/** Loads an image from URL; alias for ImageLoader.load */
export function loadImage(
  src: string,
  options: LoadImageOptions = {},
): Promise<HTMLImageElement> {
  return ImageLoader.load(src, options)
}
