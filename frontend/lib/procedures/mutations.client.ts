'use client'

import { getClient } from '@/lib/supabase/client'
import type { Procedure, UpdateProcedureInput, Database } from '@/types/database'

type ProcedureUpdate = Database['public']['Tables']['procedures']['Update']

// ============================================================================
// Types
// ============================================================================

export interface GenerateSlugResult {
  public_slug: string
  is_public: boolean
}

// ============================================================================
// Utility functions
// ============================================================================

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let slug = ''
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return slug
}

// ============================================================================
// Client-side mutations (for use in client components)
// ============================================================================

export async function updateProcedureClient(
  id: string,
  input: UpdateProcedureInput
): Promise<Procedure> {
  const supabase = getClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const updateData: ProcedureUpdate = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) {
    updateData.title = input.title.trim()
  }
  if (input.description !== undefined) {
    updateData.description = input.description?.trim() ?? null
  }
  if (input.is_public !== undefined) {
    updateData.is_public = input.is_public
  }
  if (input.status !== undefined) {
    updateData.status = input.status
  }

  const { data, error } = await supabase
    .from('procedures')
    .update(updateData as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar procedimento: ${error.message}`)
  }

  return data as Procedure
}

export async function deleteProcedureClient(id: string): Promise<void> {
  const supabase = getClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error: deleteError } = await supabase
    .from('procedures')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    throw new Error(`Erro ao excluir procedimento: ${deleteError.message}`)
  }
}

export async function generatePublicSlugClient(
  id: string
): Promise<GenerateSlugResult> {
  const supabase = getClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const slug = generateSlug()

  const updateData: ProcedureUpdate = {
    is_public: true,
    public_slug: slug,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('procedures')
    .update(updateData as never)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('public_slug, is_public')
    .single()

  if (error) {
    throw new Error(`Erro ao gerar link público: ${error.message}`)
  }

  return data as GenerateSlugResult
}

export async function togglePublicStatusClient(
  id: string,
  isPublic: boolean
): Promise<void> {
  const supabase = getClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const updateData: ProcedureUpdate = {
    is_public: isPublic,
    updated_at: new Date().toISOString(),
  }

  if (!isPublic) {
    updateData.public_slug = null
  }

  const { error } = await supabase
    .from('procedures')
    .update(updateData as never)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Erro ao alterar visibilidade: ${error.message}`)
  }
}
