# Research: Save SOP Recordings

**Feature Branch**: `002-save-sop-recordings`
**Date**: 2026-01-11
**Status**: Complete

## Executive Summary

This research consolidates technical decisions for implementing the save and view functionality for SOP recordings. The existing infrastructure (Supabase database, storage buckets, extension recording) is well-suited for this feature with minimal new components needed.

---

## 1. Extension Sync Strategy

### Decision: Batch Upload with Progress Tracking

**Rationale**: Screenshots are the largest data component (up to 200KB each × 100 steps = 20MB max). Sequential upload with progress provides user feedback and handles failures gracefully.

**Alternatives Considered**:
- **Parallel uploads**: Faster but harder to track progress and can overwhelm network
- **Single request with all data**: Simpler but timeout-prone for large recordings
- **Background sync only**: Poor UX - user doesn't know when save completes

**Implementation Approach**:
1. Create procedure record first (returns ID)
2. Upload screenshots in batches of 5 (parallel within batch, sequential batches)
3. Create step records with screenshot URLs
4. Update procedure status to 'ready' when complete
5. Show progress indicator (0-100%) during upload

**Offline Handling**:
- Store recording in IndexedDB (already implemented)
- Queue sync operation on `navigator.onLine` event
- Retry with exponential backoff (1s, 2s, 4s, max 30s)

---

## 2. Frontend Data Fetching Pattern

### Decision: Server Components with Supabase SSR

**Rationale**: Next.js 16 App Router with React Server Components provides optimal performance for data fetching. Supabase SSR client handles auth cookies automatically.

**Alternatives Considered**:
- **Client-side fetching (SWR/React Query)**: More client JS, slower initial load
- **API routes**: Extra hop, no benefit over direct Supabase
- **tRPC**: Overkill for Supabase which already provides typed queries

**Implementation Approach**:
```
Page (Server Component)
├── Fetch data with Supabase server client
├── Pass to Client Components for interactivity
└── Use Suspense boundaries for loading states
```

**Pagination Strategy**:
- Use Supabase `.range(from, to)` for offset-based pagination
- 20 items per page (spec requirement)
- URL search params for page state (`?page=2&search=termo`)
- Server-side filtering for search

---

## 3. Timeline Component Architecture

### Decision: Virtualized Vertical Timeline

**Rationale**: Recordings can have up to 100 steps with screenshots. Rendering all at once causes performance issues. Virtual list renders only visible items.

**Alternatives Considered**:
- **Simple list**: Performance degrades with many steps
- **Pagination within detail page**: Breaks user mental model of single document
- **Accordion/collapsible**: Hides content, requires extra clicks

**Implementation Approach**:
- Use CSS scroll-snap for smooth scrolling
- Lazy load images with `loading="lazy"` and blur placeholders
- Screenshot thumbnail in timeline, click to expand full-size
- Timeline structure:
  ```
  [Step Number] ─────────────────────────────────────
  │
  │  [Screenshot]     [Action Type Badge]
  │                   [Element Description]
  │                   [URL] • [Timestamp]
  │
  ────────────────────────────────────────────────────
  ```

---

## 4. Public Sharing Implementation

### Decision: Slug-based Public Routes with Separate Layout

**Rationale**: Public views need different layout (no dashboard nav) and auth requirements. Existing `public_slug` field in database supports this.

**Alternatives Considered**:
- **Query parameter (`?public=true`)**: Exposes internal IDs, less clean URLs
- **Subdomain (`share.procedura.ai`)**: Infrastructure complexity
- **Signed URLs with expiration**: Good for security but bad for sharing stable links

**Implementation Approach**:
- Route: `/p/[slug]` (short, clean, memorable)
- No auth required (public content)
- Simple layout with branding header
- Read-only view of timeline
- CTA to sign up at bottom
- Slug format: 8-character alphanumeric (existing implementation)

**Security Considerations**:
- Slugs are random (not guessable from procedure ID)
- Owner can revoke at any time (set `is_public = false`)
- Views counter incremented on access

---

## 5. Delete Operation Safety

### Decision: Soft Delete with Cascade

**Rationale**: Immediate permanent deletion is risky. However, storage costs make true soft-delete expensive. Compromise: confirmation dialog with immediate cascade delete.

**Alternatives Considered**:
- **Soft delete (is_deleted flag)**: Storage costs for screenshots
- **Trash with 30-day retention**: Complex to implement, storage costs
- **Hard delete without confirmation**: Too risky

**Implementation Approach**:
1. Show confirmation dialog with procedure title
2. Delete steps first (cascade configured in DB)
3. Delete screenshots from storage bucket
4. Delete procedure record
5. Refresh list on success

**Database Support**:
- Foreign key `steps.procedure_id` references `procedures.id` with ON DELETE CASCADE
- Storage files deleted via Supabase Storage API

---

## 6. Search Implementation

### Decision: Database-level Text Search

**Rationale**: PostgreSQL full-text search is sufficient for title/description search. No need for external search service at current scale.

**Alternatives Considered**:
- **Client-side filtering**: Only works for loaded page
- **Algolia/Typesense**: Overkill, adds cost and complexity
- **pg_trgm extension**: Good for fuzzy search but not needed yet

**Implementation Approach**:
- Use Supabase `.ilike()` for case-insensitive search
- Search in `title` and `description` fields
- Debounce input (300ms) before query
- Clear search button
- Empty results state with suggestions

---

## 7. Image Loading Optimization

### Decision: Progressive Loading with Blur Placeholders

**Rationale**: Screenshots are the main content but also the heaviest. Progressive loading improves perceived performance.

**Alternatives Considered**:
- **Eager loading**: Slow initial load
- **Intersection Observer only**: No placeholder, content shift
- **Low-quality previews stored separately**: Storage overhead

**Implementation Approach**:
- Use Next.js `<Image>` component with `placeholder="blur"`
- Generate blur data URL client-side from thumbnail
- `loading="lazy"` for below-fold images
- Skeleton loader while image loads
- Full-size modal uses same optimization

---

## 8. Error Handling Strategy

### Decision: Centralized Error Boundary with Toast Notifications

**Rationale**: Consistent error handling improves UX and debugging. Portuguese error messages per constitution.

**Implementation Approach**:
- Page-level ErrorBoundary (exists in shared/)
- Toast notifications for async operation errors
- Error messages in Portuguese:
  - "Não foi possível salvar a gravação. Tente novamente."
  - "Erro ao carregar procedimentos."
  - "Não foi possível excluir. Tente novamente."
- Retry buttons where applicable
- Log errors to console in development

---

## 9. State Management

### Decision: URL State + Server State (No Global Store)

**Rationale**: This feature is mostly CRUD with server as source of truth. No complex client state needed.

**Alternatives Considered**:
- **Zustand/Jotai**: Adds complexity for simple state
- **React Query**: Good but Supabase SSR already handles caching
- **Context**: Fine for small state, but URL is better for shareable state

**Implementation Approach**:
- Pagination: URL search params (`?page=2`)
- Search: URL search params (`?q=termo`)
- Modal state: URL or local component state
- Recording sync: Extension background script state

---

## 10. Testing Strategy

### Decision: Unit + Integration Tests with Vitest/Jest

**Rationale**: Constitution requires 80% coverage. Focus on business logic and data layer.

**Test Scope**:

| Layer | Tool | Focus |
|-------|------|-------|
| Extension sync | Vitest | Upload logic, retry, offline |
| Frontend queries | Jest | Data fetching, pagination |
| Components | Testing Library | User interactions |
| E2E (future) | Playwright | Full save-to-view flow |

**Priority Tests**:
1. Sync service upload/retry logic
2. Pagination query building
3. Delete cascade behavior
4. Public view access control

---

## Dependencies & Risks

### Dependencies
- Supabase procedures/steps tables (exists)
- Supabase Storage buckets (exists)
- Extension recording functionality (exists)
- Auth system (exists)

### Risks
| Risk | Mitigation |
|------|------------|
| Large recording upload timeout | Batch uploads, progress tracking |
| Storage quota limits | Screenshot compression (existing) |
| Concurrent edit conflicts | Last-write-wins with timestamps |
| Public link abuse | Rate limiting on views (future) |

---

## Conclusion

All technical decisions align with existing infrastructure and constitution requirements. No external services needed. Implementation can proceed to Phase 1 (data model and contracts).
