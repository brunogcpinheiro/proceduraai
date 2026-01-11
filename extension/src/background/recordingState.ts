/**
 * Recording State Management
 * Manages the recording session state in the service worker
 */

import type { CapturedStep, RecordingState } from '../types/database'

// In-memory recording state
let recordingState: RecordingState = {
  isRecording: false,
  procedureId: null,
  title: null,
  steps: [],
  startedAt: null,
}

// Active tab being recorded
let activeTabId: number | null = null

/**
 * Start a new recording session
 */
export async function startRecording(tabId: number, title: string): Promise<void> {
  recordingState = {
    isRecording: true,
    procedureId: crypto.randomUUID(),
    title,
    steps: [],
    startedAt: new Date().toISOString(),
  }
  activeTabId = tabId

  // Save to chrome.storage for persistence
  await chrome.storage.local.set({
    recordingState,
    activeTabId,
  })

  // Inject content script into the active tab
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/recorder.js'],
    })
  } catch (error) {
    console.error('[ProceduraAI] Failed to inject content script:', error)
  }

  console.log('[ProceduraAI] Recording started:', recordingState.procedureId)
}

/**
 * Stop the current recording session
 */
export async function stopRecording(): Promise<RecordingState> {
  const finalState = { ...recordingState }

  // Notify content scripts to stop
  if (activeTabId) {
    try {
      await chrome.tabs.sendMessage(activeTabId, {
        type: 'RECORDING_STATUS',
        payload: { isRecording: false },
      })
    } catch (error) {
      // Tab might be closed, ignore
    }
  }

  // Reset state
  recordingState = {
    isRecording: false,
    procedureId: null,
    title: null,
    steps: [],
    startedAt: null,
  }
  activeTabId = null

  // Clear from storage
  await chrome.storage.local.remove(['recordingState', 'activeTabId'])

  console.log('[ProceduraAI] Recording stopped, captured', finalState.steps.length, 'steps')
  return finalState
}

/**
 * Add a captured step to the current recording
 */
export function addStep(step: CapturedStep): void {
  if (!recordingState.isRecording) {
    console.warn('[ProceduraAI] Cannot add step: not recording')
    return
  }

  recordingState.steps.push(step)

  // Persist to storage (async, fire and forget)
  chrome.storage.local.set({ recordingState }).catch((error) => {
    console.error('[ProceduraAI] Failed to persist step:', error)
  })

  console.log('[ProceduraAI] Step added, total:', recordingState.steps.length)
}

/**
 * Get the current recording state
 */
export function getRecordingState(): RecordingState {
  return { ...recordingState }
}

/**
 * Get the active tab ID
 */
export function getActiveTabId(): number | null {
  return activeTabId
}

/**
 * Restore recording state from storage (on service worker restart)
 */
export async function restoreState(): Promise<void> {
  const result = await chrome.storage.local.get(['recordingState', 'activeTabId'])

  if (result.recordingState?.isRecording) {
    recordingState = result.recordingState
    activeTabId = result.activeTabId
    console.log('[ProceduraAI] Recording state restored:', recordingState.procedureId)
  }
}

// Restore state when service worker starts
restoreState().catch(console.error)

export { recordingState }
