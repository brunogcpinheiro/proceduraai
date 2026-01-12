'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Eye, Globe, Lock, Play } from 'lucide-react'
import type { ProcedureListItem, ProcedureStatus } from '@/types/database'

interface ProcedureCardProps {
  procedure: ProcedureListItem
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

export function ProcedureCard({ procedure }: ProcedureCardProps) {
  const status = statusConfig[procedure.status]
  const createdAt = new Date(procedure.created_at)
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <Link
      href={`/dashboard/procedures/${procedure.id}`}
      className="block group"
      aria-label={`Ver procedimento: ${procedure.title}`}
    >
      <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all duration-200">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-100">
          {procedure.thumbnail_url ? (
            <Image
              src={procedure.thumbnail_url}
              alt={`Thumbnail de ${procedure.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          {/* Public/Private indicator */}
          <div className="absolute top-2 right-2">
            {procedure.is_public ? (
              <span
                className="p-1.5 rounded-full bg-white/90 text-green-600"
                title="Público"
              >
                <Globe className="h-4 w-4" />
              </span>
            ) : (
              <span
                className="p-1.5 rounded-full bg-white/90 text-gray-500"
                title="Privado"
              >
                <Lock className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
            {procedure.title}
          </h3>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {timeAgo}
            </span>

            <span>{procedure.step_count} passos</span>

            {procedure.is_public && procedure.views_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {procedure.views_count}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
