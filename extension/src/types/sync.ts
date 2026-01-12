/**
 * T016: SyncProgress interface and types
 * Types for recording sync functionality
 */

import type { CapturedStep } from './database'

/**
 * Sync phases
 */
export type SyncPhase =
  | 'idle'
  | 'creating'
  | 'uploading'
  | 'saving'
  | 'complete'
  | 'error'

/**
 * Progress callback data
 */
export interface SyncProgress {
  phase: SyncPhase
  progress: number // 0-100
  message: string
  currentStep?: number
  totalSteps?: number
}

/**
 * Sync recording parameters
 */
export interface SyncRecordingParams {
  title: string
  description?: string
  steps: CapturedStep[]
  onProgress?: (progress: SyncProgress) => void
}

/**
 * Sync recording result
 */
export interface SyncRecordingResult {
  success: boolean
  procedureId?: string
  error?: string
}

/**
 * Offline queue item
 */
export interface QueuedRecording {
  id: string
  title: string
  description?: string
  steps: CapturedStep[]
  createdAt: string
  retryCount: number
  lastError?: string
}

/**
 * Sync service state
 */
export interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  currentProgress: SyncProgress | null
  queue: QueuedRecording[]
}

/**
 * Messages for sync status updates
 */
export const SyncMessages = {
  creating: 'Criando procedimento...',
  uploading: (current: number, total: number) =>
    `Enviando screenshots (${current}/${total})...`,
  saving: 'Salvando passos...',
  complete: 'Salvo com sucesso!',
  error: 'Erro ao salvar. Tente novamente.',
  offline: 'Sem conexão. Salvo localmente.',
  retrying: 'Tentando novamente...',
} as const
