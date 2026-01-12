'use client'

import { useState, useCallback } from 'react'
import { StepCard } from './StepCard'
import { ScreenshotModal } from './ScreenshotModal'
import type { Step } from '@/types/database'

interface ProcedureTimelineProps {
  steps: Step[]
}

export function ProcedureTimeline({ steps }: ProcedureTimelineProps) {
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

  const selectedStep = selectedStepIndex !== null ? steps[selectedStepIndex] : null

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
          <StepCard
            key={step.id}
            step={step}
            onScreenshotClick={() => handleScreenshotClick(index)}
          />
        ))}
      </div>

      {/* Screenshot Modal */}
      {selectedStep && selectedStepIndex !== null && (
        <ScreenshotModal
          step={selectedStep}
          totalSteps={steps.length}
          onClose={handleCloseModal}
          onPrevious={selectedStepIndex > 0 ? handlePreviousStep : undefined}
          onNext={selectedStepIndex < steps.length - 1 ? handleNextStep : undefined}
        />
      )}
    </>
  )
}
