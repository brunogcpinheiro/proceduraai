/**
 * T022: SyncProgress UI Component
 * Shows sync progress during recording save
 */

import { useEffect, useState } from 'react'
import type { SyncProgress as SyncProgressType } from '../../types/sync'
import { MessageType } from '../../background/messageHandlers'

interface SyncProgressProps {
  initialProgress?: SyncProgressType | null
}

export function SyncProgress({ initialProgress }: SyncProgressProps) {
  const [progress, setProgress] = useState<SyncProgressType | null>(
    initialProgress ?? null
  )

  useEffect(() => {
    // Listen for progress updates from background
    const handleMessage = (message: { type: string; payload?: { progress?: SyncProgressType } }) => {
      if (message.type === MessageType.SYNC_PROGRESS && message.payload?.progress) {
        setProgress(message.payload.progress)
      }
      if (message.type === MessageType.SYNC_COMPLETE) {
        // Clear progress after a delay
        setTimeout(() => setProgress(null), 2000)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  if (!progress) return null

  const getPhaseIcon = () => {
    switch (progress.phase) {
      case 'creating':
        return '📝'
      case 'uploading':
        return '📤'
      case 'saving':
        return '💾'
      case 'complete':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getPhaseColor = () => {
    switch (progress.phase) {
      case 'complete':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getPhaseIcon()}</span>
        <span className="text-sm font-medium text-gray-700">
          {progress.message}
        </span>
      </div>

      {progress.phase !== 'complete' && progress.phase !== 'error' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getPhaseColor()}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      )}

      {progress.currentStep && progress.totalSteps && (
        <p className="text-xs text-gray-500 mt-1">
          {progress.currentStep} de {progress.totalSteps} screenshots
        </p>
      )}
    </div>
  )
}
