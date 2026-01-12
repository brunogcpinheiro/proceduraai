import { createClient } from '@/lib/supabase/server'
import type {
  Procedure,
  CreateProcedureInput,
  UpdateProcedureInput,
  ProcedureStatus,
} from '@/types/database'

// ============================================================================
// T008: createProcedure - Create new procedure
// ============================================================================

export interface CreateProcedureResult {
  id: string
  title: string
  status: ProcedureStatus
}

export async function createProcedure(
  userId: string,
  input: CreateProcedureInput
): Promise<CreateProcedureResult> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('procedures')
    .insert({
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      status: 'recording' as ProcedureStatus,
      processing_progress: 0,
      is_public: false,
      public_slug: null,
    } as never)
    .select('id, title, status')
    .single()

  if (error) {
    throw new Error(`Erro ao criar procedimento: ${error.message}`)
  }

  return data as CreateProcedureResult
}

// ============================================================================
// T009: updateProcedure - Update procedure metadata
// ============================================================================

export async function updateProcedure(
  id: string,
  userId: string,
  input: UpdateProcedureInput
): Promise<Procedure> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
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
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao atualizar procedimento: ${error.message}`)
  }

  return data as Procedure
}

// ============================================================================
// T010: deleteProcedure - Delete procedure and associated data
// ============================================================================

export async function deleteProcedure(
  id: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  // First get procedure to verify ownership and get screenshots
  const { data: procedure, error: fetchError } = await supabase
    .from('procedures')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !procedure) {
    throw new Error('Procedimento não encontrado ou você não tem permissão.')
  }

  // Delete screenshots from storage
  await deleteScreenshots(userId, id)

  // Delete procedure (steps cascade automatically)
  const { error: deleteError } = await supabase
    .from('procedures')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (deleteError) {
    throw new Error(`Erro ao excluir procedimento: ${deleteError.message}`)
  }
}

// ============================================================================
// T011: generatePublicSlug - Generate and set public sharing slug
// ============================================================================

export interface GenerateSlugResult {
  public_slug: string
  is_public: boolean
}

export async function generatePublicSlug(
  id: string,
  userId: string
): Promise<GenerateSlugResult> {
  const supabase = await createClient()

  // Generate 8 character alphanumeric slug
  const slug = generateSlug()

  const { data, error } = await supabase
    .from('procedures')
    .update({
      is_public: true,
      public_slug: slug,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .eq('user_id', userId)
    .select('public_slug, is_public')
    .single()

  if (error) {
    throw new Error(`Erro ao gerar link público: ${error.message}`)
  }

  return data as GenerateSlugResult
}

// ============================================================================
// T046: deleteScreenshots - Helper to delete screenshots from storage
// ============================================================================

export async function deleteScreenshots(
  userId: string,
  procedureId: string
): Promise<void> {
  const supabase = await createClient()

  try {
    // List files in the procedure's folder
    const { data: files, error: listError } = await supabase.storage
      .from('screenshots')
      .list(`${userId}/${procedureId}`)

    if (listError) {
      console.error('Erro ao listar screenshots:', listError)
      return // Don't block deletion if screenshot cleanup fails
    }

    if (files && files.length > 0) {
      const filePaths = files.map(
        (file) => `${userId}/${procedureId}/${file.name}`
      )
      const { error: deleteError } = await supabase.storage
        .from('screenshots')
        .remove(filePaths)

      if (deleteError) {
        console.error('Erro ao excluir screenshots:', deleteError)
      }
    }
  } catch (error) {
    console.error('Erro inesperado ao excluir screenshots:', error)
  }
}

// ============================================================================
// togglePublicStatus - Toggle procedure visibility
// ============================================================================

export async function togglePublicStatus(
  id: string,
  userId: string,
  isPublic: boolean
): Promise<void> {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    is_public: isPublic,
    updated_at: new Date().toISOString(),
  }

  // If making private, clear the slug
  if (!isPublic) {
    updateData.public_slug = null
  }

  const { error } = await supabase
    .from('procedures')
    .update(updateData as never)
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Erro ao alterar visibilidade: ${error.message}`)
  }
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

