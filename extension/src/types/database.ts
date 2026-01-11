/**
 * Database types for ProceduraAI Chrome Extension
 * Shared with frontend - keep in sync
 */

// Enums
export type Plan = 'free' | 'starter' | 'pro' | 'business'
export type ProcedureStatus = 'draft' | 'recording' | 'processing' | 'ready' | 'error'
export type ActionType = 'click' | 'input' | 'navigate' | 'scroll' | 'select'

// User entity (subset needed by extension)
export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  plan: Plan
  credits_remaining: number
}

// Procedure (SOP) entity
export interface Procedure {
  id: string
  user_id: string
  title: string
  description: string | null
  status: ProcedureStatus
  processing_progress: number
  step_count: number
  created_at: string
}

// Step entity
export interface Step {
  id: string
  procedure_id: string
  order_index: number
  screenshot_url: string | null
  action_type: ActionType
  element_selector: string | null
  element_text: string | null
  element_tag: string | null
  click_x: number | null
  click_y: number | null
  page_url: string
  page_title: string | null
  captured_at: string
}

// Extension-specific types
export interface CapturedStep {
  actionType: ActionType
  elementSelector: string
  elementText: string | null
  elementTag: string
  clickX: number | null
  clickY: number | null
  pageUrl: string
  pageTitle: string
  capturedAt: string
  screenshotDataUrl?: string
}

export interface RecordingState {
  isRecording: boolean
  procedureId: string | null
  title: string | null
  steps: CapturedStep[]
  startedAt: string | null
}

export interface RecordingSession {
  id: string
  title: string
  steps: CapturedStep[]
  createdAt: string
}

// API response types
export interface CreateProcedureResponse {
  id: string
  title: string
  status: ProcedureStatus
}

export interface ProcessProcedureResponse {
  success: boolean
  message: string
  procedure_id?: string
}
