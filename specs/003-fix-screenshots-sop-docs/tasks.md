# Tasks: Fix Screenshots Display & SOP Document Generation

**Input**: Design documents from `/specs/003-fix-screenshots-sop-docs/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this feature. Include only if explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## User Story Mapping

| Story | Title | Priority | Description |
|-------|-------|----------|-------------|
| US1 | View Screenshots in SOP Details | P1 | Fix screenshot display in detail view |
| US2 | View Thumbnails in SOP Listing | P1 | Fix thumbnail display in listing |
| US3 | Generate SOP Document with AI | P2 | AI document generation with OpenAI |
| US4 | Edit Generated Document | P3 | Edit and save document modifications |

---

## Phase 1: Setup

**Purpose**: Project dependencies and environment configuration

- [ ] T001 Install @react-pdf/renderer dependency in frontend/package.json
- [ ] T002 [P] Verify OPENAI_API_KEY is configured in backend/.env
- [ ] T003 [P] Verify Supabase storage buckets exist (screenshots, annotated, public, exports)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Migration

- [ ] T004 Create migration file backend/supabase/migrations/007_sop_documents.sql per data-model.md
- [ ] T005 Apply migration with supabase db push

### TypeScript Types

- [ ] T006 Add SOPDocument types to frontend/types/database.ts per data-model.md

### Storage Utilities (Shared by US1 and US2)

- [ ] T007 Create signed URL utility functions in frontend/lib/supabase/storage.ts
- [ ] T008 Create signed URL API route in frontend/app/api/screenshots/signed-url/route.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Screenshots in SOP Details (Priority: P1) 🎯 MVP

**Goal**: Screenshots display correctly in SOP detail view using signed URLs

**Independent Test**: Navigate to any SOP detail page and verify step screenshots are visible

### Investigation (Critical First Step)

- [ ] T009 [US1] Investigate NULL screenshot_url values in extension/src/lib/supabase.ts upload flow
- [ ] T010 [US1] Verify storage bucket RLS policies allow uploads from extension
- [ ] T011 [US1] Fix upload flow if screenshot URLs are not being persisted correctly

### Implementation

- [ ] T012 [US1] Update frontend/lib/procedures/queries.ts getProcedure() to resolve signed URLs for steps
- [ ] T013 [US1] Update frontend/components/procedures/StepCard.tsx to use signed URLs with loading state
- [ ] T014 [US1] Update frontend/components/procedures/ProcedureTimeline.tsx to pass signed URLs to StepCard
- [ ] T015 [US1] Update frontend/components/procedures/ScreenshotModal.tsx to handle signed URLs
- [ ] T016 [US1] Add placeholder component for missing screenshots in frontend/components/procedures/StepCard.tsx
- [ ] T017 [US1] Add error handling for expired/invalid signed URLs with auto-refresh

**Checkpoint**: SOP detail page displays screenshots correctly

---

## Phase 4: User Story 2 - View Thumbnails in SOP Listing (Priority: P1)

**Goal**: Thumbnails display correctly on SOP cards in listing page

**Independent Test**: View dashboard listing and verify all SOP cards show thumbnail images

### Implementation

- [ ] T018 [US2] Update frontend/lib/procedures/queries.ts getProcedures() to resolve signed URLs for thumbnails
- [ ] T019 [US2] Update frontend/components/procedures/ProcedureCard.tsx to use signed URLs
- [ ] T020 [US2] Add placeholder/skeleton for loading thumbnails in ProcedureCard.tsx
- [ ] T021 [US2] Handle missing thumbnail_url with fallback icon in ProcedureCard.tsx

**Checkpoint**: SOP listing shows thumbnails correctly

---

## Phase 5: User Story 3 - Generate SOP Document with AI (Priority: P2)

**Goal**: Users can generate professional SOP documents from procedure steps using AI

**Independent Test**: Click generate button on any SOP with steps and receive a formatted document

### Edge Function

- [ ] T022 [US3] Create Edge Function directory backend/supabase/functions/generate-document/
- [ ] T023 [US3] Implement OpenAI integration in backend/supabase/functions/generate-document/index.ts
- [ ] T024 [US3] Add Portuguese system prompt for document generation
- [ ] T025 [US3] Deploy Edge Function with supabase functions deploy generate-document
- [ ] T026 [US3] Set OPENAI_API_KEY secret with supabase secrets set

### API Routes

- [ ] T027 [P] [US3] Create document generation API in frontend/app/api/documents/generate/route.ts
- [ ] T028 [P] [US3] Create get document API in frontend/app/api/documents/[procedureId]/route.ts
- [ ] T029 [US3] Implement rate limit checking (5/day per procedure) in generate route

### Data Layer

- [ ] T030 [P] [US3] Create document queries in frontend/lib/documents/queries.ts
- [ ] T031 [P] [US3] Create document mutations in frontend/lib/documents/mutations.ts

### UI Components

- [ ] T032 [P] [US3] Create GenerateDocumentButton component in frontend/components/procedures/GenerateDocumentButton.tsx
- [ ] T033 [P] [US3] Create DocumentViewer component in frontend/components/procedures/DocumentViewer.tsx
- [ ] T034 [US3] Create document page in frontend/app/dashboard/procedures/[id]/document/page.tsx
- [ ] T035 [US3] Add generate button to procedure detail page in frontend/app/dashboard/procedures/[id]/page.tsx
- [ ] T036 [US3] Add loading state with progress indicator during generation
- [ ] T037 [US3] Add error handling with retry option for failed generations

**Checkpoint**: Users can generate and view AI-created SOP documents

---

## Phase 6: User Story 3 (continued) - PDF Export

**Goal**: Users can export generated documents as PDF

**Independent Test**: Click export button and download PDF file

### PDF Generation

- [ ] T038 [US3] Create PDF template in frontend/lib/pdf/SOPTemplate.tsx using @react-pdf/renderer
- [ ] T039 [US3] Create PDF export API in frontend/app/api/documents/[id]/export/route.ts
- [ ] T040 [US3] Add export button to DocumentViewer component
- [ ] T041 [US3] Handle image embedding in PDF from signed URLs

**Checkpoint**: Users can export documents as PDF

---

## Phase 7: User Story 4 - Edit Generated Document (Priority: P3)

**Goal**: Users can edit AI-generated content before exporting

**Independent Test**: Edit document content and verify changes are saved

### API Routes

- [ ] T042 [US4] Create document update API in frontend/app/api/documents/[id]/route.ts (PUT method)

### UI Components

- [ ] T043 [US4] Create DocumentEditor component in frontend/components/procedures/DocumentEditor.tsx
- [ ] T044 [US4] Add edit mode toggle to DocumentViewer component
- [ ] T045 [US4] Implement inline editing for document sections (purpose, steps, conclusion)
- [ ] T046 [US4] Add save/cancel buttons with confirmation
- [ ] T047 [US4] Update version number on save per data-model.md

**Checkpoint**: Users can edit and save document changes

---

## Phase 8: Public Screenshots (Enhancement)

**Purpose**: Support public SOPs with accessible screenshots

- [ ] T048 Create copy-to-public API in frontend/app/api/storage/copy-public/route.ts
- [ ] T049 Update frontend/lib/procedures/mutations.ts togglePublicStatus() to trigger copy
- [ ] T050 Update PublicProcedureTimeline to use public bucket URLs

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and cleanup

- [ ] T051 [P] Add loading skeletons for all screenshot displays
- [ ] T052 [P] Add error boundary for document generation failures
- [ ] T053 Review and update Portuguese translations for all new UI elements
- [ ] T054 Run quickstart.md validation checklist
- [ ] T055 Clean up unused code and imports

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
┌───────────────────────────────────┐
│  User Stories can proceed:        │
│                                   │
│  Phase 3 (US1) ─┬─► Phase 4 (US2) │  ← US1 & US2 share signed URL infra
│                 │                  │
│                 └─► Phase 5 (US3) │  ← US3 depends on screenshots working
│                         ↓          │
│                   Phase 6 (PDF)    │
│                         ↓          │
│                   Phase 7 (US4)    │  ← US4 depends on US3
└───────────────────────────────────┘
    ↓
Phase 8 (Public Screenshots)
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Run Parallel With |
|-------|------------|----------------------|
| US1 | Phase 2 (Foundational) | - |
| US2 | US1 (shared signed URL code) | - |
| US3 | US1/US2 (screenshots must work) | - |
| US4 | US3 (needs document to edit) | - |

### Critical Path

1. **T009-T011 (Investigation)**: Must determine if upload is broken before fixing display
2. **T004-T008 (Foundation)**: Blocks all implementation
3. **T012-T017 (US1)**: First visible deliverable
4. **T022-T026 (Edge Function)**: Blocks AI generation features

### Parallel Opportunities

```bash
# Phase 2 - Run in parallel:
T006, T007, T008 can run in parallel after T004-T005

# Phase 5 - Run in parallel:
T027, T028 (API routes)
T030, T031 (Data layer)
T032, T033 (UI components)

# Phase 9 - Run in parallel:
T051, T052, T053
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Screenshot Display)
4. **STOP and VALIDATE**: Verify screenshots appear in detail view
5. This alone delivers significant value by fixing core functionality

### Incremental Delivery

| Increment | Phases | User Value |
|-----------|--------|------------|
| MVP | 1-3 | Screenshots visible in SOP details |
| +Thumbnails | 4 | Visual navigation in listing |
| +AI Docs | 5-6 | Professional document generation + PDF |
| +Editing | 7 | Customizable documents |
| +Public | 8 | Shareable public SOPs |

### Recommended Order

1. **Day 1**: Setup + Foundation + Investigation (T001-T011)
2. **Day 2**: US1 Implementation (T012-T017)
3. **Day 3**: US2 Implementation (T018-T021) + Edge Function (T022-T026)
4. **Day 4**: US3 API & Components (T027-T037)
5. **Day 5**: PDF Export + US4 (T038-T047)
6. **Day 6**: Public Screenshots + Polish (T048-T055)

---

## Task Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Setup | 3 | 2 |
| Foundational | 5 | 0 |
| US1 (P1) | 9 | 0 |
| US2 (P1) | 4 | 0 |
| US3 (P2) | 16 | 8 |
| US4 (P3) | 6 | 0 |
| Public | 3 | 0 |
| Polish | 5 | 3 |
| **Total** | **51** | **13** |

---

## Notes

- Investigation tasks (T009-T011) are critical - may reveal upload bugs
- US1 and US2 share signed URL infrastructure from Foundational phase
- US3 is the largest story with Edge Function, API, and UI work
- US4 depends on US3 being complete
- All tasks include exact file paths for immediate execution
