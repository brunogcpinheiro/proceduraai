/**
 * T013: Error handling utility with Portuguese messages
 */

export interface SupabaseError {
  message: string
  details: string | null
  hint: string | null
  code: string
}

// Map of Supabase error codes to Portuguese messages
const errorMessages: Record<string, string> = {
  // PostgreSQL errors
  PGRST116: 'Registro não encontrado.',
  '23505': 'Este registro já existe.',
  '42501': 'Você não tem permissão para esta ação.',
  '23503': 'Este registro está vinculado a outros dados.',
  '22P02': 'Dados inválidos fornecidos.',
  '23502': 'Campo obrigatório não preenchido.',

  // Auth errors
  invalid_credentials: 'Credenciais inválidas.',
  user_not_found: 'Usuário não encontrado.',
  session_expired: 'Sua sessão expirou. Faça login novamente.',

  // Storage errors
  storage_quota_exceeded: 'Limite de armazenamento excedido.',
  file_too_large: 'Arquivo muito grande.',

  // Network errors
  network_error: 'Erro de conexão. Verifique sua internet.',
  timeout: 'A operação demorou muito. Tente novamente.',
}

// Default messages for common operations
const operationMessages: Record<string, string> = {
  load: 'Erro ao carregar dados. Tente novamente.',
  save: 'Erro ao salvar. Tente novamente.',
  delete: 'Erro ao excluir. Tente novamente.',
  update: 'Erro ao atualizar. Tente novamente.',
  upload: 'Erro ao enviar arquivo. Tente novamente.',
  sync: 'Erro ao sincronizar. Tente novamente.',
}

/**
 * Get a user-friendly Portuguese error message
 */
export function getErrorMessage(
  error: SupabaseError | Error | unknown,
  operation?: 'load' | 'save' | 'delete' | 'update' | 'upload' | 'sync'
): string {
  // Check if it's a Supabase error with a code
  if (isSupabaseError(error)) {
    const knownMessage = errorMessages[error.code]
    if (knownMessage) {
      return knownMessage
    }
  }

  // Check for network errors
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return errorMessages.network_error
    }
    if (error.message.includes('timeout')) {
      return errorMessages.timeout
    }
  }

  // Return operation-specific default message
  if (operation && operationMessages[operation]) {
    return operationMessages[operation]
  }

  // Generic fallback
  return 'Ocorreu um erro. Tente novamente.'
}

/**
 * Type guard for Supabase errors
 */
function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as SupabaseError).code === 'string'
  )
}

/**
 * Format validation errors
 */
export function getValidationMessage(field: string): string {
  const validationMessages: Record<string, string> = {
    title: 'O título é obrigatório.',
    title_length: 'O título deve ter entre 1 e 200 caracteres.',
    description_length: 'A descrição deve ter no máximo 2000 caracteres.',
    email: 'Email inválido.',
    password: 'Senha inválida.',
    required: 'Este campo é obrigatório.',
  }

  return validationMessages[field] ?? 'Campo inválido.'
}

/**
 * Success messages for operations
 */
export const successMessages = {
  save: 'Salvo com sucesso!',
  delete: 'Excluído com sucesso!',
  update: 'Atualizado com sucesso!',
  share: 'Link copiado para a área de transferência!',
  sync: 'Sincronizado com sucesso!',
} as const

/**
 * Loading messages for operations
 */
export const loadingMessages = {
  save: 'Salvando...',
  delete: 'Excluindo...',
  update: 'Atualizando...',
  upload: 'Enviando...',
  sync: 'Sincronizando...',
  load: 'Carregando...',
} as const
