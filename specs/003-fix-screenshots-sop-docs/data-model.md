# Data Model: Fix Screenshots Display & SOP Document Generation

**Date**: 2026-01-12
**Feature Branch**: `003-fix-screenshots-sop-docs`

## Overview

This document defines the data model changes required for screenshot display fixes and SOP document generation feature.

## Existing Entities (No Changes Required)

### procedures
Already contains all required fields for this feature:
- `thumbnail_url` (TEXT, nullable) - First step screenshot
- `is_public` (BOOLEAN) - Controls public access
- `public_slug` (TEXT, unique) - Public sharing URL

### steps
Already contains all required fields:
- `screenshot_url` (TEXT, nullable) - Raw screenshot from extension
- `annotated_screenshot_url` (TEXT, nullable) - AI-processed screenshot

## New Entity: sop_documents

Stores AI-generated SOP documents as structured JSON.

### Table Definition

```sql
CREATE TABLE sop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,

  -- Document content as structured JSON
  content JSONB NOT NULL,

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,

  -- Rate limiting
  generation_count INTEGER NOT NULL DEFAULT 1,
  generation_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT positive_version CHECK (version >= 1),
  CONSTRAINT positive_generation_count CHECK (generation_count >= 0 AND generation_count <= 10)
);

-- Index for procedure lookups
CREATE INDEX idx_sop_documents_procedure_id ON sop_documents(procedure_id);

-- Unique constraint: one document per procedure
CREATE UNIQUE INDEX idx_sop_documents_procedure_unique ON sop_documents(procedure_id);
```

### Content JSON Schema

The `content` field stores the structured document:

```typescript
interface SOPDocumentContent {
  // Document metadata
  title: string;
  generatedAt: string; // ISO timestamp
  version: number;

  // Document sections
  sections: {
    // Purpose/Overview section
    purpose: {
      title: string; // "Objetivo"
      content: string;
    };

    // Prerequisites section
    prerequisites: {
      title: string; // "Pré-requisitos"
      items: string[];
    };

    // Step-by-step instructions
    steps: Array<{
      number: number;
      title: string;
      description: string;
      screenshotUrl: string | null;
      notes?: string;
    }>;

    // Conclusion section
    conclusion: {
      title: string; // "Conclusão"
      content: string;
    };
  };
}
```

### Example Content

```json
{
  "title": "Como criar uma nova conta no sistema",
  "generatedAt": "2026-01-12T10:30:00Z",
  "version": 1,
  "sections": {
    "purpose": {
      "title": "Objetivo",
      "content": "Este procedimento descreve os passos necessários para criar uma nova conta de usuário no sistema."
    },
    "prerequisites": {
      "title": "Pré-requisitos",
      "items": [
        "Acesso ao navegador web",
        "Endereço de e-mail válido",
        "Conexão com a internet"
      ]
    },
    "steps": [
      {
        "number": 1,
        "title": "Acessar a página de cadastro",
        "description": "Navegue até a página inicial do sistema e clique no botão 'Criar Conta' localizado no canto superior direito.",
        "screenshotUrl": "https://..../signed-url",
        "notes": "O botão está destacado em azul para fácil identificação."
      }
    ],
    "conclusion": {
      "title": "Conclusão",
      "content": "Após completar todos os passos, sua conta estará ativa e pronta para uso."
    }
  }
}
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON sop_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = sop_documents.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

-- Users can insert documents for their procedures
CREATE POLICY "Users can create documents for own procedures"
  ON sop_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = sop_documents.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON sop_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = sop_documents.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON sop_documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM procedures
      WHERE procedures.id = sop_documents.procedure_id
      AND procedures.user_id = auth.uid()
    )
  );
```

## TypeScript Types

Add to `frontend/types/database.ts`:

```typescript
// SOP Document content structure
export interface SOPDocumentSection {
  title: string;
  content?: string;
  items?: string[];
}

export interface SOPDocumentStep {
  number: number;
  title: string;
  description: string;
  screenshotUrl: string | null;
  notes?: string;
}

export interface SOPDocumentContent {
  title: string;
  generatedAt: string;
  version: number;
  sections: {
    purpose: SOPDocumentSection;
    prerequisites: SOPDocumentSection;
    steps: SOPDocumentStep[];
    conclusion: SOPDocumentSection;
  };
}

// Database entity
export interface SOPDocument {
  id: string;
  procedure_id: string;
  content: SOPDocumentContent;
  version: number;
  generation_count: number;
  generation_reset_at: string;
  generated_at: string;
  last_edited_at: string | null;
  created_at: string;
  updated_at: string;
}

// For API responses
export interface SOPDocumentWithProcedure extends SOPDocument {
  procedure: Procedure;
}
```

## Entity Relationships

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │   procedures    │       │      steps      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ user_id (FK)    │◄─┘    │ procedure_id(FK)│
│ plan            │  └───►│ title           │◄──────│ screenshot_url  │
│ credits         │       │ thumbnail_url   │       │ annotated_url   │
└─────────────────┘       │ is_public       │       │ order_index     │
                          └────────┬────────┘       └─────────────────┘
                                   │
                                   │ 1:1
                                   ▼
                          ┌─────────────────┐
                          │  sop_documents  │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ procedure_id(FK)│
                          │ content (JSONB) │
                          │ version         │
                          │ generation_count│
                          └─────────────────┘
```

## State Transitions

### Document Generation States

```
[No Document] ──generate──► [Generated v1]
                                │
                                ├──edit──► [Edited v1]
                                │              │
                                │              └──regenerate──► [Generated v2]
                                │
                                └──regenerate──► [Generated v2]
```

### Rate Limit Logic

```
Check generation_reset_at:
  - If < today: Reset count to 0, update date
  - If >= today: Use current count

Check generation_count:
  - If < 5: Allow generation, increment count
  - If >= 5: Reject with "limite diário atingido"
```

## Migration File

File: `backend/supabase/migrations/007_sop_documents.sql`

```sql
-- Migration: 007_sop_documents.sql
-- Description: Create sop_documents table for AI-generated SOP documents

-- Create table
CREATE TABLE IF NOT EXISTS sop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  generation_count INTEGER NOT NULL DEFAULT 1,
  generation_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT positive_version CHECK (version >= 1),
  CONSTRAINT positive_generation_count CHECK (generation_count >= 0 AND generation_count <= 10)
);

-- Add comment
COMMENT ON TABLE sop_documents IS 'AI-generated SOP documents stored as structured JSON';

-- Create indexes
CREATE INDEX idx_sop_documents_procedure_id ON sop_documents(procedure_id);
CREATE UNIQUE INDEX idx_sop_documents_procedure_unique ON sop_documents(procedure_id);

-- Enable RLS
ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own documents"
  ON sop_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

CREATE POLICY "Users can create documents for own procedures"
  ON sop_documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own documents"
  ON sop_documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own documents"
  ON sop_documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM procedures
    WHERE procedures.id = sop_documents.procedure_id
    AND procedures.user_id = auth.uid()
  ));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_sop_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sop_documents_updated_at
  BEFORE UPDATE ON sop_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_sop_documents_updated_at();
```
