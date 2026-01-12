/**
 * T017: Sync Service
 * Handles syncing recordings to Supabase with progress tracking and offline support
 */

import {
  supabase,
  createProcedure,
  updateProcedureStatus,
  uploadScreenshotBatch,
  createStepsBatch,
} from '../lib/supabase'
import type { CapturedStep } from '../types/database'
import type {
  SyncProgress,
  SyncRecordingParams,
  SyncRecordingResult,
  QueuedRecording,
  SyncState,
} from '../types/sync'
import { SyncMessages } from '../types/sync'

// Batch size for screenshot uploads
const SCREENSHOT_BATCH_SIZE = 5

// Retry configuration
const MAX_RETRIES = 3
// const RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff

// Storage key for offline queue
const QUEUE_STORAGE_KEY = 'proceduraai_sync_queue'

// Sync state
let syncState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  currentProgress: null,
  queue: [],
}

/**
 * Initialize sync service
 */
export async function initSyncService(): Promise<void> {
  // Load queue from storage
  await loadQueue()

  // Set up online/offline listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }
}

/**
 * Main sync function
 */
export async function syncRecording(params: SyncRecordingParams): Promise<SyncRecordingResult> {
  const { title, description, steps, onProgress } = params

  // If already syncing, queue this recording
  if (syncState.isSyncing) {
    await queueRecording(title, description, steps)
    return { success: false, error: 'Sync in progress. Recording queued.' }
  }

  // If offline, queue for later
  if (!syncState.isOnline) {
    await queueRecording(title, description, steps)
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: SyncMessages.offline,
    })
    return { success: false, error: SyncMessages.offline }
  }

  syncState.isSyncing = true

  try {
    // Phase 1: Create procedure
    onProgress?.({
      phase: 'creating',
      progress: 5,
      message: SyncMessages.creating,
    })

    const procedure = await createProcedure(title, description)
    if (!procedure) {
      throw new Error('Failed to create procedure')
    }

    const procedureId = procedure.id
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Phase 2: Upload screenshots in batches
    const screenshotUrls = await uploadScreenshotsWithProgress(
      userId,
      procedureId,
      steps,
      onProgress
    )

    // Phase 3: Save steps
    onProgress?.({
      phase: 'saving',
      progress: 85,
      message: SyncMessages.saving,
    })

    const stepRecords = steps.map((step, index) => ({
      procedure_id: procedureId,
      order_index: index + 1, // Database requires 1-based index
      screenshot_url: screenshotUrls[index] ?? null,
      action_type: step.actionType,
      element_selector: step.elementSelector,
      element_text: step.elementText,
      element_tag: step.elementTag,
      click_x: step.clickX,
      click_y: step.clickY,
      page_url: step.pageUrl,
      page_title: step.pageTitle,
      captured_at: step.capturedAt,
    }))

    const savedSteps = await createStepsBatch(stepRecords)
    if (!savedSteps || savedSteps.length === 0) {
      throw new Error('Failed to save steps')
    }

    // Phase 4: Update procedure status
    await updateProcedureStatus(procedureId, 'ready')

    // Update step count
    await supabase
      .from('procedures')
      .update({
        step_count: steps.length,
        thumbnail_url: screenshotUrls[0] ?? null,
      })
      .eq('id', procedureId)

    // Complete!
    onProgress?.({
      phase: 'complete',
      progress: 100,
      message: SyncMessages.complete,
    })

    return { success: true, procedureId }
  } catch (error) {
    console.error('[ProceduraAI] Sync failed:', error)
    const errorMessage = error instanceof Error ? error.message : SyncMessages.error
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: errorMessage,
    })

    // Queue for retry
    await queueRecording(title, description, steps)

    return { success: false, error: errorMessage }
  } finally {
    syncState.isSyncing = false
    syncState.currentProgress = null
  }
}

/**
 * Upload screenshots with progress tracking
 */
async function uploadScreenshotsWithProgress(
  userId: string,
  procedureId: string,
  steps: CapturedStep[],
  onProgress?: (progress: SyncProgress) => void
): Promise<(string | null)[]> {
  const urls: (string | null)[] = []
  const stepsWithScreenshots = steps.filter((s) => s.screenshotDataUrl)
  const totalScreenshots = stepsWithScreenshots.length

  if (totalScreenshots === 0) {
    return steps.map(() => null)
  }

  // Process in batches
  for (let i = 0; i < steps.length; i += SCREENSHOT_BATCH_SIZE) {
    const batch = steps.slice(i, i + SCREENSHOT_BATCH_SIZE)
    const batchPromises = batch.map(async (step, batchIndex) => {
      const index = i + batchIndex

      if (!step.screenshotDataUrl) {
        return null
      }

      try {
        const blob = await dataUrlToBlob(step.screenshotDataUrl)
        // Use 1-based index to match step order
        const url = await uploadScreenshotBatch(userId, procedureId, index + 1, blob)
        return url
      } catch (error) {
        console.error(`Failed to upload screenshot ${index + 1}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    urls.push(...batchResults)

    // Update progress
    const uploadedCount = Math.min(i + SCREENSHOT_BATCH_SIZE, steps.length)
    const progress = 10 + Math.floor((uploadedCount / steps.length) * 70)
    onProgress?.({
      phase: 'uploading',
      progress,
      message: SyncMessages.uploading(uploadedCount, steps.length),
      currentStep: uploadedCount,
      totalSteps: steps.length,
    })
  }

  return urls
}

/**
 * Queue recording for later sync
 */
async function queueRecording(
  title: string,
  description: string | undefined,
  steps: CapturedStep[]
): Promise<void> {
  const queueItem: QueuedRecording = {
    id: crypto.randomUUID(),
    title,
    description,
    steps,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  }

  syncState.queue.push(queueItem)
  await saveQueue()
}

/**
 * T023: Process offline queue with retry logic
 */
export async function processQueue(): Promise<void> {
  if (syncState.queue.length === 0 || syncState.isSyncing || !syncState.isOnline) {
    return
  }

  const queue = [...syncState.queue]
  syncState.queue = []

  for (const item of queue) {
    if (item.retryCount >= MAX_RETRIES) {
      console.error(`Max retries reached for recording: ${item.title}`)
      continue
    }

    const result = await syncRecording({
      title: item.title,
      description: item.description,
      steps: item.steps,
    })

    if (!result.success) {
      // Re-queue with incremented retry count
      item.retryCount++
      item.lastError = result.error
      syncState.queue.push(item)
    }
  }

  await saveQueue()
}

/**
 * Handle coming back online
 */
async function handleOnline(): Promise<void> {
  syncState.isOnline = true
  console.log('[ProceduraAI] Back online, processing queue...')

  // Wait a bit for connection to stabilize
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await processQueue()
}

/**
 * Handle going offline
 */
function handleOffline(): void {
  syncState.isOnline = false
  console.log('[ProceduraAI] Went offline')
}

/**
 * Load queue from storage
 */
async function loadQueue(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(QUEUE_STORAGE_KEY)
    if (result[QUEUE_STORAGE_KEY]) {
      syncState.queue = result[QUEUE_STORAGE_KEY]
    }
  } catch (error) {
    console.error('[ProceduraAI] Failed to load sync queue:', error)
  }
}

/**
 * Save queue to storage
 */
async function saveQueue(): Promise<void> {
  try {
    await chrome.storage.local.set({ [QUEUE_STORAGE_KEY]: syncState.queue })
  } catch (error) {
    console.error('[ProceduraAI] Failed to save sync queue:', error)
  }
}

/**
 * Get current user ID
 */
async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Convert data URL to Blob
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl)
  return response.blob()
}

/**
 * Get sync state
 */
export function getSyncState(): SyncState {
  return { ...syncState }
}

/**
 * Get queue count
 */
export function getQueueCount(): number {
  return syncState.queue.length
}

/**
 * Clear queue
 */
export async function clearQueue(): Promise<void> {
  syncState.queue = []
  await saveQueue()
}
