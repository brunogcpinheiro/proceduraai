/**
 * Message Types and Handlers
 * Defines the message protocol between popup, content scripts, and service worker
 */

import type { CapturedStep } from '../types/database'

/**
 * Message types for communication between extension components
 */
export const MessageType = {
  // Recording control
  GET_STATUS: 'GET_STATUS',
  START_RECORDING: 'START_RECORDING',
  STOP_RECORDING: 'STOP_RECORDING',
  RECORDING_STATUS: 'RECORDING_STATUS',

  // Step capture
  ADD_STEP: 'ADD_STEP',
  CAPTURE_SCREENSHOT: 'CAPTURE_SCREENSHOT',

  // Auth
  GET_USER: 'GET_USER',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',

  // Sync
  SYNC_PROCEDURE: 'SYNC_PROCEDURE',
  GENERATE_SOP: 'GENERATE_SOP',
} as const

export type MessageType = typeof MessageType[keyof typeof MessageType]

/**
 * Message payload types
 */
export interface MessagePayload {
  title?: string
  step?: CapturedStep
  tabId?: number
  procedureId?: string
  isRecording?: boolean
  email?: string
  password?: string
}

/**
 * Message structure
 */
export interface Message {
  type: MessageType
  payload?: MessagePayload
}

/**
 * Response structure
 */
export interface MessageResponse {
  success: boolean
  error?: string
  data?: Record<string, unknown>
}

/**
 * Send a message to the service worker
 */
export async function sendMessage(message: Message): Promise<MessageResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        })
      } else {
        resolve(response || { success: false, error: 'No response' })
      }
    })
  })
}

/**
 * Send a message to a specific tab's content script
 */
export async function sendTabMessage(
  tabId: number,
  message: Message
): Promise<MessageResponse> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        })
      } else {
        resolve(response || { success: false, error: 'No response' })
      }
    })
  })
}
