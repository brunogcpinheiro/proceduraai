# Data Model: Save SOP Recordings

**Feature Branch**: `002-save-sop-recordings`
**Date**: 2026-01-11
**Status**: Complete

## Overview

This feature uses the existing database schema from migrations 002 and 003. No new tables required. This document describes the entities as used by this feature.

---

## Entity: Procedure (SOP)

A complete recorded workflow representing a Standard Operating Procedure.

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| user_id | UUID | FK → users.id, NOT NULL | Owner of the procedure |
| title | TEXT | NOT NULL, 1-200 chars | Display name |
| description | TEXT | nullable | Optional longer description |
| status | ENUM | NOT NULL, default 'draft' | draft, recording, processing, ready, error |
| processing_progress | INTEGER | 0-100, default 0 | Progress indicator during save |
| is_public | BOOLEAN | default false | Whether publicly accessible |
| public_slug | TEXT | UNIQUE, 8-50 chars | URL slug for public sharing |
| views_count | INTEGER | default 0 | Public view counter |
| step_count | INTEGER | default 0 | Denormalized step count |
| thumbnail_url | TEXT | nullable | First screenshot as thumbnail |
| created_at | TIMESTAMPTZ | auto | Creation timestamp |
| updated_at | TIMESTAMPTZ | auto-update | Last modification |

### State Transitions

```
[draft] → START_RECORDING → [recording]
                              ↓
                         STOP_RECORDING
                              ↓
                        [processing] ← SAVE_IN_PROGRESS
                              ↓
                         SAVE_COMPLETE
                              ↓
                          [ready] ← NORMAL_STATE
                              ↓
                         PROCESSING_ERROR
                              ↓
                          [error]
```

### Business Rules

- `title` required, validated on client and server
- `public_slug` generated on first share request (8 random alphanumeric)
- `step_count` updated when steps added/removed
- `thumbnail_url` set to first step's screenshot on save
- Only owner can modify (RLS enforced)
- Public procedures readable by anyone with slug

---

## Entity: Step

An individual captured action within a procedure.

### Attributes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique identifier |
| procedure_id | UUID | FK → procedures.id, NOT NULL | Parent procedure |
| order_index | INTEGER | NOT NULL | Position in sequence (0-based) |
| screenshot_url | TEXT | nullable | Original screenshot path |
| annotated_screenshot_url | TEXT | nullable | AI-annotated screenshot |
| action_type | ENUM | NOT NULL | click, input, navigate, scroll, select |
| element_selector | TEXT | nullable | CSS selector for target element |
| element_text | TEXT | max 500 chars | Text content of element |
| element_tag | TEXT | nullable | HTML tag name |
| click_x | INTEGER | nullable | X coordinate of click |
| click_y | INTEGER | nullable | Y coordinate of click |
| page_url | TEXT | nullable | URL where action occurred |
| page_title | TEXT | nullable | Page title at capture time |
| generated_text | TEXT | max 2000 chars | AI-generated description |
| manual_text | TEXT | max 2000 chars | User-edited description |
| captured_at | TIMESTAMPTZ | NOT NULL | When action was captured |
| created_at | TIMESTAMPTZ | auto | Record creation time |

### Constraints

- UNIQUE(procedure_id, order_index) - no duplicate positions
- ON DELETE CASCADE from procedure - steps deleted with procedure

### Business Rules

- `order_index` starts at 0, increments by 1
- `screenshot_url` format: `{user_id}/{procedure_id}/step-{order_index}-{timestamp}.png`
- `action_type` determines which fields are relevant:
  - click: click_x, click_y required
  - input: element_text contains input value (or masked)
  - navigate: page_url is the target
  - scroll: coordinates indicate scroll position
  - select: element_text contains selected option
- Display text: prefer `manual_text` if set, else `generated_text`, else auto-generated from action

---

## Entity: Screenshot (Storage Object)

Screenshots stored in Supabase Storage, not database table.

### Storage Path

```
screenshots/{user_id}/{procedure_id}/step-{order_index}-{timestamp}.png
```

### Metadata

| Property | Value |
|----------|-------|
| Bucket | screenshots |
| Max Size | 200KB (compressed) |
| Format | PNG or WebP |
| Access | Private (owner only) |

### Public Screenshot Path

When procedure is made public, screenshots are copied/accessible via:
```
public/{public_slug}/step-{order_index}.png
```

---

## Relationships

```
┌─────────────┐         ┌─────────────┐
│   users     │ 1    n  │ procedures  │
│             │─────────│             │
│ id          │         │ user_id     │
└─────────────┘         └──────┬──────┘
                               │
                               │ 1
                               │
                               │ n
                        ┌──────┴──────┐
                        │   steps     │
                        │             │
                        │procedure_id │
                        └─────────────┘
```

---

## Indexes (Existing)

| Table | Index | Purpose |
|-------|-------|---------|
| procedures | user_id | Filter by owner |
| procedures | status | Filter by status |
| procedures | public_slug | Public URL lookup |
| procedures | created_at DESC | Sort by date |
| procedures | (user_id, created_at DESC) | User's recordings sorted |
| steps | procedure_id | Get steps for procedure |
| steps | (procedure_id, order_index) | Ordered step retrieval |

---

## RLS Policies (Existing)

### Procedures

| Policy | Rule |
|--------|------|
| SELECT own | user_id = auth.uid() |
| SELECT public | is_public = true |
| INSERT | user_id = auth.uid() |
| UPDATE | user_id = auth.uid() |
| DELETE | user_id = auth.uid() |

### Steps

| Policy | Rule |
|--------|------|
| SELECT | procedure.user_id = auth.uid() OR procedure.is_public |
| INSERT | procedure.user_id = auth.uid() |
| UPDATE | procedure.user_id = auth.uid() |
| DELETE | procedure.user_id = auth.uid() |

---

## TypeScript Interfaces

```typescript
// Procedure status enum
type ProcedureStatus = 'draft' | 'recording' | 'processing' | 'ready' | 'error';

// Action type enum
type ActionType = 'click' | 'input' | 'navigate' | 'scroll' | 'select';

// Procedure entity
interface Procedure {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProcedureStatus;
  processing_progress: number;
  is_public: boolean;
  public_slug: string | null;
  views_count: number;
  step_count: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

// Step entity
interface Step {
  id: string;
  procedure_id: string;
  order_index: number;
  screenshot_url: string | null;
  annotated_screenshot_url: string | null;
  action_type: ActionType;
  element_selector: string | null;
  element_text: string | null;
  element_tag: string | null;
  click_x: number | null;
  click_y: number | null;
  page_url: string | null;
  page_title: string | null;
  generated_text: string | null;
  manual_text: string | null;
  captured_at: string;
  created_at: string;
}

// List view (optimized for list page)
interface ProcedureListItem {
  id: string;
  title: string;
  status: ProcedureStatus;
  step_count: number;
  thumbnail_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Detail view with steps
interface ProcedureDetail extends Procedure {
  steps: Step[];
}

// Public view (no sensitive data)
interface PublicProcedure {
  id: string;
  title: string;
  description: string | null;
  step_count: number;
  created_at: string;
  steps: Omit<Step, 'element_selector'>[];
}
```

---

## Validation Rules

### Procedure

| Field | Validation |
|-------|------------|
| title | Required, 1-200 characters, trimmed |
| description | Optional, max 2000 characters |
| public_slug | Auto-generated, 8 alphanumeric |

### Step

| Field | Validation |
|-------|------------|
| order_index | >= 0, sequential |
| action_type | Must be valid enum value |
| captured_at | Valid ISO timestamp |
| screenshot_url | Valid storage path or URL |

---

## Migration Notes

No new migrations required. This feature uses tables created in:
- `002_procedures.sql` - Procedures table
- `003_steps.sql` - Steps table
- `006_storage.sql` - Storage buckets and policies
