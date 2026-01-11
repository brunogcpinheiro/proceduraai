/**
 * Step Counter Component
 * Displays the number of captured steps with animation
 */

import { useEffect, useState } from 'react'

interface StepCounterProps {
  count: number
  isRecording: boolean
}

export function StepCounter({ count, isRecording }: StepCounterProps) {
  const [prevCount, setPrevCount] = useState(count)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (count !== prevCount) {
      setIsAnimating(true)
      setPrevCount(count)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [count, prevCount])

  if (!isRecording) return null

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium
        shadow-lg shadow-blue-500/25
        transition-transform duration-300
        ${isAnimating ? 'scale-110' : 'scale-100'}
      `}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
        />
      </svg>
      <span>
        {count} {count === 1 ? 'passo' : 'passos'}
      </span>
    </div>
  )
}
