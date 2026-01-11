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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

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
    console.error('[ProceduraAI] Error creating procedure:', error)
    return null
  }

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
