# API Contracts: Fix Screenshots Display & SOP Document Generation

**Date**: 2026-01-12
**Feature Branch**: `003-fix-screenshots-sop-docs`

## Overview

This document defines the API contracts for screenshot handling and document generation.

---

## 1. Signed URL Generation

### POST /api/screenshots/signed-url

Generates signed URLs for private screenshot access.

#### Request

```typescript
interface SignedUrlRequest {
  // Single URL
  path?: string;
  // Multiple URLs (batch)
  paths?: string[];
  // Expiration in seconds (default: 3600)
  expiresIn?: number;
}
```

#### Response

```typescript
// Single URL response
interface SignedUrlResponse {
  signedUrl: string;
  path: string;
  expiresAt: string; // ISO timestamp
}

// Batch response
interface SignedUrlBatchResponse {
  urls: Array<{
    signedUrl: string | null;
    path: string;
    error?: string;
  }>;
}
```

#### Example

```bash
# Single URL
POST /api/screenshots/signed-url
Content-Type: application/json
Authorization: Bearer <token>

{
  "path": "user-id/procedure-id/step-1.png"
}

# Response
{
  "signedUrl": "https://...supabase.co/storage/v1/object/sign/screenshots/...",
  "path": "user-id/procedure-id/step-1.png",
  "expiresAt": "2026-01-12T11:30:00Z"
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_PATH` | Path is required |
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User doesn't own the file |
| 404 | `FILE_NOT_FOUND` | File doesn't exist in storage |

---

## 2. Document Generation

### POST /api/documents/generate

Generates an AI SOP document from procedure steps.

#### Request

```typescript
interface GenerateDocumentRequest {
  procedureId: string;
}
```

#### Response

```typescript
interface GenerateDocumentResponse {
  document: {
    id: string;
    procedureId: string;
    content: SOPDocumentContent;
    version: number;
    generatedAt: string;
  };
  remainingGenerations: number; // Out of 5 daily
}
```

#### Example

```bash
POST /api/documents/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "procedureId": "60daa9c1-270b-4af5-88d4-7577d9b517cc"
}

# Response
{
  "document": {
    "id": "abc123",
    "procedureId": "60daa9c1-270b-4af5-88d4-7577d9b517cc",
    "content": {
      "title": "Procedimento: teste",
      "sections": { ... }
    },
    "version": 1,
    "generatedAt": "2026-01-12T10:30:00Z"
  },
  "remainingGenerations": 4
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `NO_STEPS` | Procedure has no steps |
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User doesn't own procedure |
| 404 | `PROCEDURE_NOT_FOUND` | Procedure doesn't exist |
| 429 | `RATE_LIMIT_EXCEEDED` | Daily generation limit (5) reached |
| 500 | `AI_GENERATION_FAILED` | OpenAI API error |

---

## 3. Document Update (Edit)

### PUT /api/documents/:id

Updates document content after user edits.

#### Request

```typescript
interface UpdateDocumentRequest {
  content: SOPDocumentContent;
}
```

#### Response

```typescript
interface UpdateDocumentResponse {
  document: {
    id: string;
    content: SOPDocumentContent;
    version: number;
    lastEditedAt: string;
  };
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_CONTENT` | Content structure invalid |
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User doesn't own document |
| 404 | `DOCUMENT_NOT_FOUND` | Document doesn't exist |

---

## 4. Get Document

### GET /api/documents/:procedureId

Gets the generated document for a procedure.

#### Response

```typescript
interface GetDocumentResponse {
  document: {
    id: string;
    procedureId: string;
    content: SOPDocumentContent;
    version: number;
    generatedAt: string;
    lastEditedAt: string | null;
  } | null;
  generationStatus: {
    count: number;
    remaining: number;
    resetsAt: string; // Next reset date
  };
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User doesn't own procedure |

---

## 5. PDF Export

### POST /api/documents/:id/export

Generates and returns a PDF of the document.

#### Request

```typescript
interface ExportDocumentRequest {
  format: 'pdf'; // Future: 'docx', 'html'
}
```

#### Response

Returns PDF file as binary stream.

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="sop-{title}.pdf"
```

#### Example

```bash
POST /api/documents/abc123/export
Content-Type: application/json
Authorization: Bearer <token>

{
  "format": "pdf"
}

# Response: Binary PDF file
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User doesn't own document |
| 404 | `DOCUMENT_NOT_FOUND` | Document doesn't exist |
| 500 | `PDF_GENERATION_FAILED` | PDF rendering error |

---

## 6. Copy Screenshots to Public Bucket

### POST /api/storage/copy-public

Copies procedure screenshots to public bucket when SOP is made public.

#### Request

```typescript
interface CopyToPublicRequest {
  procedureId: string;
}
```

#### Response

```typescript
interface CopyToPublicResponse {
  copiedFiles: number;
  publicUrls: Record<string, string>; // stepId -> publicUrl
}
```

#### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 401 | `UNAUTHORIZED` | User not authenticated |
| 403 | `FORBIDDEN` | User doesn't own procedure |
| 404 | `PROCEDURE_NOT_FOUND` | Procedure doesn't exist |

---

## Edge Function: generate-document

Supabase Edge Function for AI document generation.

### Invocation

```typescript
// Called internally from /api/documents/generate
const { data, error } = await supabase.functions.invoke('generate-document', {
  body: {
    procedureId: string,
    title: string,
    steps: Array<{
      orderIndex: number,
      actionType: string,
      elementText: string | null,
      pageTitle: string | null,
      pageUrl: string,
      generatedText: string | null,
      screenshotUrl: string | null
    }>
  }
})
```

### Response

```typescript
interface GenerateDocumentFunctionResponse {
  content: SOPDocumentContent;
}
```

### OpenAI System Prompt

```
Você é um especialista em criar documentação de procedimentos operacionais padrão (SOP).
Sua tarefa é transformar uma série de passos capturados de uma gravação de tela em um
documento SOP profissional e bem estruturado em português brasileiro.

O documento deve incluir:
1. Objetivo: Uma descrição clara do propósito do procedimento
2. Pré-requisitos: Lista de itens necessários antes de começar
3. Passos: Instruções detalhadas e numeradas para cada ação
4. Conclusão: Um resumo do que foi realizado

Diretrizes:
- Use linguagem clara e profissional em português brasileiro
- Seja conciso mas completo
- Inclua dicas úteis quando apropriado
- Mantenha consistência no formato e tom

Retorne o resultado como um objeto JSON válido seguindo a estrutura especificada.
```

---

## Common Types

```typescript
// Shared error response format
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Authentication header
// All endpoints require:
// Authorization: Bearer <supabase-access-token>
```

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/screenshots/signed-url | 100/min | Per user |
| /api/documents/generate | 5/day | Per procedure |
| /api/documents/:id/export | 20/hour | Per user |
