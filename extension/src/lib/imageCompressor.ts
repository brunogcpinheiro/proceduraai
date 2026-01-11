/**
 * Image Compression Utility
 * Compresses images for efficient storage and upload
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/png' | 'image/jpeg' | 'image/webp'
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'image/png',
}

/**
 * Compress an image from data URL
 */
export async function compressImage(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        const { width, height } = calculateDimensions(
          img.width,
          img.height,
          opts.maxWidth,
          opts.maxHeight
        )

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(img, 0, 0, width, height)

        const compressedDataUrl = canvas.toDataURL(opts.format, opts.quality)
        resolve(compressedDataUrl)
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth
  let height = originalHeight

  // Only resize if larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height

    if (width > maxWidth) {
      width = maxWidth
      height = Math.round(width / aspectRatio)
    }

    if (height > maxHeight) {
      height = maxHeight
      width = Math.round(height * aspectRatio)
    }
  }

  return { width, height }
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  dataUrls: string[],
  options: CompressionOptions = {}
): Promise<string[]> {
  return Promise.all(dataUrls.map((url) => compressImage(url, options)))
}

/**
 * Estimate compressed size (rough approximation)
 */
export function estimateCompressedSize(
  originalSize: number,
  quality: number = 0.8
): number {
  // PNG compression is lossless, so estimate ~70% of original
  // JPEG with quality 0.8 is typically ~20-40% of original
  const compressionRatio = quality > 0.9 ? 0.7 : 0.3
  return Math.round(originalSize * compressionRatio)
}
