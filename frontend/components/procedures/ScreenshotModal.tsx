'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import type { Step } from '@/types/database'

interface ScreenshotModalProps {
  step: Step
  totalSteps: number
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
}

export function ScreenshotModal({
  step,
  totalSteps,
  onClose,
  onPrevious,
  onNext,
}: ScreenshotModalProps) {
  const screenshotUrl = step.annotated_screenshot_url ?? step.screenshot_url
  const hasPrevious = step.order_index > 0
  const hasNext = step.order_index < totalSteps - 1

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext()
      }
    },
    [onClose, onPrevious, onNext, hasPrevious, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const handleDownload = () => {
    if (!screenshotUrl) return

    const link = document.createElement('a')
    link.href = screenshotUrl
    link.download = `passo-${step.order_index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Screenshot do passo ${step.order_index + 1}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Passo {step.order_index + 1} de {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {screenshotUrl && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Baixar screenshot"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="flex-1 relative flex items-center justify-center px-16">
          {screenshotUrl ? (
            <div className="relative max-w-full max-h-full">
              <Image
                src={screenshotUrl}
                alt={`Passo ${step.order_index + 1}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-[calc(100vh-160px)] w-auto h-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="text-white/50 text-center">
              <p>Screenshot não disponível</p>
            </div>
          )}

          {/* Navigation buttons */}
          {hasPrevious && onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Passo anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Próximo passo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Footer with step description */}
        <div className="p-4 text-white text-center">
          {(step.manual_text ?? step.generated_text) && (
            <p className="max-w-2xl mx-auto text-sm text-white/80">
              {step.manual_text ?? step.generated_text}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
