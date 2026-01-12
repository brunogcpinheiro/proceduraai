'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Clock, Globe, Lock, Layers, Trash2, Share2 } from 'lucide-react'
import Link from 'next/link'
import { EditableTitle } from './EditableTitle'
import { EditableDescription } from './EditableDescription'
import type { Procedure, ProcedureStatus } from '@/types/database'

interface ProcedureHeaderProps {
  procedure: Procedure
  onUpdate?: (updates: { title?: string; description?: string | null }) => Promise<void>
  onDelete?: () => void
  onShare?: () => void
  isUpdating?: boolean
}

const statusConfig: Record<
  ProcedureStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Rascunho', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  recording: {
    label: 'Gravando',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  processing: {
    label: 'Processando',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  ready: { label: 'Pronto', color: 'text-green-600', bgColor: 'bg-green-100' },
  error: { label: 'Erro', color: 'text-red-600', bgColor: 'bg-red-100' },
}

export function ProcedureHeader({
  procedure,
  onUpdate,
  onDelete,
  onShare,
  isUpdating = false,
}: ProcedureHeaderProps) {
  const [optimisticProcedure, setOptimisticProcedure] = useState(procedure)
  const status = statusConfig[optimisticProcedure.status]
  const createdAt = new Date(optimisticProcedure.created_at)
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: ptBR,
  })

  const handleTitleSave = async (title: string) => {
    if (!onUpdate) return

    // Optimistic update
    setOptimisticProcedure((prev) => ({ ...prev, title }))

    try {
      await onUpdate({ title })
    } catch {
      // Rollback on error
      setOptimisticProcedure(procedure)
      throw new Error('Erro ao salvar título')
    }
  }

  const handleDescriptionSave = async (description: string | null) => {
    if (!onUpdate) return

    // Optimistic update
    setOptimisticProcedure((prev) => ({ ...prev, description }))

    try {
      await onUpdate({ description })
    } catch {
      // Rollback on error
      setOptimisticProcedure(procedure)
      throw new Error('Erro ao salvar descrição')
    }
  }

  return (
    <div className="space-y-4">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </Link>

      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2 flex-1">
          {onUpdate ? (
            <>
              <EditableTitle
                value={optimisticProcedure.title}
                onSave={handleTitleSave}
                isLoading={isUpdating}
              />
              <EditableDescription
                value={optimisticProcedure.description}
                onSave={handleDescriptionSave}
                isLoading={isUpdating}
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                {optimisticProcedure.title}
              </h1>
              {optimisticProcedure.description && (
                <p className="text-gray-600 max-w-2xl">
                  {optimisticProcedure.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onShare && (
            <button
              onClick={onShare}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        {/* Status */}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
        >
          {status.label}
        </span>

        {/* Public/Private */}
        <span className="flex items-center gap-1">
          {optimisticProcedure.is_public ? (
            <>
              <Globe className="h-4 w-4 text-green-500" />
              Público
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Privado
            </>
          )}
        </span>

        {/* Step count */}
        <span className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          {optimisticProcedure.step_count} passos
        </span>

        {/* Created at */}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {timeAgo}
        </span>

        {/* Views */}
        {optimisticProcedure.is_public && optimisticProcedure.views_count > 0 && (
          <span>{optimisticProcedure.views_count} visualizações</span>
        )}
      </div>
    </div>
  )
}
