/**
 * Screenshot Capture Utility
 * Captures and processes screenshots from browser tabs
 */

import { compressImage } from './imageCompressor'

export interface ScreenshotOptions {
  format?: 'png' | 'jpeg'
  quality?: number
  compress?: boolean
  maxWidth?: number
  maxHeight?: number
}

const DEFAULT_OPTIONS: ScreenshotOptions = {
  format: 'png',
  quality: 90,
  compress: true,
  maxWidth: 1920,
  maxHeight: 1080,
}

/**
 * Capture a screenshot of the visible tab
 */
export async function captureVisibleTab(
  options: ScreenshotOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const dataUrl = await chrome.tabs.captureVisibleTab({
    format: opts.format,
    quality: opts.format === 'jpeg' ? opts.quality : undefined,
  })

  if (opts.compress && opts.maxWidth && opts.maxHeight) {
    return compressImage(dataUrl, {
      maxWidth: opts.maxWidth,
      maxHeight: opts.maxHeight,
      quality: opts.quality! / 100,
      format: opts.format === 'jpeg' ? 'image/jpeg' : 'image/png',
    })
  }

  return dataUrl
}

/**
 * Capture a screenshot with element highlight
 */
export async function captureWithHighlight(
  tabId: number,
  selector: string,
  options: ScreenshotOptions = {}
): Promise<string> {
  // First, add highlight to the element
  await chrome.scripting.executeScript({
    target: { tabId },
    func: highlightElement,
    args: [selector],
  })

  // Wait for highlight animation
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Capture the screenshot
  const dataUrl = await captureVisibleTab(options)

  // Remove the highlight
  await chrome.scripting.executeScript({
    target: { tabId },
    func: removeHighlight,
    args: [selector],
  })

  return dataUrl
}

/**
 * Highlight an element on the page (injected function)
 */
function highlightElement(selector: string): void {
  const element = document.querySelector(selector)
  if (!element) return

  const highlight = document.createElement('div')
  highlight.id = 'proceduraai-highlight'
  highlight.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 2147483646;
    border: 3px solid #ef4444;
    border-radius: 4px;
    background: rgba(239, 68, 68, 0.1);
    transition: all 0.2s ease;
  `

  const rect = element.getBoundingClientRect()
  highlight.style.top = `${rect.top + window.scrollY - 4}px`
  highlight.style.left = `${rect.left + window.scrollX - 4}px`
  highlight.style.width = `${rect.width + 8}px`
  highlight.style.height = `${rect.height + 8}px`

  document.body.appendChild(highlight)
}

/**
 * Remove element highlight (injected function)
 */
function removeHighlight(_selector: string): void {
  const highlight = document.getElementById('proceduraai-highlight')
  if (highlight) {
    highlight.remove()
  }
}

/**
 * Convert data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64Data] = dataUrl.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'

  const byteString = atob(base64Data)
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  return new Blob([uint8Array], { type: mimeType })
}

/**
 * Get file size from data URL (in bytes)
 */
export function getDataUrlSize(dataUrl: string): number {
  const base64Length = dataUrl.split(',')[1]?.length || 0
  return Math.ceil((base64Length * 3) / 4)
}
