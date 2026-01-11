# Tasks: Screen Recording & SOP Generation

**Input**: Design documents from `/specs/001-screen-recording-sop/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api.yaml, research.md

**Tests**: Tests are included following TDD workflow as specified in the constitution (Test-Driven Development principle).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Extension**: `extension/src/`
- **Frontend**: `frontend/`
- **Backend**: `backend/supabase/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure, dependencies, and configurations

- [ ] T001 Create extension project with Vite + React + TypeScript in extension/
- [ ] T002 [P] Configure TypeScript strict mode in extension/tsconfig.json
- [ ] T003 [P] Configure ESLint + Prettier in extension/.eslintrc.js and extension/.prettierrc
- [ ] T004 [P] Create Chrome extension manifest v3 in extension/public/manifest.json
- [ ] T005 [P] Configure Vitest for extension testing in extension/vite.config.ts
- [ ] T006 Initialize frontend Next.js 15 project in frontend/ (if not exists)
- [ ] T007 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [ ] T008 [P] Configure ESLint + Prettier in frontend/eslint.config.mjs
- [ ] T009 [P] Install and configure shadcn/ui in frontend/
- [ ] T010 [P] Configure Jest + Playwright in frontend/jest.config.js and frontend/playwright.config.ts
- [ ] T011 Initialize Supabase project in backend/supabase/
- [ ] T012 [P] Create .env.example files in extension/, frontend/, and backend/

**Checkpoint**: All three projects initialized with proper configurations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database & Storage Setup

- [ ] T013 Create users table migration in backend/supabase/migrations/001_users.sql
- [ ] T014 [P] Create procedures table migration in backend/supabase/migrations/002_procedures.sql
- [ ] T015 [P] Create steps table migration in backend/supabase/migrations/003_steps.sql
- [ ] T016 [P] Create credit_usage table migration in backend/supabase/migrations/004_credit_usage.sql
- [ ] T017 Create RLS policies for all tables in backend/supabase/migrations/005_rls_policies.sql
- [ ] T018 [P] Create database functions (generate_slug, increment_views, update_step_count) in backend/supabase/migrations/006_functions.sql
- [ ] T019 [P] Create storage buckets (screenshots, annotated, public, exports) in backend/supabase/migrations/007_storage.sql
- [ ] T020 [P] Create seed data for testing in backend/supabase/seed.sql

### Shared Types & Utilities

- [ ] T021 Create shared TypeScript types in frontend/types/database.ts
- [ ] T022 [P] Create shared TypeScript types in extension/src/types/database.ts
- [ ] T023 [P] Create Supabase client for frontend in frontend/lib/supabase/client.ts
- [ ] T024 [P] Create Supabase server client in frontend/lib/supabase/server.ts
- [ ] T025 [P] Create Supabase client for extension in extension/src/lib/supabase.ts

### Authentication Infrastructure

- [ ] T026 Create auth middleware in frontend/lib/supabase/middleware.ts
- [ ] T027 [P] Create login page in frontend/app/(auth)/login/page.tsx
- [ ] T028 [P] Create signup page in frontend/app/(auth)/signup/page.tsx
- [ ] T029 [P] Create auth callback handler in frontend/app/(auth)/callback/route.ts
- [ ] T030 Create protected layout wrapper in frontend/app/(dashboard)/layout.tsx

### UI Foundation

- [ ] T031 Install shadcn/ui Button component via CLI in frontend/
- [ ] T032 [P] Install shadcn/ui Card component via CLI in frontend/
- [ ] T033 [P] Install shadcn/ui Input component via CLI in frontend/
- [ ] T034 [P] Install shadcn/ui Dialog component via CLI in frontend/
- [ ] T035 [P] Install shadcn/ui Toast component via CLI in frontend/
- [ ] T036 [P] Install shadcn/ui Skeleton component via CLI in frontend/
- [ ] T037 Create loading spinner component in frontend/components/shared/Spinner.tsx
- [ ] T038 [P] Create error boundary component in frontend/components/shared/ErrorBoundary.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Record a Process (Priority: P1)

**Goal**: Users can install extension, start recording browser actions, capture clicks/screenshots, and stop recording

**Independent Test**: User can install extension, start recording, perform browser actions, and stop recording. Recording data is saved successfully.

### Tests for User Story 1

- [ ] T039 [P] [US1] Unit test for screenshot capture in extension/tests/unit/screenshot.test.ts
- [ ] T040 [P] [US1] Unit test for DOM event recorder in extension/tests/unit/recorder.test.ts
- [ ] T041 [P] [US1] Unit test for Chrome storage wrapper in extension/tests/unit/storage.test.ts
- [ ] T042 [P] [US1] Integration test for recording flow in extension/tests/integration/recording.test.ts

### Extension Background (Service Worker)

- [ ] T043 [US1] Create service worker entry in extension/src/background/index.ts
- [ ] T044 [US1] Implement recording state management in extension/src/background/recordingState.ts
- [ ] T045 [US1] Implement message handlers (start/stop/status) in extension/src/background/messageHandlers.ts
- [ ] T046 [US1] Implement badge/icon state updates in extension/src/background/badgeManager.ts

### Extension Content Scripts

- [ ] T047 [US1] Create click event recorder in extension/src/content/recorder.ts
- [ ] T048 [US1] Implement element selector generator in extension/src/content/selectorGenerator.ts
- [ ] T049 [US1] Create visual recording indicator overlay in extension/src/content/recordingIndicator.ts
- [ ] T050 [US1] Implement sensitive field detection (password, etc.) in extension/src/content/privacyFilter.ts

### Extension Utilities

- [ ] T051 [US1] Create screenshot capture utility in extension/src/lib/screenshot.ts
- [ ] T052 [US1] Create image compression utility in extension/src/lib/imageCompressor.ts
- [ ] T053 [US1] Create Chrome storage wrapper in extension/src/lib/storage.ts
- [ ] T054 [US1] Create IndexedDB manager for offline storage in extension/src/lib/indexedDB.ts

### Extension Popup UI

- [ ] T055 [US1] Create popup App component in extension/src/popup/App.tsx
- [ ] T056 [US1] Create RecordingButton component in extension/src/popup/components/RecordingButton.tsx
- [ ] T057 [US1] Create RecordingStatus component in extension/src/popup/components/RecordingStatus.tsx
- [ ] T058 [US1] Create StepCounter component in extension/src/popup/components/StepCounter.tsx
- [ ] T059 [US1] Create useRecording hook in extension/src/popup/hooks/useRecording.ts
- [ ] T060 [US1] Style popup with Tailwind in extension/src/popup/styles.css

**Checkpoint**: User Story 1 complete - users can record browser actions with the extension

---

## Phase 4: User Story 2 - Generate SOP from Recording (Priority: P1)

**Goal**: Users can trigger AI processing of recordings to generate structured SOP documents in Portuguese

**Independent Test**: User can select a completed recording and trigger SOP generation. AI processes the data and returns a structured document within 60 seconds.

### Tests for User Story 2

- [ ] T061 [P] [US2] Unit test for AI prompt builder in backend/supabase/functions/process-procedure/promptBuilder.test.ts
- [ ] T062 [P] [US2] Unit test for image annotation in backend/supabase/functions/annotate-screenshot/annotate.test.ts
- [ ] T063 [P] [US2] Integration test for procedure processing in frontend/tests/integration/procedureProcessing.test.ts

### Backend Edge Functions

- [ ] T064 [US2] Create process-procedure Edge Function in backend/supabase/functions/process-procedure/index.ts
- [ ] T065 [US2] Implement OpenAI GPT-4 integration in backend/supabase/functions/process-procedure/openai.ts
- [ ] T066 [US2] Create prompt templates for PT-BR SOP generation in backend/supabase/functions/process-procedure/prompts.ts
- [ ] T067 [US2] Implement progress tracking updates in backend/supabase/functions/process-procedure/progress.ts
- [ ] T068 [US2] Create annotate-screenshot Edge Function in backend/supabase/functions/annotate-screenshot/index.ts
- [ ] T069 [US2] Implement Sharp.js image annotation (circles, arrows) in backend/supabase/functions/annotate-screenshot/annotate.ts
- [ ] T070 [US2] Implement credit checking and deduction in backend/supabase/functions/process-procedure/credits.ts

### Extension - Upload & Trigger

- [ ] T071 [US2] Create screenshot upload service in extension/src/lib/uploadService.ts
- [ ] T072 [US2] Create procedure creation API client in extension/src/lib/procedureApi.ts
- [ ] T073 [US2] Add "Generate SOP" button to popup in extension/src/popup/components/GenerateButton.tsx
- [ ] T074 [US2] Create processing status component in extension/src/popup/components/ProcessingStatus.tsx
- [ ] T075 [US2] Implement upload progress indicator in extension/src/popup/components/UploadProgress.tsx

### Frontend - SOP Viewer

- [ ] T076 [US2] Create procedure detail page in frontend/app/(dashboard)/procedures/[id]/page.tsx
- [ ] T077 [US2] Create SOPViewer component in frontend/components/editor/SOPViewer.tsx
- [ ] T078 [US2] Create StepCard component in frontend/components/editor/StepCard.tsx
- [ ] T079 [US2] Create ProcessingProgress component in frontend/components/dashboard/ProcessingProgress.tsx
- [ ] T080 [US2] Implement Supabase Realtime subscription for progress in frontend/hooks/useProcedureProgress.ts

**Checkpoint**: User Story 2 complete - users can generate AI-powered SOPs from recordings

---

## Phase 5: User Story 3 - Edit and Refine SOP (Priority: P2)

**Goal**: Users can edit AI-generated content, reorder steps, delete steps, with auto-save

**Independent Test**: User can open generated SOP in editor, modify any text field, reorder steps, and save changes with auto-save.

### Tests for User Story 3

- [ ] T081 [P] [US3] Unit test for auto-save debounce in frontend/tests/unit/autoSave.test.ts
- [ ] T082 [P] [US3] Unit test for drag-and-drop reorder in frontend/tests/unit/reorder.test.ts
- [ ] T083 [P] [US3] Integration test for editing flow in frontend/tests/integration/editing.test.ts

### Frontend - Editor Components

- [ ] T084 [US3] Create editable procedure title component in frontend/components/editor/EditableTitle.tsx
- [ ] T085 [US3] Create editable step description component in frontend/components/editor/EditableDescription.tsx
- [ ] T086 [US3] Implement inline editing with contentEditable in frontend/components/editor/InlineEdit.tsx
- [ ] T087 [US3] Create drag-and-drop step list with @dnd-kit in frontend/components/editor/DraggableStepList.tsx
- [ ] T088 [US3] Create step delete confirmation dialog in frontend/components/editor/DeleteStepDialog.tsx
- [ ] T089 [US3] Create auto-save indicator component in frontend/components/editor/AutoSaveIndicator.tsx

### Frontend - Editor Hooks & Services

- [ ] T090 [US3] Create useAutoSave hook with debounce in frontend/hooks/useAutoSave.ts
- [ ] T091 [US3] Create useProcedure hook for data fetching in frontend/hooks/useProcedure.ts
- [ ] T092 [US3] Create procedure update service in frontend/lib/services/procedureService.ts
- [ ] T093 [US3] Create step update/delete/reorder service in frontend/lib/services/stepService.ts

### Frontend - Editor Page

- [ ] T094 [US3] Create procedure edit page in frontend/app/(dashboard)/procedures/[id]/edit/page.tsx
- [ ] T095 [US3] Integrate all editor components in frontend/components/editor/ProcedureEditor.tsx

**Checkpoint**: User Story 3 complete - users can edit and refine SOPs with auto-save

---

## Phase 6: User Story 4 - Export and Share SOP (Priority: P2)

**Goal**: Users can export SOPs to PDF and generate shareable public links

**Independent Test**: User can export a completed SOP to PDF format and generate a shareable public link that displays content to anyone.

### Tests for User Story 4

- [ ] T096 [P] [US4] Unit test for PDF generation in backend/supabase/functions/generate-pdf/pdf.test.ts
- [ ] T097 [P] [US4] Unit test for share link generation in backend/supabase/functions/share-procedure/share.test.ts
- [ ] T098 [P] [US4] E2E test for public SOP view in frontend/tests/e2e/publicView.spec.ts

### Backend - PDF & Sharing Functions

- [ ] T099 [US4] Create generate-pdf Edge Function in backend/supabase/functions/generate-pdf/index.ts
- [ ] T100 [US4] Implement PDF layout with @react-pdf/renderer in backend/supabase/functions/generate-pdf/pdfTemplate.tsx
- [ ] T101 [US4] Create share-procedure Edge Function in backend/supabase/functions/share-procedure/index.ts
- [ ] T102 [US4] Create increment-views Edge Function in backend/supabase/functions/increment-views/index.ts

### Frontend - Export UI

- [ ] T103 [US4] Create ExportButton component in frontend/components/editor/ExportButton.tsx
- [ ] T104 [US4] Create ExportDialog with format options in frontend/components/editor/ExportDialog.tsx
- [ ] T105 [US4] Create download service for PDF in frontend/lib/services/exportService.ts

### Frontend - Share UI

- [ ] T106 [US4] Create ShareButton component in frontend/components/editor/ShareButton.tsx
- [ ] T107 [US4] Create ShareDialog with copy link in frontend/components/editor/ShareDialog.tsx
- [ ] T108 [US4] Create share service in frontend/lib/services/shareService.ts

### Frontend - Public View

- [ ] T109 [US4] Create public SOP view page in frontend/app/p/[slug]/page.tsx
- [ ] T110 [US4] Create PublicSOPViewer component in frontend/components/public/PublicSOPViewer.tsx
- [ ] T111 [US4] Create PublicStepCard component in frontend/components/public/PublicStepCard.tsx
- [ ] T112 [US4] Implement view count increment on page load in frontend/app/p/[slug]/page.tsx

**Checkpoint**: User Story 4 complete - users can export PDFs and share SOPs via public links

---

## Phase 7: User Story 5 - Manage SOPs in Dashboard (Priority: P3)

**Goal**: Users can view, search, filter, and manage all their SOPs in a central dashboard

**Independent Test**: User can access dashboard, see list of all SOPs, search/filter, duplicate, and delete SOPs.

### Tests for User Story 5

- [ ] T113 [P] [US5] Unit test for search/filter logic in frontend/tests/unit/procedureFilter.test.ts
- [ ] T114 [P] [US5] Integration test for dashboard list in frontend/tests/integration/dashboard.test.ts
- [ ] T115 [P] [US5] E2E test for dashboard flow in frontend/tests/e2e/dashboard.spec.ts

### Frontend - Dashboard Components

- [ ] T116 [US5] Create dashboard page in frontend/app/(dashboard)/page.tsx
- [ ] T117 [US5] Create ProcedureList component in frontend/components/dashboard/ProcedureList.tsx
- [ ] T118 [US5] Create ProcedureCard component in frontend/components/dashboard/ProcedureCard.tsx
- [ ] T119 [US5] Create SearchInput component in frontend/components/dashboard/SearchInput.tsx
- [ ] T120 [US5] Create FilterDropdown component in frontend/components/dashboard/FilterDropdown.tsx
- [ ] T121 [US5] Create EmptyState component in frontend/components/dashboard/EmptyState.tsx
- [ ] T122 [US5] Create ProcedureCardSkeleton component in frontend/components/dashboard/ProcedureCardSkeleton.tsx

### Frontend - Dashboard Actions

- [ ] T123 [US5] Create ProcedureOptionsMenu component in frontend/components/dashboard/ProcedureOptionsMenu.tsx
- [ ] T124 [US5] Create DeleteProcedureDialog component in frontend/components/dashboard/DeleteProcedureDialog.tsx
- [ ] T125 [US5] Create DuplicateProcedureDialog component in frontend/components/dashboard/DuplicateProcedureDialog.tsx
- [ ] T126 [US5] Create ViewAnalyticsPopover component in frontend/components/dashboard/ViewAnalyticsPopover.tsx

### Frontend - Dashboard Hooks

- [ ] T127 [US5] Create useProcedures hook for list fetching in frontend/hooks/useProcedures.ts
- [ ] T128 [US5] Create useProcedureSearch hook in frontend/hooks/useProcedureSearch.ts
- [ ] T129 [US5] Create procedure list service in frontend/lib/services/procedureListService.ts

**Checkpoint**: User Story 5 complete - users can manage all SOPs from a central dashboard

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance Optimization

- [ ] T130 [P] Implement image lazy loading in frontend/components/editor/StepCard.tsx
- [ ] T131 [P] Add React.memo to expensive components in frontend/components/
- [ ] T132 [P] Implement virtual scrolling for long SOP lists in frontend/components/dashboard/ProcedureList.tsx
- [ ] T133 [P] Optimize bundle with dynamic imports in frontend/app/(dashboard)/procedures/[id]/edit/page.tsx

### Error Handling & Edge Cases

- [ ] T134 Create global error handler in frontend/app/error.tsx
- [ ] T135 [P] Create network error retry logic in frontend/lib/utils/retry.ts
- [ ] T136 [P] Implement offline detection in extension/src/lib/networkStatus.ts
- [ ] T137 [P] Add step limit warning (50 steps) in extension/src/popup/components/StepLimitWarning.tsx

### Accessibility

- [ ] T138 [P] Add ARIA labels to all interactive elements in frontend/components/
- [ ] T139 [P] Implement keyboard navigation for editor in frontend/components/editor/
- [ ] T140 [P] Add focus management for dialogs in frontend/components/shared/

### Documentation & Quality

- [ ] T141 [P] Create extension README in extension/README.md
- [ ] T142 [P] Create frontend README in frontend/README.md
- [ ] T143 Run full E2E test suite validation
- [ ] T144 Run Lighthouse performance audit on dashboard
- [ ] T145 Run quickstart.md validation (follow all steps)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs recordings to process)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (needs generated SOPs to edit)
- **User Story 4 (Phase 6)**: Depends on User Story 2 (needs generated SOPs to export/share)
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) - can run parallel to US3/US4
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
                    ┌─────────────────┐
                    │ Phase 1: Setup  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Phase 2: Found. │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐     │     ┌────────▼────────┐
     │  US1: Record    │     │     │  US5: Dashboard │
     │    (P1)         │     │     │    (P3)         │
     └────────┬────────┘     │     └─────────────────┘
              │              │
     ┌────────▼────────┐     │
     │  US2: Generate  │     │
     │    (P1)         │     │
     └────────┬────────┘     │
              │              │
     ┌────────┴────────┐     │
     │                 │     │
┌────▼────┐      ┌─────▼─────┐
│US3: Edit│      │US4: Export│
│  (P2)   │      │   (P2)    │
└────┬────┘      └─────┬─────┘
     │                 │
     └────────┬────────┘
              │
     ┌────────▼────────┐
     │ Phase 8: Polish │
     └─────────────────┘
```

### Parallel Opportunities

**Phase 1 (Setup)**: T002-T005, T007-T010, T012 can all run in parallel

**Phase 2 (Foundational)**:
- T014-T016 (table migrations) can run in parallel
- T017-T020 (functions/storage) can run in parallel after tables
- T021-T025 (types/clients) can run in parallel
- T027-T029 (auth pages) can run in parallel
- T031-T038 (UI components) can run in parallel

**Phase 3 (US1)**: T039-T042 (tests) can run in parallel

**Phase 4 (US2)**: T061-T063 (tests) can run in parallel

**User Stories US3, US4, US5**: Can run in parallel after their dependencies are met

---

## Parallel Example: Phase 2 - Foundational

```bash
# Wave 1: Database tables (parallel)
Task T013: Create users table migration
Task T014: Create procedures table migration
Task T015: Create steps table migration
Task T016: Create credit_usage table migration

# Wave 2: After tables complete (parallel)
Task T017: Create RLS policies
Task T018: Create database functions
Task T019: Create storage buckets
Task T020: Create seed data

# Wave 3: Types and clients (parallel)
Task T021: Create shared types (frontend)
Task T022: Create shared types (extension)
Task T023: Create Supabase client (frontend)
Task T024: Create Supabase server client
Task T025: Create Supabase client (extension)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Recording)
4. **STOP and VALIDATE**: Test recording independently
5. Complete Phase 4: User Story 2 (Generation)
6. **STOP and VALIDATE**: Test full recording → generation flow
7. Deploy/demo MVP!

### Incremental Delivery

1. **MVP (US1 + US2)**: Record and Generate - core value proposition
2. **+US3 (Edit)**: Refine generated content
3. **+US4 (Export/Share)**: Distribute documentation
4. **+US5 (Dashboard)**: Organize documentation library
5. **Polish**: Performance, accessibility, edge cases

### Task Counts by Phase

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| Phase 1 | Setup | 12 | 9 |
| Phase 2 | Foundational | 26 | 18 |
| Phase 3 | US1 - Record | 22 | 4 |
| Phase 4 | US2 - Generate | 20 | 3 |
| Phase 5 | US3 - Edit | 15 | 3 |
| Phase 6 | US4 - Export/Share | 17 | 3 |
| Phase 7 | US5 - Dashboard | 17 | 3 |
| Phase 8 | Polish | 16 | 12 |
| **Total** | | **145** | **55** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
