# Implementation Plan: Screen Recording & SOP Generation

**Branch**: `001-screen-recording-sop` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-screen-recording-sop/spec.md`

## Summary

Build a Chrome extension that captures user screen activity (clicks, screenshots) during browser tasks, then uses AI to automatically generate professional Standard Operating Procedure (SOP) documents in Brazilian Portuguese. The system includes a web dashboard for managing, editing, and sharing SOPs.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**:
- Extension: React 18, Vite 5, Chrome Extension Manifest V3
- Dashboard/Landing: Next.js 15, Tailwind CSS, shadcn/ui
- Backend: Supabase (Edge Functions, Auth, Storage, PostgreSQL)
- AI: OpenAI GPT-4 API (via Supabase Edge Functions)
- PDF Generation: @react-pdf/renderer or jsPDF

**Storage**: Supabase PostgreSQL + Supabase Storage (for screenshots)
**Testing**: Vitest (extension), Jest + Playwright (dashboard), Testing Library
**Target Platform**: Chrome browser (extension), Web (dashboard)
**Project Type**: Web application (extension + frontend + backend)

**Performance Goals**:
- Extension popup load: <500ms
- Recording start: <200ms
- SOP generation: <60s for 20 steps
- Dashboard FCP: <1.5s, TTI: <3s
- Shared SOP page load: <3s

**Constraints**:
- Extension bundle: <100KB gzipped
- Dashboard bundle: <300KB gzipped
- Screenshots: <200KB each (compressed)
- Extension memory: <50MB RAM
- API p95: <500ms reads, <2s writes

**Scale/Scope**: 1,000 concurrent users, MVP with 5 user stories

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
specs/001-screen-recording-sop/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
extension/                    # Chrome Extension (React + Vite + TypeScript)
├── src/
│   ├── background/          # Service Worker (Manifest V3)
│   │   └── index.ts
│   ├── content/             # Content Scripts
│   │   ├── recorder.ts      # DOM event capture
│   │   └── annotator.ts     # Visual feedback overlay
│   ├── popup/               # Extension Popup UI
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── lib/                 # Shared utilities
│   │   ├── storage.ts       # Chrome storage wrapper
│   │   ├── screenshot.ts    # Screenshot capture
│   │   └── supabase.ts      # Supabase client
│   └── types/               # TypeScript types
├── public/
│   └── manifest.json        # Manifest V3
├── tests/
│   ├── unit/
│   └── integration/
├── vite.config.ts
├── tsconfig.json
└── package.json

frontend/                     # Next.js 15 Dashboard + Landing
├── app/
│   ├── (marketing)/         # Public pages (landing, pricing)
│   │   ├── page.tsx         # Landing page
│   │   └── pricing/
│   ├── (auth)/              # Auth pages
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Protected dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx         # SOP list
│   │   ├── procedures/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx # Editor
│   │   │   │   └── edit/
│   │   │   └── new/
│   │   └── settings/
│   ├── p/[slug]/            # Public SOP view
│   │   └── page.tsx
│   └── api/                 # API routes (if needed)
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── landing/             # Landing page components
│   ├── dashboard/           # Dashboard components
│   ├── editor/              # SOP editor components
│   └── shared/              # Shared components
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json

backend/                      # Supabase Configuration
├── supabase/
│   ├── config.toml
│   ├── migrations/          # Database migrations
│   │   ├── 001_users.sql
│   │   ├── 002_procedures.sql
│   │   └── 003_steps.sql
│   ├── functions/           # Edge Functions
│   │   ├── process-procedure/
│   │   │   └── index.ts     # AI SOP generation
│   │   ├── generate-pdf/
│   │   │   └── index.ts     # PDF export
│   │   └── annotate-screenshot/
│   │       └── index.ts     # Image annotation
│   └── seed.sql             # Test data
└── .env.example
```

**Structure Decision**: Web application with 3 modules - Chrome extension (Vite), Next.js frontend, and Supabase backend. This matches the constitution's code organization requirements and the user's specified technology stack.

## Complexity Tracking

> No constitution violations identified. Structure follows approved patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
