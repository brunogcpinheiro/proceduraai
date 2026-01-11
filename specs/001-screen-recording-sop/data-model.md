# Data Model: Screen Recording & SOP Generation

**Feature**: 001-screen-recording-sop
**Date**: 2026-01-06
**Database**: PostgreSQL (Supabase)

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   users     │       │  procedures  │       │    steps    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │──────<│ user_id (FK) │       │ id (PK)     │
│ email       │       │ id (PK)      │──────<│ procedure_id│
│ name        │       │ title        │       │ order_index │
│ avatar_url  │       │ description  │       │ screenshot  │
│ plan        │       │ status       │       │ annotated   │
│ credits     │       │ is_public    │       │ action_type │
│ created_at  │       │ public_slug  │       │ element_*   │
│ updated_at  │       │ views_count  │       │ generated   │
└─────────────┘       │ created_at   │       │ manual_text │
                      │ updated_at   │       │ timestamp   │
                      └──────────────┘       │ created_at  │
                                             └─────────────┘
```

## Entities

### 1. Users

Extended Supabase Auth user with application-specific fields.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Matches Supabase Auth user ID |
| email | TEXT | UNIQUE, NOT NULL | User email address |
| name | TEXT | | Display name |
| avatar_url | TEXT | | Profile picture URL |
| plan | ENUM | NOT NULL, DEFAULT 'free' | Subscription plan |
| credits_remaining | INTEGER | NOT NULL, DEFAULT 3 | SOPs available this month |
| credits_reset_at | TIMESTAMPTZ | | When credits reset |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Account creation |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last profile update |

**Plan Enum Values**: `free`, `starter`, `pro`, `business`

**Validation Rules**:
- `credits_remaining` >= 0
- `credits_reset_at` is always first of next month

### 2. Procedures (SOPs)

The main document entity representing a generated SOP.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → users.id, NOT NULL | Owner |
| title | TEXT | NOT NULL | SOP title (AI-generated or edited) |
| description | TEXT | | Brief description/summary |
| status | ENUM | NOT NULL, DEFAULT 'draft' | Processing state |
| processing_progress | INTEGER | DEFAULT 0 | 0-100 progress percentage |
| is_public | BOOLEAN | NOT NULL, DEFAULT false | Sharing enabled |
| public_slug | TEXT | UNIQUE | URL-safe sharing identifier |
| views_count | INTEGER | NOT NULL, DEFAULT 0 | Public view counter |
| step_count | INTEGER | NOT NULL, DEFAULT 0 | Denormalized for listing |
| thumbnail_url | TEXT | | First screenshot thumbnail |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last modification |

**Status Enum Values**: `draft`, `recording`, `processing`, `ready`, `error`

**State Transitions**:
```
draft → recording → processing → ready
                  ↘            ↗
                    error ←────
```

**Validation Rules**:
- `title` length: 1-200 characters
- `public_slug` format: lowercase alphanumeric + hyphens, 8-50 chars
- `views_count` >= 0
- `processing_progress` between 0 and 100

### 3. Steps

Individual actions captured during recording.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier |
| procedure_id | UUID | FK → procedures.id, NOT NULL | Parent SOP |
| order_index | INTEGER | NOT NULL | Position in sequence (1-based) |
| screenshot_url | TEXT | | Original screenshot storage path |
| annotated_screenshot_url | TEXT | | Annotated screenshot path |
| action_type | TEXT | NOT NULL | Type of action (click, input, navigate) |
| element_selector | TEXT | | CSS selector of target element |
| element_text | TEXT | | Text content of element (truncated) |
| element_tag | TEXT | | HTML tag name |
| click_x | INTEGER | | X coordinate of click |
| click_y | INTEGER | | Y coordinate of click |
| page_url | TEXT | NOT NULL | URL where action occurred |
| page_title | TEXT | | Page title at time of capture |
| generated_text | TEXT | | AI-generated description |
| manual_text | TEXT | | User-edited description |
| captured_at | TIMESTAMPTZ | NOT NULL | When action was recorded |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Database insert time |

**Action Type Values**: `click`, `input`, `navigate`, `scroll`, `select`

**Validation Rules**:
- `order_index` unique per procedure
- `order_index` >= 1
- `element_text` max 500 characters
- `generated_text` max 2000 characters
- `manual_text` max 2000 characters

### 4. Credit Usage (Audit Log)

Tracks credit consumption for billing and analytics.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → users.id, NOT NULL | User who used credit |
| procedure_id | UUID | FK → procedures.id | Associated SOP |
| credits_used | INTEGER | NOT NULL, DEFAULT 1 | Credits consumed |
| action | TEXT | NOT NULL | What consumed credits |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | When used |

**Action Values**: `generate_sop`, `regenerate_sop`, `export_pdf`

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);

-- Procedures
CREATE INDEX idx_procedures_user_id ON procedures(user_id);
CREATE INDEX idx_procedures_status ON procedures(status);
CREATE INDEX idx_procedures_public_slug ON procedures(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_procedures_created_at ON procedures(created_at DESC);
CREATE INDEX idx_procedures_user_created ON procedures(user_id, created_at DESC);

-- Steps
CREATE INDEX idx_steps_procedure_id ON steps(procedure_id);
CREATE INDEX idx_steps_order ON steps(procedure_id, order_index);

-- Credit Usage
CREATE INDEX idx_credit_usage_user ON credit_usage(user_id);
CREATE INDEX idx_credit_usage_created ON credit_usage(created_at DESC);
```

## Row Level Security (RLS)

```sql
-- Users: Users can only read/update their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update ON users
  FOR UPDATE USING (auth.uid() = id);

-- Procedures: Users own their procedures; public procedures readable by all
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY procedures_select_own ON procedures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY procedures_select_public ON procedures
  FOR SELECT USING (is_public = true);

CREATE POLICY procedures_insert ON procedures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY procedures_update ON procedures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY procedures_delete ON procedures
  FOR DELETE USING (auth.uid() = user_id);

-- Steps: Accessible via parent procedure ownership
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY steps_select ON steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND (procedures.user_id = auth.uid() OR procedures.is_public = true)
    )
  );

CREATE POLICY steps_insert ON steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY steps_update ON steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

CREATE POLICY steps_delete ON steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = steps.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );
```

## Database Functions

### Generate Public Slug
```sql
CREATE OR REPLACE FUNCTION generate_public_slug()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Increment View Count
```sql
CREATE OR REPLACE FUNCTION increment_procedure_views(slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE procedures
  SET views_count = views_count + 1
  WHERE public_slug = slug AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Update Step Count Trigger
```sql
CREATE OR REPLACE FUNCTION update_step_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE procedures
    SET step_count = (SELECT COUNT(*) FROM steps WHERE procedure_id = COALESCE(NEW.procedure_id, OLD.procedure_id))
    WHERE id = COALESCE(NEW.procedure_id, OLD.procedure_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_step_count
AFTER INSERT OR DELETE ON steps
FOR EACH ROW EXECUTE FUNCTION update_step_count();
```

## Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `screenshots` | Private | Original screenshots during recording |
| `annotated` | Private | Processed screenshots with annotations |
| `public` | Public | Shared SOP screenshots |
| `exports` | Private | Generated PDFs (temporary) |

### Storage Policies
```sql
-- Screenshots bucket: Users can upload/read their own files
CREATE POLICY screenshots_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY screenshots_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public bucket: Anyone can read
CREATE POLICY public_select ON storage.objects
  FOR SELECT USING (bucket_id = 'public');
```

## TypeScript Types

```typescript
// types/database.ts

export type Plan = 'free' | 'starter' | 'pro' | 'business';
export type ProcedureStatus = 'draft' | 'recording' | 'processing' | 'ready' | 'error';
export type ActionType = 'click' | 'input' | 'navigate' | 'scroll' | 'select';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: Plan;
  credits_remaining: number;
  credits_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Procedure {
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

export interface Step {
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
  page_url: string;
  page_title: string | null;
  generated_text: string | null;
  manual_text: string | null;
  captured_at: string;
  created_at: string;
}

export interface CreditUsage {
  id: string;
  user_id: string;
  procedure_id: string | null;
  credits_used: number;
  action: string;
  created_at: string;
}

// Computed types for API responses
export interface ProcedureWithSteps extends Procedure {
  steps: Step[];
}

export interface ProcedureListItem extends Pick<Procedure,
  'id' | 'title' | 'status' | 'step_count' | 'thumbnail_url' | 'created_at' | 'views_count' | 'is_public'
> {}
```
