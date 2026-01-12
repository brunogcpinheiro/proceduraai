import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProcedure } from '@/lib/procedures/queries'
import { ProcedureDetail } from '@/components/procedures/ProcedureDetail'
import { ProcedureDetailSkeleton } from '@/components/procedures/ProcedureDetailSkeleton'

interface ProcedurePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<ProcedureDetailSkeleton />}>
      <ProcedureContent id={id} />
    </Suspense>
  )
}

interface ProcedureContentProps {
  id: string
}

async function ProcedureContent({ id }: ProcedureContentProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const procedure = await getProcedure(id, user.id)

  if (!procedure) {
    notFound()
  }

  return <ProcedureDetail procedure={procedure} />
}
