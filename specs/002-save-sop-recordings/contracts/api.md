# API Contracts: Save SOP Recordings

**Feature Branch**: `002-save-sop-recordings`
**Date**: 2026-01-11
**Protocol**: Supabase Client SDK (REST under the hood)

## Overview

This feature uses Supabase client SDK for data operations. These contracts define the expected function signatures and data shapes.

---

## Procedures API

### List Procedures (Paginated)

```typescript
// Function: getProcedures
// Location: frontend/lib/procedures/queries.ts

interface GetProceduresParams {
  page?: number;        // Default: 1
  pageSize?: number;    // Default: 20
  search?: string;      // Search in title/description
  status?: ProcedureStatus; // Filter by status
}

interface GetProceduresResult {
  data: ProcedureListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Supabase query:
// supabase
//   .from('procedures')
//   .select('id, title, status, step_count, thumbnail_url, is_public, created_at, updated_at', { count: 'exact' })
//   .eq('user_id', userId)
//   .ilike('title', `%${search}%`)  // if search provided
//   .order('created_at', { ascending: false })
//   .range(from, to)
```

### Get Procedure Detail

```typescript
// Function: getProcedure
// Location: frontend/lib/procedures/queries.ts

interface GetProcedureParams {
  id: string;
}

// Returns: ProcedureDetail (procedure with steps array)

// Supabase query:
// supabase
//   .from('procedures')
//   .select(`
//     *,
//     steps (*)
//   `)
//   .eq('id', id)
//   .eq('user_id', userId)
//   .order('order_index', { foreignTable: 'steps', ascending: true })
//   .single()
```

### Get Public Procedure

```typescript
// Function: getPublicProcedure
// Location: frontend/lib/procedures/queries.ts

interface GetPublicProcedureParams {
  slug: string;
}

// Returns: PublicProcedure (no auth required)

// Supabase query:
// supabase
//   .from('procedures')
//   .select(`
//     id, title, description, step_count, created_at,
//     steps (
//       id, order_index, screenshot_url, action_type,
//       element_text, element_tag, click_x, click_y,
//       page_url, page_title, generated_text, manual_text, captured_at
//     )
//   `)
//   .eq('public_slug', slug)
//   .eq('is_public', true)
//   .order('order_index', { foreignTable: 'steps', ascending: true })
//   .single()
```

### Create Procedure

```typescript
// Function: createProcedure
// Location: frontend/lib/procedures/mutations.ts (and extension)

interface CreateProcedureParams {
  title: string;
  description?: string;
}

interface CreateProcedureResult {
  id: string;
  title: string;
  status: 'recording';
}

// Supabase query:
// supabase
//   .from('procedures')
//   .insert({
//     user_id: userId,
//     title,
//     description,
//     status: 'recording'
//   })
//   .select('id, title, status')
//   .single()
```

### Update Procedure

```typescript
// Function: updateProcedure
// Location: frontend/lib/procedures/mutations.ts

interface UpdateProcedureParams {
  id: string;
  title?: string;
  description?: string;
  status?: ProcedureStatus;
  is_public?: boolean;
}

// Returns: Updated Procedure

// Supabase query:
// supabase
//   .from('procedures')
//   .update({ title, description, status, is_public, updated_at: new Date().toISOString() })
//   .eq('id', id)
//   .eq('user_id', userId)
//   .select()
//   .single()
```

### Delete Procedure

```typescript
// Function: deleteProcedure
// Location: frontend/lib/procedures/mutations.ts

interface DeleteProcedureParams {
  id: string;
}

// Returns: void (success) or throws error

// Steps:
// 1. Get procedure to verify ownership and get step screenshots
// 2. Delete screenshots from storage
// 3. Delete procedure (steps cascade automatically)

// supabase.from('procedures').delete().eq('id', id).eq('user_id', userId)
```

### Generate Public Slug

```typescript
// Function: generatePublicSlug
// Location: frontend/lib/procedures/mutations.ts

interface GenerateSlugParams {
  id: string;
}

interface GenerateSlugResult {
  public_slug: string;
}

// Supabase query:
// supabase
//   .from('procedures')
//   .update({
//     is_public: true,
//     public_slug: generateSlug() // 8 char alphanumeric
//   })
//   .eq('id', id)
//   .eq('user_id', userId)
//   .select('public_slug')
//   .single()
```

---

## Steps API

### Create Step

```typescript
// Function: createStep
// Location: extension/src/lib/supabase.ts

interface CreateStepParams {
  procedure_id: string;
  order_index: number;
  action_type: ActionType;
  element_selector?: string;
  element_text?: string;
  element_tag?: string;
  click_x?: number;
  click_y?: number;
  page_url?: string;
  page_title?: string;
  captured_at: string;
  screenshot_url?: string;
}

// Returns: Created Step

// Supabase query:
// supabase
//   .from('steps')
//   .insert(stepData)
//   .select()
//   .single()
```

### Create Steps Batch

```typescript
// Function: createStepsBatch
// Location: extension/src/lib/supabase.ts

interface CreateStepsBatchParams {
  steps: CreateStepParams[];
}

// Returns: Created Step[]

// Supabase query:
// supabase
//   .from('steps')
//   .insert(steps)
//   .select()
```

---

## Storage API

### Upload Screenshot

```typescript
// Function: uploadScreenshot
// Location: extension/src/lib/supabase.ts

interface UploadScreenshotParams {
  userId: string;
  procedureId: string;
  orderIndex: number;
  blob: Blob;
}

interface UploadScreenshotResult {
  path: string;  // Storage path
  url: string;   // Public URL
}

// Supabase Storage:
// const path = `${userId}/${procedureId}/step-${orderIndex}-${Date.now()}.png`
// supabase.storage.from('screenshots').upload(path, blob, {
//   contentType: 'image/png',
//   cacheControl: '31536000' // 1 year
// })
```

### Delete Screenshots

```typescript
// Function: deleteScreenshots
// Location: frontend/lib/procedures/mutations.ts

interface DeleteScreenshotsParams {
  userId: string;
  procedureId: string;
}

// Supabase Storage:
// const { data: files } = await supabase.storage
//   .from('screenshots')
//   .list(`${userId}/${procedureId}`)
//
// await supabase.storage
//   .from('screenshots')
//   .remove(files.map(f => `${userId}/${procedureId}/${f.name}`))
```

---

## Extension Sync API

### Sync Recording

```typescript
// Function: syncRecording
// Location: extension/src/background/syncService.ts

interface SyncRecordingParams {
  title: string;
  description?: string;
  steps: CapturedStep[];
  screenshots: Map<number, Blob>; // orderIndex -> blob
}

interface SyncProgress {
  phase: 'creating' | 'uploading' | 'saving' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

interface SyncRecordingResult {
  procedureId: string;
  success: boolean;
  error?: string;
}

// Flow:
// 1. Create procedure → procedureId
// 2. Upload screenshots (batch of 5) → screenshot URLs
// 3. Create steps with URLs
// 4. Update procedure status to 'ready'
// 5. Report progress at each phase
```

---

## Error Responses

All Supabase operations follow this error pattern:

```typescript
interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}

// Common error codes:
// PGRST116 - Not found
// 23505 - Unique violation
// 42501 - Permission denied (RLS)
// 23503 - Foreign key violation
```

### Error Handling

```typescript
// Standard error handler
function handleError(error: SupabaseError): string {
  switch (error.code) {
    case 'PGRST116':
      return 'Procedimento não encontrado.';
    case '23505':
      return 'Este título já existe.';
    case '42501':
      return 'Você não tem permissão para esta ação.';
    default:
      return 'Ocorreu um erro. Tente novamente.';
  }
}
```

---

## Rate Limits

Supabase free tier limits (for reference):
- Database: 500 MB
- Storage: 1 GB
- API requests: 50,000/day
- Realtime connections: 200 concurrent

No custom rate limiting implemented for this feature.

---

## Caching Strategy

- **List page**: Cache for 30s, revalidate on mutation
- **Detail page**: Cache for 60s, revalidate on mutation
- **Public page**: Cache for 5 minutes (CDN-friendly)
- **Screenshots**: Browser cache with 1-year max-age (immutable content)
