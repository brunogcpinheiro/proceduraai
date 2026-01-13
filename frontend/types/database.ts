/**
 * Database types for ProceduraAI
 * Auto-generated from data model specification
 */

// Enums
export type Plan = "free" | "starter" | "pro" | "business";
export type ProcedureStatus =
  | "draft"
  | "recording"
  | "processing"
  | "ready"
  | "error";
export type ActionType = "click" | "input" | "navigate" | "scroll" | "select";
export type CreditAction = "generate_sop" | "regenerate_sop" | "export_pdf";

// User entity
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: Plan;
  credits_remaining: number;
  credits_reset_at: string | null;
  brand_color: string | null;
  brand_logo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Procedure (SOP) entity
export interface Procedure {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProcedureStatus;
  processing_progress: number;
  is_public: boolean;
  public_slug: string | null;
  views_count: number;
  step_count: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

// Step entity
export interface Step {
  id: string;
  procedure_id: string;
  order_index: number;
  screenshot_url: string | null;
  annotated_screenshot_url: string | null;
  action_type: ActionType;
  element_selector: string | null;
  element_text: string | null;
  element_tag: string | null;
  click_x: number | null;
  click_y: number | null;
  page_url: string;
  page_title: string | null;
  generated_text: string | null;
  manual_text: string | null;
  captured_at: string;
  created_at: string;
}

// Credit usage audit log
export interface CreditUsage {
  id: string;
  user_id: string;
  procedure_id: string | null;
  credits_used: number;
  action: CreditAction;
  created_at: string;
}

// Computed types for API responses
export interface ProcedureWithSteps extends Procedure {
  steps: Step[];
}

// List item type (optimized for dashboard listing)
export interface ProcedureListItem
  extends Pick<
    Procedure,
    | "id"
    | "title"
    | "status"
    | "step_count"
    | "thumbnail_url"
    | "created_at"
    | "views_count"
    | "is_public"
  > {}

// Public procedure view (limited fields)
export interface PublicProcedure {
  id: string;
  title: string;
  description: string | null;
  step_count: number;
  created_at: string;
  steps: PublicStep[];
}

export interface PublicStep {
  order_index: number;
  annotated_screenshot_url: string | null;
  generated_text: string | null;
  manual_text: string | null;
}

// Form/input types
export interface CreateProcedureInput {
  title: string;
  description?: string;
}

export interface UpdateProcedureInput {
  title?: string;
  description?: string | null;
  is_public?: boolean;
  status?: ProcedureStatus;
}

export interface CreateStepInput {
  procedure_id: string;
  order_index: number;
  screenshot_url?: string;
  action_type: ActionType;
  element_selector?: string;
  element_text?: string;
  element_tag?: string;
  click_x?: number;
  click_y?: number;
  page_url: string;
  page_title?: string;
  captured_at: string;
}

export interface UpdateStepInput {
  manual_text?: string;
  order_index?: number;
}

// SOP Document content structure
export interface SOPDocumentSection {
  title: string;
  content?: string;
  items?: string[];
}

export interface SOPDocumentStep {
  number: number;
  title: string;
  description: string;
  screenshotUrl: string | null;
  notes?: string;
}

export interface SOPDocumentContent {
  title: string;
  generatedAt: string;
  version: number;
  sections: {
    purpose: SOPDocumentSection;
    prerequisites: SOPDocumentSection;
    steps: SOPDocumentStep[];
    conclusion: SOPDocumentSection;
  };
}

// SOP Document entity
export interface SOPDocument {
  id: string;
  procedure_id: string;
  content: SOPDocumentContent;
  version: number;
  generation_count: number;
  generation_reset_at: string;
  generated_at: string;
  last_edited_at: string | null;
  is_public: boolean;
  public_slug: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

// For API responses
export interface SOPDocumentWithProcedure extends SOPDocument {
  procedure: Procedure;
}

// Database types for Supabase client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, "id" | "created_at">>;
      };
      procedures: {
        Row: Procedure;
        Insert: Omit<
          Procedure,
          "id" | "created_at" | "updated_at" | "views_count" | "step_count"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          views_count?: number;
          step_count?: number;
        };
        Update: Partial<Omit<Procedure, "id" | "user_id" | "created_at">>;
      };
      steps: {
        Row: Step;
        Insert: Omit<Step, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Step, "id" | "procedure_id" | "created_at">>;
      };
      credit_usage: {
        Row: CreditUsage;
        Insert: Omit<CreditUsage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never;
      };
      sop_documents: {
        Row: SOPDocument;
        Insert: Omit<SOPDocument, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<SOPDocument, "id" | "procedure_id" | "created_at">
        >;
      };
    };
    Enums: {
      user_plan: Plan;
      procedure_status: ProcedureStatus;
      action_type: ActionType;
    };
    Functions: {
      generate_public_slug: {
        Args: Record<string, never>;
        Returns: string;
      };
      increment_procedure_views: {
        Args: { slug: string };
        Returns: void;
      };
      deduct_user_credit: {
        Args: {
          p_user_id: string;
          p_procedure_id: string | null;
          p_action: string;
          p_amount?: number;
        };
        Returns: boolean;
      };
    };
  };
}
