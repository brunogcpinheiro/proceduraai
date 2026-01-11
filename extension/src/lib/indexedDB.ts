/**
 * IndexedDB Manager
 * Stores large data (screenshots) offline for sync later
 */

import type { RecordingSession } from '../types/database'

const DB_NAME = 'proceduraai'
const DB_VERSION = 1

const STORES = {
  SESSIONS: 'sessions',
  SCREENSHOTS: 'screenshots',
} as const

let db: IDBDatabase | null = null

/**
 * Initialize the IndexedDB database
 */
export async function initDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create sessions store
      if (!database.objectStoreNames.contains(STORES.SESSIONS)) {
        const sessionsStore = database.createObjectStore(STORES.SESSIONS, {
          keyPath: 'id',
        })
        sessionsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create screenshots store
      if (!database.objectStoreNames.contains(STORES.SCREENSHOTS)) {
        const screenshotsStore = database.createObjectStore(STORES.SCREENSHOTS, {
          keyPath: 'id',
        })
        screenshotsStore.createIndex('sessionId', 'sessionId', { unique: false })
      }
    }
  })
}

/**
 * Save a recording session
 */
export async function saveSession(session: RecordingSession): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SESSIONS, 'readwrite')
    const store = transaction.objectStore(STORES.SESSIONS)
    const request = store.put(session)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get a recording session by ID
 */
export async function getSession(id: string): Promise<RecordingSession | null> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SESSIONS, 'readonly')
    const store = transaction.objectStore(STORES.SESSIONS)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all recording sessions
 */
export async function getAllSessions(): Promise<RecordingSession[]> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SESSIONS, 'readonly')
    const store = transaction.objectStore(STORES.SESSIONS)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete a recording session
 */
export async function deleteSession(id: string): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [STORES.SESSIONS, STORES.SCREENSHOTS],
      'readwrite'
    )

    // Delete session
    const sessionsStore = transaction.objectStore(STORES.SESSIONS)
    sessionsStore.delete(id)

    // Delete associated screenshots
    const screenshotsStore = transaction.objectStore(STORES.SCREENSHOTS)
    const index = screenshotsStore.index('sessionId')
    const request = index.openCursor(IDBKeyRange.only(id))

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

/**
 * Save a screenshot
 */
export async function saveScreenshot(
  sessionId: string,
  stepIndex: number,
  dataUrl: string
): Promise<string> {
  const database = await initDB()
  const id = `${sessionId}-${stepIndex}`

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SCREENSHOTS, 'readwrite')
    const store = transaction.objectStore(STORES.SCREENSHOTS)
    const request = store.put({
      id,
      sessionId,
      stepIndex,
      dataUrl,
      createdAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get a screenshot by ID
 */
export async function getScreenshot(id: string): Promise<string | null> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SCREENSHOTS, 'readonly')
    const store = transaction.objectStore(STORES.SCREENSHOTS)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result?.dataUrl || null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all screenshots for a session
 */
export async function getSessionScreenshots(
  sessionId: string
): Promise<Array<{ stepIndex: number; dataUrl: string }>> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORES.SCREENSHOTS, 'readonly')
    const store = transaction.objectStore(STORES.SCREENSHOTS)
    const index = store.index('sessionId')
    const request = index.getAll(IDBKeyRange.only(sessionId))

    request.onsuccess = () => {
      const screenshots = request.result.map((s: { stepIndex: number; dataUrl: string }) => ({
        stepIndex: s.stepIndex,
        dataUrl: s.dataUrl,
      }))
      resolve(screenshots.sort((a: { stepIndex: number }, b: { stepIndex: number }) => a.stepIndex - b.stepIndex))
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Clear all data from IndexedDB
 */
export async function clearAll(): Promise<void> {
  const database = await initDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      [STORES.SESSIONS, STORES.SCREENSHOTS],
      'readwrite'
    )

    transaction.objectStore(STORES.SESSIONS).clear()
    transaction.objectStore(STORES.SCREENSHOTS).clear()

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

/**
 * Get storage usage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number
  quota: number
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
    }
  }
  return { usage: 0, quota: 0 }
}
