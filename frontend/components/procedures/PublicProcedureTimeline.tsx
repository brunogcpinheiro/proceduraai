'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ScreenshotModal } from './ScreenshotModal'
import type { PublicStep, Step } from '@/types/database'

interface PublicProcedureTimelineProps {
  steps: PublicStep[]
}

export function PublicProcedureTimeline({ steps }: PublicProcedureTimelineProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null)

  const handleScreenshotClick = useCallback((index: number) => {
    setSelectedStepIndex(index)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedStepIndex(null)
  }, [])

  const handlePreviousStep = useCallback(() => {
    setSelectedStepIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))
  }, [])

  const handleNextStep = useCallback(() => {
    setSelectedStepIndex((prev) =>
      prev !== null && prev < steps.length - 1 ? prev + 1 : prev
    )
  }, [steps.length])

  // Convert PublicStep to Step-like object for modal
  const selectedStep = selectedStepIndex !== null ? steps[selectedStepIndex] : null
  const selectedStepAsStep = selectedStep
    ? ({
        id: `step-${selectedStepIndex}`,
        procedure_id: '',
        order_index: selectedStep.order_index,
        screenshot_url: null,
        annotated_screenshot_url: selectedStep.annotated_screenshot_url,
        action_type: 'click',
        element_selector: null,
        element_text: null,
        element_tag: null,
        click_x: null,
        click_y: null,
        page_url: '',
        page_title: null,
        generated_text: selectedStep.generated_text,
        manual_text: selectedStep.manual_text,
        captured_at: '',
        created_at: '',
      } as Step)
    : null

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum passo registrado neste procedimento.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {steps.map((step, index) => (
          <PublicStepCard
            key={index}
            step={step}
            onScreenshotClick={() => handleScreenshotClick(index)}
          />
        ))}
      </div>

      {/* Screenshot Modal */}
      {selectedStepAsStep && (
        <ScreenshotModal
          step={selectedStepAsStep}
          totalSteps={steps.length}
          onClose={handleCloseModal}
          onPrevious={selectedStepIndex! > 0 ? handlePreviousStep : undefined}
          onNext={selectedStepIndex! < steps.length - 1 ? handleNextStep : undefined}
        />
      )}
    </>
  )
}

interface PublicStepCardProps {
  step: PublicStep
  onScreenshotClick?: () => void
}

function PublicStepCard({ step, onScreenshotClick }: PublicStepCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const description = step.manual_text ?? step.generated_text

  return (
    <div className="flex gap-4 relative">
      {/* Timeline connector */}
      <div className="absolute left-[140px] top-0 bottom-0 w-px bg-gray-200 hidden md:block" />

      {/* Screenshot */}
      <div className="shrink-0 w-64 md:w-[280px]">
        <button
          onClick={onScreenshotClick}
          className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group"
          aria-label="Ver screenshot em tamanho real"
        >
          {/* Blur placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}

          {step.annotated_screenshot_url ? (
            <Image
              src={step.annotated_screenshot_url}
              alt={`Passo ${step.order_index + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="280px"
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-sm">Sem screenshot</span>
            </div>
          )}
        </button>
      </div>

      {/* Step number indicator (on timeline) */}
      <div className="hidden md:flex absolute left-[132px] top-4 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs items-center justify-center font-medium z-10">
        {step.order_index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 py-1">
        {/* Step header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="md:hidden inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {step.order_index + 1}
          </span>
          <span className="text-sm font-medium text-gray-500">
            Passo {step.order_index + 1}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  )
}
