# Implementation Plan: Save SOP Recordings

**Branch**: `002-save-sop-recordings` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-save-sop-recordings/spec.md`

## Summary

Implement the save and view functionality for SOP recordings. The extension already captures clicks and screenshots - this feature adds persistent storage to Supabase and a frontend dashboard to list, view, edit, delete, and share recordings. Key components: sync mechanism in extension, recordings list page with pagination/search, procedure detail page with vertical timeline, and public sharing via slug.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**:
- Frontend: Next.js 16.1.1, React 19.2.3, Tailwind CSS 4, Supabase SSR 0.6.1, Radix UI, Lucide React
- Extension: Vite 7.2.4, React 19.2.0, Supabase JS 2.49.0, Vitest 3.2.4
**Storage**: PostgreSQL (Supabase) with existing `procedures` and `steps` tables, Supabase Storage buckets
**Testing**: Vitest (extension), Jest + Playwright (frontend - to configure)
**Target Platform**: Web (Next.js dashboard), Chrome Extension (Manifest V3)
**Project Type**: Web application (frontend + backend + extension)
**Performance Goals**:
- Save recording < 10s for 50 steps
- List page load < 3s
- Detail page load < 3s
- API p95 < 500ms reads, < 2s writes
**Constraints**:
- Screenshots < 200KB each (compression already in place)
- Bundle < 300KB dashboard, < 100KB extension
- Offline-capable with sync on reconnection
**Scale/Scope**: 100 steps max per recording, 20 items per page pagination

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality First
- [x] TypeScript strict mode enabled for all new code
- [x] ESLint/Prettier configurations applied
- [x] No `any` types without documented justification
- [x] Cyclomatic complexity ≤10 per function planned

### II. Test-Driven Development
- [x] Test strategy defined (unit, integration, E2E scope)
- [x] Coverage target ≥80% for business logic
- [x] Critical user flows identified for E2E tests
- [x] TDD workflow (Red-Green-Refactor) will be followed

### III. UX Consistency
- [x] Design system components identified/planned
- [x] Loading and error states considered
- [x] Accessibility requirements (WCAG 2.1 AA) acknowledged
- [x] Brazilian Portuguese copy reviewed

### IV. Performance by Design
- [x] Performance budgets acknowledged (FCP <1.5s, TTI <3s for web)
- [x] API response time targets set (p95 <500ms reads, <2s writes)
- [x] Image optimization strategy defined (<200KB per screenshot)
- [x] Bundle size impact considered (<300KB dashboard, <100KB extension)

## Project Structure

### Documentation (this feature)

```text
specs/002-save-sop-recordings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                    # Dashboard/recordings list (to modify)
│   │   └── procedures/
│   │       ├── [id]/
│   │       │   └── page.tsx            # Procedure detail (to modify)
│   │       └── new/                    # New procedure flow (exists)
│   └── p/
│       └── [slug]/
│           └── page.tsx                # Public view (to create)
├── components/
│   ├── procedures/                     # (to create)
│   │   ├── ProcedureCard.tsx          # List item card
│   │   ├── ProcedureList.tsx          # Paginated list
│   │   ├── ProcedureTimeline.tsx      # Vertical timeline
│   │   ├── StepCard.tsx               # Individual step in timeline
│   │   ├── ShareDialog.tsx            # Share/public link modal
│   │   ├── DeleteConfirmDialog.tsx    # Delete confirmation
│   │   └── EmptyState.tsx             # No recordings state
│   └── ui/                             # Existing shadcn components
├── lib/
│   ├── supabase/
│   │   ├── server.ts                   # Server client (exists)
│   │   └── client.ts                   # Browser client (exists)
│   └── procedures/                     # (to create)
│       ├── queries.ts                  # Data fetching functions
│       └── mutations.ts                # Create/update/delete
└── types/
    └── database.ts                     # Supabase types (exists)

extension/
├── src/
│   ├── background/
│   │   ├── index.ts                    # Service worker (to modify)
│   │   └── syncService.ts              # (to create) Sync logic
│   ├── lib/
│   │   └── supabase.ts                 # Supabase helpers (to modify)
│   └── types/
│       └── database.ts                 # Types (exists)
└── tests/
    └── syncService.test.ts             # (to create)

backend/
└── supabase/
    └── functions/                      # Edge functions (if needed)
```

**Structure Decision**: Web application with existing frontend/, extension/, and backend/ directories. New components go in frontend/components/procedures/. Data access layer in frontend/lib/procedures/. Extension sync service in extension/src/background/syncService.ts.

## Complexity Tracking

No constitution violations identified. Implementation uses existing patterns and infrastructure.
