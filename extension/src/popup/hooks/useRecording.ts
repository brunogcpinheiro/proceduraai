/**
 * useRecording Hook
 * Manages recording state and interactions with the service worker
 */

import { useState, useEffect, useCallback } from 'react'
import { MessageType, type MessageResponse } from '../../background/messageHandlers'

export interface RecordingStatus {
  isRecording: boolean
  procedureId: string | null
  stepCount: number
  title: string | null
}

/**
 * Hook for managing recording state
 */
export function useRecording() {
  const [status, setStatus] = useState<RecordingStatus>({
    isRecording: false,
    procedureId: null,
    stepCount: 0,
    title: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch current recording status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await sendMessage({ type: MessageType.GET_STATUS })
      if (response.success && response.data) {
        setStatus({
          isRecording: response.data.isRecording as boolean,
          procedureId: response.data.procedureId as string | null,
          stepCount: response.data.stepCount as number,
          title: response.data.title as string | null,
        })
      }
      setError(null)
    } catch (err) {
      setError('Falha ao obter status')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Start recording
  const startRecording = useCallback(async (title: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        throw new Error('Nenhuma aba ativa encontrada')
      }

      // Inject content script first
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/recorder.js'],
        })
      } catch {
        // Content script may already be injected, continue
      }

      // Send start message directly to service worker (not content script)
      const response = await sendMessage({
        type: MessageType.START_RECORDING,
        payload: { title },
      })

      if (!response.success) {
        throw new Error(response.error || 'Falha ao iniciar gravação')
      }

      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar gravação')
    } finally {
      setIsLoading(false)
    }
  }, [fetchStatus])

  // Stop recording
  const stopRecording = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendMessage({ type: MessageType.STOP_RECORDING })

      if (!response.success) {
        throw new Error(response.error || 'Falha ao parar gravação')
      }

      await fetchStatus()
      return response.data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao parar gravação')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [fetchStatus])

  // Listen for status updates
  useEffect(() => {
    fetchStatus()

    // Poll for updates while recording
    let interval: ReturnType<typeof setInterval> | null = null
    if (status.isRecording) {
      interval = setInterval(fetchStatus, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchStatus, status.isRecording])

  return {
    ...status,
    isLoading,
    error,
    startRecording,
    stopRecording,
    refresh: fetchStatus,
  }
}

/**
 * Send message to service worker
 */
async function sendMessage(message: { type: MessageType; payload?: Record<string, unknown> }): Promise<MessageResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          success: false,
          error: chrome.runtime.lastError.message,
        })
      } else {
        resolve(response || { success: false, error: 'Sem resposta' })
      }
    })
  })
}
