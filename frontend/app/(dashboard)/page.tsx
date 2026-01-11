import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import type { ProcedureListItem } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user's procedures
  const { data: procedures } = await supabase
    .from('procedures')
    .select('id, title, status, step_count, thumbnail_url, created_at, views_count, is_public')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus SOPs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus procedimentos documentados
          </p>
        </div>
        <Button asChild>
          <Link href="/procedures/new">Novo SOP</Link>
        </Button>
      </div>

      {/* Procedures grid */}
      {procedures && procedures.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {procedures.map((procedure: ProcedureListItem) => (
            <ProcedureCard key={procedure.id} procedure={procedure} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function ProcedureCard({ procedure }: { procedure: ProcedureListItem }) {
  const statusLabels: Record<string, string> = {
    draft: 'Rascunho',
    recording: 'Gravando',
    processing: 'Processando',
    ready: 'Pronto',
    error: 'Erro',
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    recording: 'bg-red-100 text-red-700',
    processing: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <Link
      href={`/procedures/${procedure.id}`}
      className="group block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
        {procedure.thumbnail_url ? (
          <img
            src={procedure.thumbnail_url}
            alt={procedure.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
            {procedure.title}
          </h3>
          <span className={`ml-2 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[procedure.status]}`}>
            {statusLabels[procedure.status]}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>{procedure.step_count} passos</span>
          {procedure.is_public && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {procedure.views_count}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-gray-400">
          {new Date(procedure.created_at).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <div className="rounded-full bg-blue-50 p-4">
        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Nenhum SOP criado ainda
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Comece gravando suas ações no navegador usando nossa extensão do Chrome.
        A IA vai transformar tudo em documentação profissional.
      </p>
      <div className="mt-6 flex gap-4">
        <Button asChild>
          <Link href="/procedures/new">Criar primeiro SOP</Link>
        </Button>
        <Button variant="outline" asChild>
          <a
            href="https://chrome.google.com/webstore/detail/proceduraai"
            target="_blank"
            rel="noopener noreferrer"
          >
            Baixar extensão
          </a>
        </Button>
      </div>
    </div>
  )
}
