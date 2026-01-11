/**
 * Chrome Storage Wrapper
 * Type-safe wrapper for chrome.storage API
 */

import type { RecordingState, User } from '../types/database'

/**
 * Storage keys and their types
 */
export interface StorageSchema {
  recordingState: RecordingState
  activeTabId: number | null
  user: User | null
  authToken: string | null
  settings: AppSettings
}

export interface AppSettings {
  autoSave: boolean
  captureDelay: number
  maxStepsPerRecording: number
  compressScreenshots: boolean
  showRecordingIndicator: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSave: true,
  captureDelay: 100,
  maxStepsPerRecording: 100,
  compressScreenshots: true,
  showRecordingIndicator: true,
}

/**
 * Get a value from chrome.storage.local
 */
export async function get<K extends keyof StorageSchema>(
  key: K
): Promise<StorageSchema[K] | null> {
  const result = await chrome.storage.local.get(key)
  return (result[key] as StorageSchema[K]) ?? null
}

/**
 * Get multiple values from chrome.storage.local
 */
export async function getMany<K extends keyof StorageSchema>(
  keys: K[]
): Promise<Partial<Pick<StorageSchema, K>>> {
  const result = await chrome.storage.local.get(keys)
  return result as Partial<Pick<StorageSchema, K>>
}

/**
 * Set a value in chrome.storage.local
 */
export async function set<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

/**
 * Set multiple values in chrome.storage.local
 */
export async function setMany(
  items: Partial<StorageSchema>
): Promise<void> {
  await chrome.storage.local.set(items)
}

/**
 * Remove a value from chrome.storage.local
 */
export async function remove<K extends keyof StorageSchema>(
  key: K
): Promise<void> {
  await chrome.storage.local.remove(key)
}

/**
 * Remove multiple values from chrome.storage.local
 */
export async function removeMany<K extends keyof StorageSchema>(
  keys: K[]
): Promise<void> {
  await chrome.storage.local.remove(keys)
}

/**
 * Clear all values from chrome.storage.local
 */
export async function clear(): Promise<void> {
  await chrome.storage.local.clear()
}

/**
 * Get app settings with defaults
 */
export async function getSettings(): Promise<AppSettings> {
  const stored = await get('settings')
  return { ...DEFAULT_SETTINGS, ...stored }
}

/**
 * Update app settings
 */
export async function updateSettings(
  updates: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...updates }
  await set('settings', updated)
  return updated
}

/**
 * Listen for storage changes
 */
export function onChanged(
  callback: (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: 'local' | 'sync' | 'managed' | 'session'
  ) => void
): void {
  chrome.storage.onChanged.addListener(callback)
}

/**
 * Get storage usage info
 */
export async function getUsage(): Promise<{
  bytesInUse: number
  quota: number
  percentUsed: number
}> {
  const bytesInUse = await chrome.storage.local.getBytesInUse()
  const quota = chrome.storage.local.QUOTA_BYTES
  return {
    bytesInUse,
    quota,
    percentUsed: (bytesInUse / quota) * 100,
  }
}
