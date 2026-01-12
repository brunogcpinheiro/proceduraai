import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Layers, ArrowRight } from 'lucide-react'
import { getPublicProcedure } from '@/lib/procedures/queries'
import { PublicProcedureTimeline } from '@/components/procedures/PublicProcedureTimeline'

interface PublicProcedurePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PublicProcedurePage({
  params,
}: PublicProcedurePageProps) {
  const { slug } = await params
  const procedure = await getPublicProcedure(slug)

  if (!procedure) {
    notFound()
  }

  const createdAt = new Date(procedure.created_at)
  const timeAgo = formatDistanceToNow(createdAt, {
    addSuffix: true,
    locale: ptBR,
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {procedure.title}
        </h1>

        {procedure.description && (
          <p className="text-gray-600 max-w-2xl">{procedure.description}</p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            {procedure.step_count} passos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {timeAgo}
          </span>
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Timeline */}
      <PublicProcedureTimeline steps={procedure.steps} />

      {/* CTA */}
      <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Crie seus próprios procedimentos
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Documente processos automaticamente gravando suas ações no navegador.
          A IA transforma tudo em documentação profissional.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Começar gratuitamente
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
