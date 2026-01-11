/**
 * Badge Manager
 * Manages the extension icon badge state
 */

export const BadgeState = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  ERROR: 'error',
} as const

export type BadgeState = typeof BadgeState[keyof typeof BadgeState]

interface BadgeConfig {
  text: string
  backgroundColor: string
  textColor: string
}

const BADGE_CONFIGS: Record<BadgeState, BadgeConfig> = {
  [BadgeState.IDLE]: {
    text: '',
    backgroundColor: '#22c55e', // green-500
    textColor: '#ffffff',
  },
  [BadgeState.RECORDING]: {
    text: 'REC',
    backgroundColor: '#ef4444', // red-500
    textColor: '#ffffff',
  },
  [BadgeState.PROCESSING]: {
    text: '...',
    backgroundColor: '#f59e0b', // amber-500
    textColor: '#ffffff',
  },
  [BadgeState.ERROR]: {
    text: '!',
    backgroundColor: '#dc2626', // red-600
    textColor: '#ffffff',
  },
}

/**
 * Update the extension badge to reflect current state
 */
export function updateBadge(state: BadgeState): void {
  const config = BADGE_CONFIGS[state]

  chrome.action.setBadgeText({ text: config.text })
  chrome.action.setBadgeBackgroundColor({ color: config.backgroundColor })

  // Note: setBadgeTextColor is only available in Chrome 110+
  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({ color: config.textColor })
  }
}

/**
 * Update badge with step count during recording
 */
export function updateBadgeCount(count: number): void {
  if (count === 0) {
    updateBadge(BadgeState.RECORDING)
    return
  }

  const text = count > 99 ? '99+' : count.toString()
  chrome.action.setBadgeText({ text })
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444' })
}

/**
 * Flash the badge briefly for visual feedback
 */
export async function flashBadge(): Promise<void> {
  const originalText = await chrome.action.getBadgeText({})
  const originalColor = '#ef4444'

  // Flash white briefly
  chrome.action.setBadgeBackgroundColor({ color: '#ffffff' })
  await new Promise((resolve) => setTimeout(resolve, 100))
  chrome.action.setBadgeBackgroundColor({ color: originalColor })
  chrome.action.setBadgeText({ text: originalText })
}
