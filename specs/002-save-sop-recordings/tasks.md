# Tasks: Save SOP Recordings

**Input**: Design documents from `/specs/002-save-sop-recordings/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Following TDD approach as per constitution. Tests are included for business logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/` (Next.js dashboard)
- **Extension**: `extension/` (Chrome extension)
- **Backend**: `backend/supabase/` (Supabase configuration)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared components setup

- [x] T001 Create procedures directory structure in frontend/components/procedures/
- [x] T002 Create procedures data access directory in frontend/lib/procedures/
- [x] T003 [P] Verify TypeScript types for Procedure and Step exist in frontend/types/database.ts
- [x] T004 [P] Verify TypeScript types for CapturedStep exist in extension/src/types/database.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create getProcedures query function in frontend/lib/procedures/queries.ts
- [x] T006 [P] Create getProcedure query function in frontend/lib/procedures/queries.ts
- [x] T007 [P] Create getPublicProcedure query function in frontend/lib/procedures/queries.ts
- [x] T008 Create createProcedure mutation function in frontend/lib/procedures/mutations.ts
- [x] T009 [P] Create updateProcedure mutation function in frontend/lib/procedures/mutations.ts
- [x] T010 [P] Create deleteProcedure mutation function in frontend/lib/procedures/mutations.ts
- [x] T011 [P] Create generatePublicSlug mutation function in frontend/lib/procedures/mutations.ts
- [x] T012 Create EmptyState component in frontend/components/procedures/EmptyState.tsx
- [x] T013 [P] Create error handling utility with Portuguese messages in frontend/lib/procedures/errors.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Save Recording When Finished (Priority: P1) 🎯 MVP

**Goal**: Enable users to save recordings from extension to Supabase with all steps and screenshots

**Independent Test**: Record a procedure in extension, click Stop/Save, verify recording appears in dashboard with all steps intact

### Tests for User Story 1

- [ ] T014 [P] [US1] Create syncService unit tests in extension/tests/syncService.test.ts
- [ ] T015 [P] [US1] Create uploadScreenshot unit tests in extension/tests/supabase.test.ts

### Implementation for User Story 1

- [x] T016 [P] [US1] Create SyncProgress interface and types in extension/src/types/sync.ts
- [x] T017 [US1] Create syncRecording function with batch upload in extension/src/background/syncService.ts
- [x] T018 [US1] Add uploadScreenshotBatch function to extension/src/lib/supabase.ts
- [x] T019 [US1] Add createStepsBatch function to extension/src/lib/supabase.ts
- [x] T020 [US1] Integrate syncService with STOP_RECORDING handler in extension/src/background/index.ts
- [x] T021 [US1] Add progress callback to popup via message passing in extension/src/background/messageHandlers.ts
- [x] T022 [US1] Create SyncProgress UI component in extension/src/popup/components/SyncProgress.tsx
- [x] T023 [US1] Add offline queue with retry logic in extension/src/background/syncService.ts
- [x] T024 [US1] Add online/offline event listeners for auto-sync in extension/src/background/index.ts

**Checkpoint**: Extension can save recordings to Supabase. Test by recording and stopping.

---

## Phase 4: User Story 2 - View Saved Recordings List (Priority: P1)

**Goal**: Display paginated list of user's saved recordings in dashboard

**Independent Test**: Navigate to dashboard after saving recordings, verify list shows all saved SOPs with metadata

### Implementation for User Story 2

- [x] T025 [P] [US2] Create ProcedureCard component in frontend/components/procedures/ProcedureCard.tsx
- [x] T026 [P] [US2] Create Pagination component in frontend/components/procedures/Pagination.tsx
- [x] T027 [P] [US2] Create SearchInput component in frontend/components/procedures/SearchInput.tsx
- [x] T028 [US2] Create ProcedureList component with pagination in frontend/components/procedures/ProcedureList.tsx
- [x] T029 [US2] Update dashboard page to fetch and display procedures in frontend/app/(dashboard)/page.tsx
- [x] T030 [US2] Add URL search params for page and search state in frontend/app/(dashboard)/page.tsx
- [x] T031 [US2] Add loading skeleton states for list in frontend/components/procedures/ProcedureListSkeleton.tsx
- [x] T032 [US2] Integrate EmptyState component when no recordings exist in frontend/app/(dashboard)/page.tsx

**Checkpoint**: Dashboard shows paginated list of recordings with search. Test by navigating to dashboard.

---

## Phase 5: User Story 3 - View Individual Recording Details (Priority: P1)

**Goal**: Display recording details with vertical timeline of steps and screenshots

**Independent Test**: Click on a recording from list, verify detail page shows timeline with all steps and screenshots

### Implementation for User Story 3

- [x] T033 [P] [US3] Create StepCard component with screenshot and metadata in frontend/components/procedures/StepCard.tsx
- [x] T034 [P] [US3] Create ScreenshotModal component for full-size view in frontend/components/procedures/ScreenshotModal.tsx
- [x] T035 [US3] Create ProcedureTimeline component (vertical layout) in frontend/components/procedures/ProcedureTimeline.tsx
- [x] T036 [US3] Create ProcedureHeader component with title and metadata in frontend/components/procedures/ProcedureHeader.tsx
- [x] T037 [US3] Update procedure detail page to fetch and display timeline in frontend/app/(dashboard)/procedures/[id]/page.tsx
- [x] T038 [US3] Add lazy loading for screenshots with blur placeholder in frontend/components/procedures/StepCard.tsx
- [x] T039 [US3] Add loading skeleton for detail page in frontend/components/procedures/ProcedureDetailSkeleton.tsx

**Checkpoint**: Detail page shows vertical timeline with screenshots. Test by clicking a recording.

---

## Phase 6: User Story 4 - Edit Recording Metadata (Priority: P2)

**Goal**: Allow users to edit title and description of saved recordings

**Independent Test**: Open a recording, edit title/description, save, verify changes persist after page refresh

### Implementation for User Story 4

- [x] T040 [P] [US4] Create EditableTitle component with inline editing in frontend/components/procedures/EditableTitle.tsx
- [x] T041 [P] [US4] Create EditableDescription component in frontend/components/procedures/EditableDescription.tsx
- [x] T042 [US4] Add edit mode state and handlers to ProcedureHeader in frontend/components/procedures/ProcedureHeader.tsx
- [x] T043 [US4] Integrate updateProcedure mutation with edit form in frontend/app/(dashboard)/procedures/[id]/page.tsx
- [x] T044 [US4] Add optimistic updates and error handling for edit in frontend/app/(dashboard)/procedures/[id]/page.tsx

**Checkpoint**: Can edit title/description. Test by editing and refreshing page.

---

## Phase 7: User Story 5 - Delete Recording (Priority: P2)

**Goal**: Allow users to delete recordings with confirmation dialog

**Independent Test**: Select a recording, click delete, confirm, verify it no longer appears in list

### Implementation for User Story 5

- [x] T045 [P] [US5] Create DeleteConfirmDialog component in frontend/components/procedures/DeleteConfirmDialog.tsx
- [x] T046 [US5] Add deleteScreenshots helper function in frontend/lib/procedures/mutations.ts
- [x] T047 [US5] Add delete button and dialog trigger to ProcedureHeader in frontend/components/procedures/ProcedureHeader.tsx
- [x] T048 [US5] Wire up deleteProcedure mutation with dialog in frontend/app/(dashboard)/procedures/[id]/page.tsx
- [x] T049 [US5] Add redirect to dashboard after successful delete in frontend/app/(dashboard)/procedures/[id]/page.tsx

**Checkpoint**: Can delete recordings with confirmation. Test by deleting and verifying removal.

---

## Phase 8: User Story 6 - Share Recording via Public Link (Priority: P2)

**Goal**: Allow users to share recordings via public link accessible without authentication

**Independent Test**: Generate share link, open in incognito browser, verify recording is viewable

### Implementation for User Story 6

- [x] T050 [P] [US6] Create ShareDialog component with link generation in frontend/components/procedures/ShareDialog.tsx
- [x] T051 [P] [US6] Create public page layout without dashboard nav in frontend/app/p/layout.tsx
- [x] T052 [US6] Create public procedure view page in frontend/app/p/[slug]/page.tsx
- [x] T053 [US6] Create PublicProcedureTimeline component (read-only) in frontend/components/procedures/PublicProcedureTimeline.tsx
- [x] T054 [US6] Add share button to ProcedureHeader in frontend/components/procedures/ProcedureHeader.tsx
- [x] T055 [US6] Wire up generatePublicSlug mutation with ShareDialog in frontend/app/(dashboard)/procedures/[id]/page.tsx
- [x] T056 [US6] Add toggle for making recording private again in frontend/components/procedures/ShareDialog.tsx
- [x] T057 [US6] Add CTA to sign up at bottom of public view in frontend/app/p/[slug]/page.tsx

**Checkpoint**: Can share and view public links. Test by sharing and opening in incognito.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add aria labels and keyboard navigation to all interactive components
- [ ] T059 [P] Review and update all copy to Brazilian Portuguese in frontend/components/procedures/
- [ ] T060 [P] Add toast notifications for success/error states in frontend/app/(dashboard)/
- [ ] T061 Performance audit: verify FCP <1.5s, TTI <3s on dashboard
- [ ] T062 [P] Add analytics events for key user actions (save, view, share, delete)
- [ ] T063 Run quickstart.md validation - manual test of all user stories

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (Save) must complete before US2-6 (need data to view/edit/delete/share)
  - US2 (List) and US3 (Detail) can proceed in parallel after US1
  - US4-6 can proceed in parallel after US3
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
Phase 3: US1 - Save Recording (Extension) ← MVP
    ↓
Phase 4: US2 - View List ──┬── Phase 5: US3 - View Detail
                           │              ↓
                           └───────> Phase 6: US4 - Edit
                                     Phase 7: US5 - Delete
                                     Phase 8: US6 - Share
                                          ↓
                                    Phase 9: Polish
```

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Components before pages
- Data layer before UI
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004 can run in parallel

**Phase 2 (Foundational)**:
- T006, T007 can run in parallel
- T009, T010, T011 can run in parallel
- T012, T013 can run in parallel

**Phase 3 (US1)**:
- T014, T015 can run in parallel (tests)
- T016 before T017-T024

**Phase 4 (US2)**:
- T025, T026, T027 can run in parallel

**Phase 5 (US3)**:
- T033, T034 can run in parallel

**Phase 6-8**:
- Can run in parallel if multiple developers

**Phase 9 (Polish)**:
- T058, T059, T060, T062 can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch model tasks in parallel:
Task: "Create ProcedureCard component in frontend/components/procedures/ProcedureCard.tsx"
Task: "Create Pagination component in frontend/components/procedures/Pagination.tsx"
Task: "Create SearchInput component in frontend/components/procedures/SearchInput.tsx"

# Then sequentially:
Task: "Create ProcedureList component with pagination in frontend/components/procedures/ProcedureList.tsx"
Task: "Update dashboard page to fetch and display procedures in frontend/app/(dashboard)/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 - Save Recording
4. **VALIDATE**: Test extension saves to Supabase
5. Complete Phase 4: US2 - View List
6. Complete Phase 5: US3 - View Detail
7. **STOP and VALIDATE**: Full save-to-view flow works
8. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Save) → Extension works → Demo
3. Add US2 (List) + US3 (Detail) → Full view flow → Demo (MVP!)
4. Add US4 (Edit) → Management capability → Demo
5. Add US5 (Delete) → Cleanup capability → Demo
6. Add US6 (Share) → Collaboration capability → Demo
7. Polish → Production ready

### Task Summary

| Phase | User Story | Task Count |
|-------|------------|------------|
| 1 | Setup | 4 |
| 2 | Foundational | 9 |
| 3 | US1 - Save | 11 |
| 4 | US2 - List | 8 |
| 5 | US3 - Detail | 7 |
| 6 | US4 - Edit | 5 |
| 7 | US5 - Delete | 5 |
| 8 | US6 - Share | 8 |
| 9 | Polish | 6 |
| **Total** | | **63** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = US1 + US2 + US3 (Save + List + Detail)
