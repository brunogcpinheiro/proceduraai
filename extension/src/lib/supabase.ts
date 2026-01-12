import { createClient } from '@supabase/supabase-js'
import type { Procedure, Step, User, CreateProcedureResponse } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[ProceduraAI] Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: {
      getItem: async (key: string) => {
        const result = await chrome.storage.local.get(key)
        return result[key] ?? null
      },
      setItem: async (key: string, value: string) => {
        await chrome.storage.local.set({ [key]: value })
      },
      removeItem: async (key: string) => {
        await chrome.storage.local.remove(key)
      },
    },
  },
})

// Auth helpers
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, plan, credits_remaining')
    .eq('id', user.id)
    .single()

  return data
}

// Procedure helpers
export async function createProcedure(title: string, description?: string): Promise<CreateProcedureResponse | null> {
  console.log('[ProceduraAI] Creating procedure with title:', title)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    console.error('[ProceduraAI] Auth check error:', authError)
  }

  if (!user) {
    console.error('[ProceduraAI] Cannot create procedure: User not authenticated')
    return null
  }

  console.log('[ProceduraAI] User authenticated:', user.id)

  const { data, error } = await supabase
    .from('procedures')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      status: 'recording',
    })
    .select('id, title, status')
    .single()

  if (error) {
    console.error('[ProceduraAI] Database error creating procedure:', error)
    return null
  }

  console.log('[ProceduraAI] Procedure created successfully:', data.id)
  return data
}

export async function updateProcedureStatus(
  procedureId: string,
  status: Procedure['status']
): Promise<boolean> {
  const { error } = await supabase
    .from('procedures')
    .update({ status })
    .eq('id', procedureId)

  return !error
}

// Step helpers
export async function createStep(step: Omit<Step, 'id' | 'created_at'>): Promise<Step | null> {
  const { data, error } = await supabase
    .from('steps')
    .insert(step)
    .select()
    .single()

  if (error) {
    console.error('[ProceduraAI] Error creating step:', error)
    return null
  }

  return data
}

// Storage helpers
export async function uploadScreenshot(
  userId: string,
  procedureId: string,
  orderIndex: number,
  blob: Blob
): Promise<string | null> {
  const filename = `${userId}/${procedureId}/step-${orderIndex}-${Date.now()}.png`

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(filename, blob, {
      contentType: 'image/png',
      upsert: false,
    })

  if (error) {
    console.error('[ProceduraAI] Error uploading screenshot:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(filename)

  return publicUrl
}

// T018: Upload screenshot (batch-friendly version)
export async function uploadScreenshotBatch(
  userId: string,
  procedureId: string,
  orderIndex: number,
  blob: Blob
): Promise<string | null> {
  const filename = `${userId}/${procedureId}/step-${orderIndex}-${Date.now()}.png`

  const { error } = await supabase.storage
    .from('screenshots')
    .upload(filename, blob, {
      contentType: 'image/png',
      upsert: false,
      cacheControl: '31536000', // 1 year cache
    })

  if (error) {
    console.error('[ProceduraAI] Error uploading screenshot:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(filename)

  return publicUrl
}

// T019: Create steps in batch
export interface CreateStepInput {
  procedure_id: string
  order_index: number
  screenshot_url: string | null
  action_type: Step['action_type']
  element_selector: string | null
  element_text: string | null
  element_tag: string | null
  click_x: number | null
  click_y: number | null
  page_url: string
  page_title: string | null
  captured_at: string
}

export async function createStepsBatch(steps: CreateStepInput[]): Promise<Step[] | null> {
  if (steps.length === 0) return []

  const { data, error } = await supabase
    .from('steps')
    .insert(steps)
    .select()

  if (error) {
    console.error('[ProceduraAI] Error creating steps batch:', error)
    return null
  }

  return data
}

// Process procedure (trigger AI generation)
export async function processProcedure(procedureId: string): Promise<{ success: boolean; message: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, message: 'Not authenticated' }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/process-procedure`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ procedure_id: procedureId }),
  })

  if (!response.ok) {
    const error = await response.json()
    return { success: false, message: error.message || 'Processing failed' }
  }

  return response.json()
}
