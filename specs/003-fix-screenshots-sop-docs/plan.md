# Implementation Plan: Fix Screenshots Display & SOP Document Generation

**Branch**: `003-fix-screenshots-sop-docs` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-fix-screenshots-sop-docs/spec.md`

## Summary

This feature addresses two critical needs:

1. **Screenshot Display Fix (P1)**: Screenshots are not appearing in SOP detail views or as thumbnails in listings. The root cause is likely missing signed URL generation for private Supabase Storage buckets. Implementation requires adding server-side signed URL generation with 1-hour expiration.

2. **SOP Document Generation (P2)**: Enable AI-powered generation of professional SOP documents from recorded steps using OpenAI API. Documents will be stored as structured JSON in a new database table, with on-demand PDF export.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.1.1, React 19.2.3, Supabase JS 2.49.0, OpenAI API (to be added), PDF generation library (to be selected)
**Storage**: PostgreSQL (Supabase) + Supabase Storage (screenshots, annotated, public, exports buckets)
**Testing**: Vitest (extension), Jest/Playwright (to be configured for frontend)
**Target Platform**: Web (Next.js), Chrome Extension (Manifest v3)
**Project Type**: Web application (frontend + backend + extension)
**Performance Goals**:
- Screenshot signed URL generation: <100ms
- SOP document generation: <30s for 20 steps
- PDF export: <5s
- API endpoints: p95 <500ms reads, <2s writes
**Constraints**:
- Screenshots <200KB each (already compressed)
- Rate limit: 5 AI generations per SOP per day
- Documents in Brazilian Portuguese
**Scale/Scope**: Individual user SOPs, up to 50 steps per procedure

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality First
- [x] TypeScript strict mode enabled for all new code
- [x] ESLint/Prettier configurations applied
- [x] No `any` types without documented justification
- [x] Cyclomatic complexity ≤10 per function planned

### II. Test-Driven Development
- [x] Test strategy defined (unit, integration, E2E scope)
  - Unit tests for signed URL generation, document generation logic
  - Integration tests for API endpoints
  - E2E tests for screenshot display and document generation flows
- [x] Coverage target ≥80% for business logic
- [x] Critical user flows identified for E2E tests
  - View SOP details with screenshots
  - View SOP listing with thumbnails
  - Generate SOP document
  - Export document to PDF
- [x] TDD workflow (Red-Green-Refactor) will be followed

### III. UX Consistency
- [x] Design system components identified/planned
  - Existing: StepCard, ProcedureCard, ScreenshotModal
  - New: DocumentViewer, DocumentEditor, GenerateButton with counter
- [x] Loading and error states considered
  - Skeleton loaders for screenshots
  - Progress indicator for AI generation
  - Error messages in Portuguese with retry options
- [x] Accessibility requirements (WCAG 2.1 AA) acknowledged
- [x] Brazilian Portuguese copy reviewed

### IV. Performance by Design
- [x] Performance budgets acknowledged (FCP <1.5s, TTI <3s for web)
- [x] API response time targets set (p95 <500ms reads, <2s writes)
- [x] Image optimization strategy defined (<200KB per screenshot)
  - Existing compression in extension
  - Signed URLs with caching headers
- [x] Bundle size impact considered (<300KB dashboard, <100KB extension)
  - OpenAI calls server-side only
  - PDF generation on-demand via API

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-screenshots-sop-docs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── supabase/
│   ├── migrations/
│   │   ├── 007_sop_documents.sql    # New table for generated documents
│   │   └── 008_generation_limits.sql # Rate limiting tracking
│   └── functions/
│       ├── generate-document/       # OpenAI integration Edge Function
│       └── export-pdf/              # PDF generation Edge Function

frontend/
├── app/
│   ├── api/
│   │   ├── screenshots/
│   │   │   └── signed-url/route.ts  # Signed URL generation endpoint
│   │   ├── documents/
│   │   │   ├── generate/route.ts    # AI document generation
│   │   │   └── export/route.ts      # PDF export
│   │   └── storage/
│   │       └── copy-public/route.ts # Copy screenshots to public bucket
│   └── dashboard/
│       └── procedures/
│           └── [id]/
│               └── document/        # Document viewer/editor page
├── components/
│   └── procedures/
│       ├── StepCard.tsx             # Update for signed URLs
│       ├── ProcedureCard.tsx        # Update for signed URLs
│       ├── DocumentViewer.tsx       # New component
│       ├── DocumentEditor.tsx       # New component
│       └── GenerateDocumentButton.tsx # New component
├── lib/
│   ├── supabase/
│   │   └── storage.ts               # New: signed URL utilities
│   ├── procedures/
│   │   └── queries.ts               # Update for signed URLs
│   └── documents/
│       ├── queries.ts               # New: document queries
│       └── mutations.ts             # New: document mutations
└── types/
    └── database.ts                  # Update with SOPDocument type

extension/
└── src/lib/
    └── supabase.ts                  # Update for public bucket handling
```

**Structure Decision**: Web application structure with frontend (Next.js), backend (Supabase), and extension. New files follow existing patterns. Backend uses Supabase Edge Functions for AI and PDF processing to keep secrets server-side.

## Complexity Tracking

> No constitution violations identified. All changes follow existing patterns.

| Component | Complexity | Notes |
|-----------|------------|-------|
| Signed URL generation | Low | Standard Supabase Storage API |
| OpenAI integration | Medium | New Edge Function, prompt engineering |
| PDF generation | Medium | New dependency, server-side only |
| Document versioning | Low | Simple JSON updates with version increment |
| Rate limiting | Low | Counter in database, check before generation |
