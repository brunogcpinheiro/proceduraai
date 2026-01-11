/**
 * Recording Indicator
 * Visual overlay showing that recording is in progress
 */

const INDICATOR_ID = 'proceduraai-indicator'

/**
 * Show the recording indicator overlay
 */
export function showRecordingIndicator(): void {
  // Remove existing indicator if any
  hideRecordingIndicator()

  const indicator = document.createElement('div')
  indicator.id = INDICATOR_ID
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(239, 68, 68, 0.95);
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: white;
      pointer-events: none;
      animation: proceduraai-pulse 2s ease-in-out infinite;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: proceduraai-blink 1s ease-in-out infinite;
      "></div>
      <span>Gravando...</span>
    </div>
    <style>
      @keyframes proceduraai-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.02); opacity: 0.9; }
      }
      @keyframes proceduraai-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    </style>
  `

  document.body.appendChild(indicator)
}

/**
 * Hide the recording indicator overlay
 */
export function hideRecordingIndicator(): void {
  const existing = document.getElementById(INDICATOR_ID)
  if (existing) {
    existing.remove()
  }
}

/**
 * Flash the indicator to show a step was captured
 */
export function flashIndicator(): void {
  const indicator = document.getElementById(INDICATOR_ID)
  if (!indicator) return

  const inner = indicator.firstElementChild as HTMLElement
  if (!inner) return

  // Flash green briefly
  const originalBg = inner.style.background
  inner.style.background = 'rgba(34, 197, 94, 0.95)'
  inner.style.transition = 'background 0.2s'

  setTimeout(() => {
    inner.style.background = originalBg
  }, 200)
}

/**
 * Update indicator with step count
 */
export function updateIndicatorCount(count: number): void {
  const indicator = document.getElementById(INDICATOR_ID)
  if (!indicator) return

  const span = indicator.querySelector('span')
  if (span) {
    span.textContent = `Gravando... (${count} passos)`
  }
}
