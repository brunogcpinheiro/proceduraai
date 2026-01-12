'use client'

import { FileVideo, Plus } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title?: string
  description?: string
  showAction?: boolean
}

export function EmptyState({
  title = 'Nenhum procedimento encontrado',
  description = 'Comece gravando seu primeiro procedimento usando a extensão do Chrome.',
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileVideo className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {showAction && (
        <div className="flex flex-col gap-3 items-center">
          <p className="text-sm text-muted-foreground">
            Use a extensão ProceduraAI para gravar procedimentos
          </p>
          <Link
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Instalar Extensão
          </Link>
        </div>
      )}
    </div>
  )
}
