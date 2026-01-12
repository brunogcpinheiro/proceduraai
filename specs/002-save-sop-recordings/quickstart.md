# Quickstart: Save SOP Recordings

**Feature Branch**: `002-save-sop-recordings`
**Date**: 2026-01-11

## Prerequisites

- Node.js 20+
- Git
- Chrome browser (for extension testing)
- Supabase project configured

## Setup

### 1. Clone and Install

```bash
# Ensure you're on the feature branch
git checkout 002-save-sop-recordings

# Install dependencies
cd frontend && npm install && cd ..
cd extension && npm install && cd ..
```

### 2. Environment Variables

Both frontend and extension need Supabase credentials.

**frontend/.env**
```
NEXT_PUBLIC_SUPABASE_URL=https://mambxdjjgmgzpwehkopq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**extension/.env**
```
VITE_SUPABASE_URL=https://mambxdjjgmgzpwehkopq.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Database

No migrations needed - tables exist from previous feature.

Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('procedures', 'steps');
```

---

## Development

### Frontend

```bash
cd frontend
npm run dev
# Runs at http://localhost:3000
```

Key pages to work on:
- `/` - Landing (exists)
- `/login` - Auth (exists)
- Dashboard - `/app/(dashboard)/page.tsx` - Recordings list
- Detail - `/app/(dashboard)/procedures/[id]/page.tsx`
- Public - `/app/p/[slug]/page.tsx` (new)

### Extension

```bash
cd extension
npm run dev
# Outputs to dist/ folder
```

Load in Chrome:
1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder

### Tests

```bash
# Extension tests
cd extension
npm test
npm run test:coverage

# Frontend tests (when configured)
cd frontend
npm test
```

---

## Key Files to Create/Modify

### Frontend - New Files

```
frontend/
├── components/procedures/
│   ├── ProcedureCard.tsx
│   ├── ProcedureList.tsx
│   ├── ProcedureTimeline.tsx
│   ├── StepCard.tsx
│   ├── ShareDialog.tsx
│   ├── DeleteConfirmDialog.tsx
│   └── EmptyState.tsx
├── lib/procedures/
│   ├── queries.ts
│   └── mutations.ts
└── app/p/[slug]/
    └── page.tsx
```

### Frontend - Modify Files

```
frontend/
├── app/(dashboard)/
│   ├── page.tsx              # Add procedure list
│   └── procedures/[id]/
│       └── page.tsx          # Add timeline view
└── types/database.ts         # Add any missing types
```

### Extension - New Files

```
extension/
├── src/background/
│   └── syncService.ts        # Sync logic
└── tests/
    └── syncService.test.ts
```

### Extension - Modify Files

```
extension/
└── src/
    ├── background/index.ts   # Add sync handlers
    └── lib/supabase.ts       # Add batch operations
```

---

## Implementation Order

### Phase 1: Extension Sync (P1)
1. Create `syncService.ts` with upload logic
2. Add progress tracking
3. Integrate with background script
4. Test offline/retry behavior

### Phase 2: Frontend List (P1)
1. Create data fetching in `queries.ts`
2. Build `ProcedureCard` component
3. Build `ProcedureList` with pagination
4. Update dashboard page
5. Add search/filter

### Phase 3: Frontend Detail (P1)
1. Create `StepCard` component
2. Build `ProcedureTimeline` component
3. Update procedure detail page
4. Add screenshot modal

### Phase 4: Management (P2)
1. Create `mutations.ts` for CRUD
2. Build edit functionality
3. Build `DeleteConfirmDialog`
4. Wire up delete flow

### Phase 5: Sharing (P2)
1. Build `ShareDialog` component
2. Create `/p/[slug]` route
3. Add public view layout
4. Implement slug generation

---

## Testing Checklist

### Manual Testing

- [ ] Record a procedure in extension
- [ ] Click "Stop" and verify save progress
- [ ] Navigate to dashboard, see recording in list
- [ ] Click recording, see timeline with steps
- [ ] Click screenshot, see full size
- [ ] Edit title/description, verify save
- [ ] Delete recording, verify removal
- [ ] Generate share link
- [ ] Open share link in incognito, verify view

### Automated Tests

```bash
# Extension
cd extension
npm test -- --run syncService

# Frontend
cd frontend
npm test -- --run queries
npm test -- --run mutations
```

---

## Troubleshooting

### "Permission denied" errors
- Check RLS policies in Supabase
- Verify user is authenticated
- Check user_id matches

### Screenshots not loading
- Verify storage bucket exists
- Check bucket policies
- Verify file path format

### Sync fails silently
- Check browser console for errors
- Verify network requests in DevTools
- Check Supabase logs

### Extension not loading
- Rebuild: `npm run build`
- Reload extension in chrome://extensions
- Check manifest.json syntax

---

## Useful Commands

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Supabase CLI (if needed)
supabase db diff
supabase migration new <name>
```

---

## Resources

- [Spec](./spec.md) - Feature requirements
- [Data Model](./data-model.md) - Entity definitions
- [API Contracts](./contracts/api.md) - Function signatures
- [Research](./research.md) - Technical decisions
- [Constitution](../../.specify/memory/constitution.md) - Quality standards
