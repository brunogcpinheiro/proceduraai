'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MousePointer, Type, Navigation, ArrowUpDown, List, ExternalLink } from 'lucide-react'
import type { Step, ActionType } from '@/types/database'

interface StepCardProps {
  step: Step
  onScreenshotClick?: () => void
}

const actionConfig: Record<
  ActionType,
  { label: string; icon: typeof MousePointer; color: string }
> = {
  click: { label: 'Clique', icon: MousePointer, color: 'text-blue-600 bg-blue-50' },
  input: { label: 'Digitação', icon: Type, color: 'text-purple-600 bg-purple-50' },
  navigate: { label: 'Navegação', icon: Navigation, color: 'text-green-600 bg-green-50' },
  scroll: { label: 'Rolagem', icon: ArrowUpDown, color: 'text-orange-600 bg-orange-50' },
  select: { label: 'Seleção', icon: List, color: 'text-pink-600 bg-pink-50' },
}

export function StepCard({ step, onScreenshotClick }: StepCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const action = actionConfig[step.action_type]
  const ActionIcon = action.icon

  const screenshotUrl = step.annotated_screenshot_url ?? step.screenshot_url
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

          {screenshotUrl ? (
            <Image
              src={screenshotUrl}
              alt={`Passo ${step.order_index + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="280px"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-sm">Sem screenshot</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
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
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${action.color}`}
          >
            <ActionIcon className="h-3 w-3" />
            {action.label}
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-700 leading-relaxed">{description}</p>
        )}

        {/* Element info */}
        {step.element_text && (
          <p className="mt-2 text-sm text-gray-500">
            Elemento: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{step.element_text}</code>
          </p>
        )}

        {/* Page info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          {step.page_title && (
            <span className="truncate max-w-xs" title={step.page_title}>
              {step.page_title}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
