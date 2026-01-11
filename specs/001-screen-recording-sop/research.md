# Research: Screen Recording & SOP Generation

**Feature**: 001-screen-recording-sop
**Date**: 2026-01-06
**Status**: Complete

## Overview

This document captures technical research and decisions for implementing the screen recording and SOP generation feature.

---

## 1. Chrome Extension Architecture (Manifest V3)

### Decision
Use Chrome Extension Manifest V3 with Service Worker for background processing.

### Rationale
- Manifest V3 is now required for Chrome Web Store submissions
- Service Workers provide better performance and security
- Aligns with Chrome's long-term extension platform direction

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Manifest V2 | Deprecated, not accepted in Chrome Web Store |
| Firefox WebExtensions | Out of MVP scope (Chrome-only per spec) |

### Implementation Notes
- Service Worker lifecycle: must handle termination gracefully
- Use `chrome.storage.local` for recording state persistence
- Screenshot capture via `chrome.tabs.captureVisibleTab()` API
- Content script injection for DOM event monitoring

---

## 2. Screenshot Capture Strategy

### Decision
Capture full visible tab using `chrome.tabs.captureVisibleTab()`, then compress client-side before upload.

### Rationale
- Native Chrome API, reliable across all websites
- Captures exactly what user sees (WYSIWYG)
- Client-side compression reduces upload time and storage costs

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| html2canvas | Inconsistent rendering, misses iframes/canvas |
| Screen Capture API | Requires explicit user permission per session |
| Server-side screenshot | Adds complexity, can't capture authenticated pages |

### Implementation Notes
- Compress using Canvas API + `toBlob()` with quality parameter
- Target: <200KB per screenshot (JPEG quality 0.7-0.8)
- Store temporarily in IndexedDB during recording
- Batch upload to Supabase Storage on recording stop

---

## 3. Click/Event Capture Mechanism

### Decision
Use content script with delegated event listeners on `document` to capture click events.

### Rationale
- Single listener handles all clickable elements
- Works with dynamically added elements
- Minimal performance impact

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| MutationObserver + direct listeners | Higher memory usage, complex cleanup |
| Monkey-patching addEventListener | Fragile, breaks on some sites |

### Implementation Notes
```typescript
// Capture strategy
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const step = {
    timestamp: Date.now(),
    url: window.location.href,
    selector: generateSelector(target),
    coordinates: { x: e.clientX, y: e.clientY },
    elementText: target.innerText?.slice(0, 100),
    elementType: target.tagName.toLowerCase(),
  };
  // Send to background script
}, { capture: true, passive: true });
```

### Element Selector Generation
Priority order for reliable selectors:
1. `data-testid` or `data-cy` attributes
2. `id` attribute (if unique)
3. Unique `aria-label`
4. CSS path (fallback)

---

## 4. AI Text Generation Approach

### Decision
Use OpenAI GPT-4 API via Supabase Edge Function with structured prompting for Brazilian Portuguese output.

### Rationale
- GPT-4 produces high-quality instructional text
- Edge Functions provide secure API key management
- Structured prompts ensure consistent output format

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Claude API | Similar quality, but OpenAI more cost-effective for this use case |
| Local LLM | Insufficient quality for professional documentation |
| Template-based | Too rigid, poor user experience |

### Implementation Notes
- Prompt structure:
  1. System prompt: Role as technical writer, Brazilian Portuguese, professional tone
  2. Context: Screenshot description, element clicked, page URL
  3. Output format: JSON with `title`, `description`, `tip` fields
- Batch processing: Send all steps in single request with context
- Estimated tokens: ~500 input + ~200 output per step
- Cost estimate: ~$0.015 per step at GPT-4 pricing

### Prompt Template
```
Você é um redator técnico especializado em criar documentação de processos.
Analise a seguinte ação do usuário e gere uma descrição clara em português brasileiro.

Contexto:
- URL: {url}
- Elemento clicado: {elementType} com texto "{elementText}"
- Posição: {coordinates}

Gere uma descrição que explique:
1. O QUE o usuário fez
2. POR QUE essa ação é necessária (se inferível pelo contexto)

Responda em JSON: {"description": "...", "tip": "..."}
```

---

## 5. Image Annotation Strategy

### Decision
Generate annotations server-side using Sharp.js in Supabase Edge Function.

### Rationale
- Consistent output across all browsers/devices
- Sharp.js is fast and runs in Deno (Edge Functions)
- Offloads processing from client

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Client-side Canvas | Inconsistent results, increases bundle size |
| Fabric.js | Overkill for simple annotations |
| CSS overlays | Can't be exported to PDF |

### Implementation Notes
- Annotation types: circle highlight, numbered badge
- Circle: red stroke (#EF4444), 40px radius, 3px stroke
- Badge: numbered circle in top-left of annotation area
- Output: PNG with transparency preserved

---

## 6. PDF Generation Approach

### Decision
Use @react-pdf/renderer for server-side PDF generation in Edge Function.

### Rationale
- React-based API matches frontend stack
- High-quality output with custom styling
- Works in Deno runtime

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| jsPDF | Lower quality, limited layout control |
| Puppeteer/Playwright | Too heavy for Edge Functions |
| Client-side generation | Inconsistent across browsers |

### Implementation Notes
- PDF structure:
  1. Cover page: title, date, author
  2. Table of contents (if >10 steps)
  3. Steps: numbered, screenshot, description
- Page size: A4 portrait
- Fonts: Inter (for Portuguese diacritics support)
- Max image size in PDF: 80% page width

---

## 7. Real-time Updates Architecture

### Decision
Use Supabase Realtime for progress updates during SOP generation.

### Rationale
- Built into Supabase, no additional infrastructure
- Low latency for status updates
- Postgres changes broadcast automatically

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Polling | Higher latency, more requests |
| WebSocket server | Additional infrastructure |
| Server-Sent Events | Less browser support |

### Implementation Notes
- Subscribe to `procedures` table changes
- Status enum: `processing`, `annotating`, `generating`, `complete`, `error`
- Progress: percentage (0-100) stored in `processing_progress` column
- Client displays progress bar during generation

---

## 8. Authentication Flow

### Decision
Use Supabase Auth with email/password and Google OAuth.

### Rationale
- Built into Supabase, minimal configuration
- Handles session management automatically
- Google OAuth reduces friction for Brazilian market

### Alternatives Considered
| Alternative | Rejected Because |
|-------------|------------------|
| Auth0 | Additional cost, complexity |
| NextAuth.js | Redundant with Supabase Auth |
| Custom JWT | Maintenance burden |

### Implementation Notes
- Extension: Store session in `chrome.storage.local`
- Dashboard: Use Supabase Auth helpers for Next.js
- Protected routes: Middleware checks session
- Token refresh: Handled automatically by Supabase client

---

## 9. Storage Architecture

### Decision
Supabase Storage with per-user buckets and signed URLs.

### Rationale
- Integrated with Supabase Auth for RLS
- Signed URLs provide secure, temporary access
- CDN included for fast global delivery

### Implementation Notes
- Bucket structure: `screenshots/{user_id}/{procedure_id}/{step_id}.jpg`
- Public bucket for shared SOPs: `public/{procedure_slug}/`
- Signed URLs: 1-hour expiry for private content
- Public URLs: permanent for shared SOPs
- Lifecycle: Delete screenshots when procedure deleted (cascade)

---

## 10. Testing Strategy

### Decision
Three-tier testing: Unit (Vitest/Jest), Integration (Testing Library), E2E (Playwright).

### Rationale
- Matches constitution requirements
- Each tier catches different bug categories
- Playwright supports Chrome extension testing

### Test Distribution
| Type | Coverage Target | Scope |
|------|-----------------|-------|
| Unit | 80% | Services, utilities, state logic |
| Integration | Key flows | API calls, component interactions |
| E2E | Critical paths | Full user journeys (5 scenarios) |

### Critical E2E Scenarios
1. Install extension → Start recording → Stop → View steps
2. Generate SOP from recording → View result
3. Edit SOP → Auto-save → Verify persistence
4. Export to PDF → Download → Verify content
5. Share SOP → Access public link → View content

---

## Summary

All technical decisions align with:
- Constitution principles (code quality, testing, UX, performance)
- Specified technology stack (React/Vite, Next.js 15, Supabase)
- Feature requirements from spec.md
- MVP scope and timeline constraints

No unresolved clarifications remain. Ready for Phase 1 design.
