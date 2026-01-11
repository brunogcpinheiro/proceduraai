/**
 * Content Script - Click Event Recorder
 * Captures user interactions and sends them to the service worker
 */

import { generateSelector } from './selectorGenerator'
import { isSensitiveField } from './privacyFilter'
import { showRecordingIndicator, hideRecordingIndicator, updateIndicatorCount } from './recordingIndicator'
import type { CapturedStep, ActionType } from '../types/database'

let isRecording = false
let stepCount = 0

/**
 * Initialize the recorder
 */
function init(): void {
  console.log('[ProceduraAI] Content script loaded')

  // Listen for recording status updates from service worker
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'RECORDING_STATUS') {
      if (message.payload?.isRecording) {
        startCapturing()
      } else {
        stopCapturing()
      }
      sendResponse({ success: true })
      return true
    }
    // Não retorna true para mensagens que não tratamos
    // Isso permite que outros listeners respondam
    return false
  })

  // Check current recording status
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response?.data?.isRecording) {
      stepCount = response.data.stepCount || 0
      startCapturing()
    }
  })
}

/**
 * Start capturing user interactions
 */
function startCapturing(): void {
  if (isRecording) return
  isRecording = true

  document.addEventListener('click', handleClick, true)
  document.addEventListener('input', handleInput, true)
  document.addEventListener('change', handleChange, true)

  showRecordingIndicator()
  if (stepCount > 0) {
    updateIndicatorCount(stepCount)
  }
  console.log('[ProceduraAI] Recording started on:', window.location.href)
}

/**
 * Stop capturing user interactions
 */
function stopCapturing(): void {
  if (!isRecording) return
  isRecording = false
  stepCount = 0

  document.removeEventListener('click', handleClick, true)
  document.removeEventListener('input', handleInput, true)
  document.removeEventListener('change', handleChange, true)

  hideRecordingIndicator()
  console.log('[ProceduraAI] Recording stopped')
}

/**
 * Handle click events
 */
function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (!target || !isRecording) return

  // Ignore clicks on the recording indicator
  if (target.closest('#proceduraai-indicator')) return

  const step = captureStep(target, 'click', event)
  if (step) {
    sendStep(step)
  }
}

/**
 * Handle input events (for text fields)
 */
let inputDebounceTimer: ReturnType<typeof setTimeout> | null = null

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  if (!target || !isRecording) return

  // Skip sensitive fields
  if (isSensitiveField(target)) return

  // Debounce input events
  if (inputDebounceTimer) {
    clearTimeout(inputDebounceTimer)
  }

  inputDebounceTimer = setTimeout(() => {
    const step = captureStep(target, 'input')
    if (step) {
      sendStep(step)
    }
  }, 500)
}

/**
 * Handle change events (for selects, checkboxes, etc.)
 */
function handleChange(event: Event): void {
  const target = event.target as HTMLElement
  if (!target || !isRecording) return

  if (target instanceof HTMLSelectElement) {
    const step = captureStep(target, 'select')
    if (step) {
      sendStep(step)
    }
  }
}

/**
 * Capture a step from an element interaction
 */
function captureStep(
  element: HTMLElement,
  actionType: ActionType,
  event?: MouseEvent
): CapturedStep | null {
  try {
    const selector = generateSelector(element)
    const text = getElementText(element)
    const tag = element.tagName.toLowerCase()

    const step: CapturedStep = {
      actionType,
      elementSelector: selector,
      elementText: text,
      elementTag: tag,
      clickX: event?.clientX ?? null,
      clickY: event?.clientY ?? null,
      pageUrl: window.location.href,
      pageTitle: document.title || '',
      capturedAt: new Date().toISOString(),
    }

    return step
  } catch (error) {
    console.error('[ProceduraAI] Failed to capture step:', error)
    return null
  }
}

/**
 * Get human-readable text from an element
 */
function getElementText(element: HTMLElement): string | null {
  // For inputs, use placeholder or label
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent?.trim() || null
    return element.placeholder || element.name || null
  }

  // For buttons and links, use text content
  if (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement) {
    return element.textContent?.trim() || element.title || null
  }

  // For selects, use selected option text
  if (element instanceof HTMLSelectElement) {
    return element.options[element.selectedIndex]?.text || null
  }

  // Default: use text content (truncated)
  const text = element.textContent?.trim()
  return text && text.length < 100 ? text : null
}

/**
 * Send captured step to service worker
 */
function sendStep(step: CapturedStep): void {
  // First capture the screenshot, then send the step
  chrome.runtime.sendMessage(
    { type: 'CAPTURE_SCREENSHOT' },
    (screenshotResponse) => {
      if (screenshotResponse?.success && screenshotResponse.data?.screenshotDataUrl) {
        step.screenshotDataUrl = screenshotResponse.data.screenshotDataUrl
      }

      chrome.runtime.sendMessage(
        {
          type: 'ADD_STEP',
          payload: { step },
        },
        (response) => {
          if (response?.success) {
            stepCount = response.data?.stepCount || stepCount + 1
            updateIndicatorCount(stepCount)
            console.log('[ProceduraAI] Step captured:', step.actionType, step.elementText)
          } else {
            console.error('[ProceduraAI] Failed to send step:', response?.error)
          }
        }
      )
    }
  )
}

// Initialize when script loads
init()

export {}
