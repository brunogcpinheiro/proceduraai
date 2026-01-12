# Quickstart: Fix Screenshots Display & SOP Document Generation

**Date**: 2026-01-12
**Feature Branch**: `003-fix-screenshots-sop-docs`

## Prerequisites

- Node.js 18+
- Supabase CLI installed
- Access to Supabase project
- OpenAI API key

## Quick Setup

### 1. Environment Variables

Add to `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-openai-key
```

Add to `frontend/.env.local`:
```bash
# Already configured
NEXT_PUBLIC_SUPABASE_URL=https://mambxdjjgmgzpwehkopq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Apply Database Migration

```bash
cd backend
supabase db push
# Or apply migration manually:
# supabase migration up
```

### 3. Deploy Edge Function

```bash
cd backend
supabase functions deploy generate-document
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
```

### 4. Install PDF Library

```bash
cd frontend
npm install @react-pdf/renderer
```

---

## Implementation Order

Follow this sequence for optimal development:

### Phase 1: Fix Screenshot Display (P1)

1. **Investigate NULL URLs** (30 min)
   - Check extension upload flow in `extension/src/lib/supabase.ts`
   - Verify storage bucket exists and RLS policies work
   - Test upload manually

2. **Create Signed URL Utility** (1 hour)
   - File: `frontend/lib/supabase/storage.ts`
   - Implement `getSignedUrl()` and `getSignedUrls()`

3. **Create Signed URL API Route** (30 min)
   - File: `frontend/app/api/screenshots/signed-url/route.ts`
   - Server-side signed URL generation

4. **Update StepCard Component** (1 hour)
   - File: `frontend/components/procedures/StepCard.tsx`
   - Fetch signed URLs on mount
   - Handle loading and error states

5. **Update ProcedureCard Component** (30 min)
   - File: `frontend/components/procedures/ProcedureCard.tsx`
   - Use signed URLs for thumbnails

6. **Update Queries** (30 min)
   - File: `frontend/lib/procedures/queries.ts`
   - Add signed URL resolution to `getProcedure()` and `getProcedures()`

### Phase 2: SOP Document Generation (P2)

7. **Apply Migration** (15 min)
   - Create `sop_documents` table
   - Apply RLS policies

8. **Create Edge Function** (2 hours)
   - File: `backend/supabase/functions/generate-document/index.ts`
   - OpenAI integration with structured output
   - Portuguese prompt engineering

9. **Create Document API Routes** (1.5 hours)
   - `/api/documents/generate` - Trigger generation
   - `/api/documents/[id]` - Get/Update document
   - Rate limit checking

10. **Create Document Components** (2 hours)
    - `DocumentViewer.tsx` - Display generated document
    - `GenerateDocumentButton.tsx` - Trigger with counter

11. **Create Document Page** (1 hour)
    - File: `frontend/app/dashboard/procedures/[id]/document/page.tsx`
    - View and edit generated document

### Phase 3: PDF Export (P2)

12. **Create PDF Template** (2 hours)
    - File: `frontend/lib/pdf/SOPTemplate.tsx`
    - React PDF components for document structure

13. **Create Export API Route** (1 hour)
    - File: `frontend/app/api/documents/[id]/export/route.ts`
    - Generate PDF and return as download

14. **Add Export Button** (30 min)
    - Add to DocumentViewer component

### Phase 4: Public Screenshots (P2)

15. **Create Copy to Public API** (1 hour)
    - File: `frontend/app/api/storage/copy-public/route.ts`
    - Copy screenshots when SOP goes public

16. **Update Toggle Public Function** (30 min)
    - File: `frontend/lib/procedures/mutations.ts`
    - Trigger copy on `togglePublicStatus()`

---

## Key Code Snippets

### Signed URL Utility

```typescript
// frontend/lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/server'

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }

  return data.signedUrl
}

export async function getSignedUrls(
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<Map<string, string>> {
  const supabase = await createClient()
  const urlMap = new Map<string, string>()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn)

  if (error) {
    console.error('Error creating signed URLs:', error)
    return urlMap
  }

  data?.forEach((item) => {
    if (item.signedUrl) {
      urlMap.set(item.path, item.signedUrl)
    }
  })

  return urlMap
}
```

### Edge Function Structure

```typescript
// backend/supabase/functions/generate-document/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

const SYSTEM_PROMPT = `Você é um especialista em criar documentação...`

Deno.serve(async (req) => {
  const { procedureId, title, steps } = await req.json()

  const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY')
  })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ title, steps }) }
    ],
    response_format: { type: 'json_object' }
  })

  const content = JSON.parse(completion.choices[0].message.content)

  return new Response(JSON.stringify({ content }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Rate Limit Check

```typescript
// frontend/lib/documents/mutations.ts
export async function checkGenerationLimit(
  procedureId: string
): Promise<{ canGenerate: boolean; remaining: number }> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('sop_documents')
    .select('generation_count, generation_reset_at')
    .eq('procedure_id', procedureId)
    .single()

  if (!data) {
    return { canGenerate: true, remaining: 5 }
  }

  const today = new Date().toISOString().split('T')[0]
  const resetDate = data.generation_reset_at

  if (resetDate < today) {
    return { canGenerate: true, remaining: 5 }
  }

  const remaining = 5 - data.generation_count
  return {
    canGenerate: remaining > 0,
    remaining: Math.max(0, remaining)
  }
}
```

---

## Testing Checklist

### Screenshot Display
- [ ] Screenshots appear in SOP detail view
- [ ] Thumbnails appear in SOP listing
- [ ] Modal shows full-size screenshots
- [ ] Placeholder shown when no screenshot

### Document Generation
- [ ] Generate button shows remaining count
- [ ] Document generates successfully
- [ ] Content is in Portuguese
- [ ] Rate limit enforced (max 5/day)

### PDF Export
- [ ] PDF downloads successfully
- [ ] Screenshots included in PDF
- [ ] Formatting is professional

### Public SOPs
- [ ] Public SOPs show screenshots without auth
- [ ] Screenshots copied to public bucket

---

## Troubleshooting

### Screenshots Still Not Showing

1. Check browser console for errors
2. Verify signed URL is being generated:
   ```typescript
   console.log('Signed URL:', signedUrl)
   ```
3. Check storage bucket RLS policies
4. Verify file exists in bucket

### AI Generation Fails

1. Check Edge Function logs:
   ```bash
   supabase functions logs generate-document
   ```
2. Verify OPENAI_API_KEY is set
3. Check rate limits in database

### PDF Export Fails

1. Check API route logs
2. Verify @react-pdf/renderer is installed
3. Check image URLs are accessible
