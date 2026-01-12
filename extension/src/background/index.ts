/**
 * ProceduraAI Chrome Extension - Service Worker
 * Handles recording state, messaging, and badge updates
 */

import { startRecording, stopRecording, getRecordingState, addStep } from './recordingState'
import { MessageType, type Message, type MessageResponse } from './messageHandlers'
import { updateBadge, BadgeState } from './badgeManager'
import { initSyncService, syncRecording, processQueue, getSyncState, getQueueCount } from './syncService'
import type { SyncProgress } from '../types/sync'

// Track current sync progress for popup
let currentSyncProgress: SyncProgress | null = null

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[ProceduraAI] Extension installed:', details.reason)
  updateBadge(BadgeState.IDLE)
  initSyncService()
})

// T024: Initialize sync service and handle online/offline events
chrome.runtime.onStartup.addListener(() => {
  initSyncService()
})

// Listen for online/offline events
self.addEventListener('online', () => {
  console.log('[ProceduraAI] Back online')
  processQueue()
})

self.addEventListener('offline', () => {
  console.log('[ProceduraAI] Went offline')
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('[ProceduraAI] Message handler error:', error)
      sendResponse({ success: false, error: error.message })
    })
  return true // Keep message channel open for async response
})

async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender
): Promise<MessageResponse> {
  switch (message.type) {
    case MessageType.GET_STATUS: {
      const state = getRecordingState()
      return {
        success: true,
        data: {
          isRecording: state.isRecording,
          procedureId: state.procedureId,
          stepCount: state.steps.length,
          title: state.title,
        },
      }
    }

    case MessageType.START_RECORDING: {
      // If message comes from popup, sender.tab is undefined
      // So we need to get the active tab manually
      let tabId = sender.tab?.id
      if (!tabId) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        tabId = activeTab?.id
      }
      if (!tabId) {
        return { success: false, error: 'No active tab' }
      }
      const title = message.payload?.title || 'Novo Procedimento'
      await startRecording(tabId, title)
      updateBadge(BadgeState.RECORDING)
      return { success: true }
    }

    case MessageType.STOP_RECORDING: {
      const state = await stopRecording()
      updateBadge(BadgeState.IDLE)

      // T020: Start sync process
      if (state.steps.length > 0 && state.title) {
        // Start sync in background
        syncRecording({
          title: state.title,
          steps: state.steps,
          onProgress: (progress) => {
            currentSyncProgress = progress
            // T021: Notify popup of progress
            chrome.runtime.sendMessage({
              type: MessageType.SYNC_PROGRESS,
              payload: { progress },
            }).catch(() => {
              // Popup might be closed, that's ok
            })
          },
        }).then((result) => {
          currentSyncProgress = null
          // Notify popup of completion
          chrome.runtime.sendMessage({
            type: MessageType.SYNC_COMPLETE,
            payload: { result },
          }).catch(() => {})
        })
      }

      return {
        success: true,
        data: {
          procedureId: state.procedureId,
          stepCount: state.steps.length,
          steps: state.steps,
        },
      }
    }

    case MessageType.GET_SYNC_STATUS: {
      const syncState = getSyncState()
      return {
        success: true,
        data: {
          isOnline: syncState.isOnline,
          isSyncing: syncState.isSyncing,
          queueCount: getQueueCount(),
          currentProgress: currentSyncProgress,
        },
      }
    }

    case MessageType.SYNC_PROCEDURE: {
      const { title, steps } = message.payload || {}
      if (!title || !steps) {
        return { success: false, error: 'Missing title or steps' }
      }

      const result = await syncRecording({
        title,
        steps,
        onProgress: (progress) => {
          currentSyncProgress = progress
          chrome.runtime.sendMessage({
            type: MessageType.SYNC_PROGRESS,
            payload: { progress },
          }).catch(() => {})
        },
      })

      currentSyncProgress = null
      return {
        success: result.success,
        data: { procedureId: result.procedureId },
        error: result.error,
      }
    }

    case MessageType.ADD_STEP: {
      if (!message.payload?.step) {
        return { success: false, error: 'No step data provided' }
      }
      addStep(message.payload.step)
      const state = getRecordingState()
      return {
        success: true,
        data: { stepCount: state.steps.length },
      }
    }

    case MessageType.CAPTURE_SCREENSHOT: {
      const tabId = message.payload?.tabId || sender.tab?.id
      if (!tabId) {
        return { success: false, error: 'No tab ID for screenshot' }
      }
      try {
        const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' })
        return { success: true, data: { screenshotDataUrl: dataUrl } }
      } catch (error) {
        return { success: false, error: 'Failed to capture screenshot' }
      }
    }

    default:
      return { success: false, error: 'Unknown message type' }
  }
}

// Handle tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return

  const state = getRecordingState()
  if (!state.isRecording) return

  // Skip chrome:// and other restricted URLs
  if (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('chrome-extension://') ||
    tab.url.startsWith('about:')
  ) {
    return
  }

  try {
    // Inject content script into the new page
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/recorder.js'],
    })

    // Notify content script that recording is active
    await chrome.tabs.sendMessage(tabId, {
      type: MessageType.RECORDING_STATUS,
      payload: { isRecording: true },
    })
  } catch (error) {
    console.error('[ProceduraAI] Failed to inject content script:', error)
  }
})

export {}
