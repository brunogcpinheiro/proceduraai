# Research: Fix Screenshots Display & SOP Document Generation

**Date**: 2026-01-12
**Feature Branch**: `003-fix-screenshots-sop-docs`

## Executive Summary

Research reveals two distinct issues to address:
1. **Screenshot URLs are NULL in database** - The root cause is not just display but also data persistence
2. **Signed URLs required for private buckets** - Even when URLs exist, private bucket access needs authentication

## Research Findings

### 1. Screenshot Storage Issue Analysis

**Database Investigation Results:**
```sql
-- Steps table: All screenshot_url values are NULL
SELECT screenshot_url FROM steps;
-- Result: 4 rows, all NULL

-- Procedures table: thumbnail_url is also NULL
SELECT thumbnail_url FROM procedures;
-- Result: 1 row, NULL
```

**Root Cause Analysis:**
- Screenshots are captured in the extension (confirmed working via `screenshot.ts`)
- Upload function exists in `extension/src/lib/supabase.ts`
- **Issue**: URLs may not be persisted correctly after upload, OR upload may be failing silently

**Decision**: Investigate and fix the upload flow in addition to implementing signed URLs for display

**Rationale**: Even with perfect signed URL implementation, NULL URLs cannot be displayed

**Alternatives Considered**:
- Only fix display (rejected: won't solve NULL URLs)
- Rewrite upload from scratch (rejected: existing code structure is sound)

---

### 2. Supabase Storage Signed URLs

**Documentation Reference**: [Supabase Storage - Serving Assets](https://supabase.com/docs/guides/storage/serving/downloads)

**Key Findings:**
- Private buckets require signed URLs for access
- `createSignedUrl(path, expiresIn)` - expiresIn is in seconds
- Can batch sign with `createSignedUrls(paths[], expiresIn)`
- Signed URLs can include image transformations

**Implementation Pattern:**
```typescript
// Single signed URL
const { data, error } = await supabase.storage
  .from('screenshots')
  .createSignedUrl('path/to/file.png', 3600) // 1 hour = 3600 seconds

// Batch signed URLs (more efficient for lists)
const { data, error } = await supabase.storage
  .from('screenshots')
  .createSignedUrls(['path1.png', 'path2.png'], 3600)
```

**Decision**: Use server-side signed URL generation with 1-hour expiration (3600 seconds)

**Rationale**:
- Server-side keeps service role key secure
- 1-hour expiration balances security and UX
- Batch signing improves performance for list views

**Alternatives Considered**:
- Client-side signing (rejected: exposes service role key)
- Longer expiration (rejected: security concern)
- Public bucket (rejected: privacy requirement)

---

### 3. Public Bucket for Shared SOPs

**Decision**: Copy screenshots to `public` bucket when SOP is made public

**Implementation Pattern:**
```typescript
// Copy file from private to public bucket
const { data: fileData } = await supabase.storage
  .from('screenshots')
  .download(`${userId}/${procedureId}/screenshot.png`)

await supabase.storage
  .from('public')
  .upload(`${procedureId}/screenshot.png`, fileData)

// Get public URL (no signing needed)
const { data: { publicUrl } } = supabase.storage
  .from('public')
  .getPublicUrl(`${procedureId}/screenshot.png`)
```

**Rationale**: Public bucket allows direct URL access without authentication, better for sharing

---

### 4. OpenAI Integration for Document Generation

**Documentation Reference**: [Supabase Edge Functions + OpenAI](https://supabase.com/docs/guides/ai/examples/openai)

**Key Findings:**
- Use Edge Functions to keep API key server-side
- Import OpenAI from Deno: `import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'`
- Environment variable: `OPENAI_API_KEY`
- Model recommendation: `gpt-4o-mini` for cost-effective structured generation

**Implementation Pattern:**
```typescript
import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'

Deno.serve(async (req) => {
  const { steps, title } = await req.json()
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ title, steps }) }
    ],
    response_format: { type: 'json_object' }
  })

  return new Response(completion.choices[0].message.content, {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Decision**: Use `gpt-4o-mini` with JSON response format in Edge Function

**Rationale**:
- `gpt-4o-mini` is cost-effective and fast for structured content
- JSON response format ensures parseable output
- Edge Function keeps API key secure

**Alternatives Considered**:
- `gpt-4` (rejected: higher cost, not needed for this use case)
- `gpt-3.5-turbo` (rejected: less capable for Portuguese content)
- Next.js API route (rejected: Edge Function better for secrets)

---

### 5. PDF Generation

**Library Comparison:**

| Library | Pros | Cons | Server-Side |
|---------|------|------|-------------|
| `@react-pdf/renderer` | React components, good styling | Heavier bundle | Yes |
| `pdf-lib` | Lightweight, pure JS | Lower-level API | Yes |
| `jsPDF` | Simple API, images support | Limited styling | Yes |
| `puppeteer` | Full HTML/CSS support | Heavy, needs Chrome | Yes |

**Decision**: Use `@react-pdf/renderer` in Next.js API route

**Rationale**:
- React components align with existing codebase
- Good image embedding support
- Professional document styling
- Server-side only (no bundle impact)

**Alternatives Considered**:
- `puppeteer` (rejected: too heavy for serverless)
- `jsPDF` (rejected: limited styling for professional documents)
- External service (rejected: adds dependency and cost)

---

### 6. Rate Limiting Implementation

**Decision**: Track generation count in database with daily reset

**Implementation Pattern:**
```sql
-- Add to sop_documents table or separate tracking
ALTER TABLE sop_documents ADD COLUMN generation_count INT DEFAULT 0;
ALTER TABLE sop_documents ADD COLUMN generation_reset_at TIMESTAMPTZ;

-- Check before generation
SELECT generation_count, generation_reset_at FROM sop_documents
WHERE procedure_id = $1;

-- Reset if new day, increment otherwise
UPDATE sop_documents
SET generation_count = CASE
  WHEN generation_reset_at < CURRENT_DATE THEN 1
  ELSE generation_count + 1
END,
generation_reset_at = CURRENT_DATE
WHERE procedure_id = $1;
```

**Rationale**: Simple database counter with date check, no external dependencies

---

## Resolved Clarifications

All technical clarifications from spec have been resolved:

| Topic | Decision |
|-------|----------|
| Document storage | JSON in database, PDF on-demand |
| Rate limiting | 5 generations/SOP/day via DB counter |
| Screenshot auth | Signed URLs, 1-hour expiration |
| Document language | Portuguese (BR) via AI prompt |
| Public screenshots | Copy to public bucket on publish |

## Next Steps

1. **Phase 1**: Create data model for `sop_documents` table
2. **Phase 1**: Define API contracts for signed URLs, document generation, PDF export
3. **Phase 1**: Create quickstart guide for implementation
