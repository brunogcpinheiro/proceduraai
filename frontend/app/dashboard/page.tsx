import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProcedures } from '@/lib/procedures/queries'
import { Button } from '@/components/ui/button'
import { ProcedureList } from '@/components/procedures/ProcedureList'
import { ProcedureListSkeleton } from '@/components/procedures/ProcedureListSkeleton'

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
  }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams

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
          <Link href="/dashboard/procedures/new">Novo SOP</Link>
        </Button>
      </div>

      {/* Procedures list with Suspense */}
      <Suspense
        key={`${params.page}-${params.search}`}
        fallback={<ProcedureListSkeleton />}
      >
        <ProcedureListContent
          page={params.page}
          search={params.search}
        />
      </Suspense>
    </div>
  )
}

interface ProcedureListContentProps {
  page?: string
  search?: string
}

async function ProcedureListContent({
  page,
  search,
}: ProcedureListContentProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const searchTerm = search?.trim() ?? ''

  const result = await getProcedures(user.id, {
    page: currentPage,
    pageSize: 20,
    search: searchTerm || undefined,
  })

  return (
    <ProcedureList
      procedures={result.data}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      totalPages={result.totalPages}
      search={searchTerm}
    />
  )
}
