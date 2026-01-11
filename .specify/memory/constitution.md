<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 0.0.0 → 1.0.0 (MAJOR - Initial constitution ratification)

Modified Principles: N/A (Initial version)

Added Sections:
- Core Principles (4 principles)
  - I. Code Quality First
  - II. Test-Driven Development
  - III. UX Consistency
  - IV. Performance by Design
- Technical Standards
- Quality Gates

Removed Sections: N/A (Initial version)

Templates Requiring Updates:
- .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
- .specify/templates/spec-template.md: ✅ Compatible (Success Criteria aligns with principles)
- .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports principles)

Follow-up TODOs: None

================================================================================
-->

# ProceduraAI Constitution

## Core Principles

### I. Code Quality First

All code MUST adhere to strict quality standards that prioritize maintainability,
readability, and long-term sustainability over short-term velocity.

**Non-Negotiable Rules:**
- TypeScript strict mode MUST be enabled across all packages (frontend, extension, backend)
- ESLint and Prettier configurations MUST be enforced via pre-commit hooks
- No `any` types allowed without explicit justification documented in code comments
- All functions MUST have explicit return types
- Maximum cyclomatic complexity of 10 per function; exceeding requires refactoring or documented exception
- Code reviews MUST be completed before merging to main branch
- Dead code MUST be removed immediately; no commented-out code blocks allowed in commits

**Rationale:** ProceduraAI is a long-term product targeting enterprise customers. Code debt
compounds rapidly and undermines reliability. Strict standards from day one prevent
technical bankruptcy as the product scales.

### II. Test-Driven Development

Testing is MANDATORY, not optional. Every feature MUST have corresponding tests written
BEFORE implementation begins.

**Non-Negotiable Rules:**
- Unit test coverage MUST be ≥80% for all business logic (services, utilities, state management)
- Integration tests MUST cover all API endpoints and database operations
- E2E tests MUST cover critical user flows: recording, processing, editing, exporting
- Chrome extension MUST have dedicated tests for content scripts and background workers
- Tests MUST fail before implementation (Red-Green-Refactor cycle strictly enforced)
- No PR merges allowed with failing tests or coverage regression
- Flaky tests MUST be fixed or quarantined within 24 hours of detection

**Rationale:** ProceduraAI handles sensitive user data (screenshots, process documentation).
Bugs in production erode user trust and can cause data loss. The cost of fixing bugs
post-deployment far exceeds the cost of prevention through testing.

### III. UX Consistency

User experience MUST be consistent, intuitive, and aligned with established design
patterns across all surfaces: extension popup, web dashboard, public procedure views.

**Non-Negotiable Rules:**
- All UI components MUST use the shared design system (Tailwind CSS + component library)
- Color palette, typography, and spacing MUST follow defined design tokens
- Loading states MUST be implemented for all async operations (skeleton loaders preferred)
- Error states MUST provide actionable guidance in Portuguese, never raw error codes
- Accessibility MUST meet WCAG 2.1 AA standards minimum
- Responsive design MUST work on viewports from 320px to 2560px width
- User feedback (toasts, modals, confirmations) MUST follow established patterns
- Copy and microcopy MUST be reviewed for Brazilian Portuguese natural tone

**Rationale:** ProceduraAI's value proposition centers on simplicity and ease of use.
Inconsistent UX creates friction, increases support burden, and damages brand perception
in a market where we compete on user experience against more established tools.

### IV. Performance by Design

Performance MUST be considered from design phase, not retrofitted. Every feature
MUST meet defined performance budgets before release.

**Non-Negotiable Rules:**
- Web dashboard: First Contentful Paint (FCP) < 1.5s, Time to Interactive (TTI) < 3s
- Chrome extension: Popup load time < 500ms, recording start < 200ms
- API endpoints: p95 response time < 500ms for reads, < 2s for writes
- AI processing: Complete procedure generation < 60s for up to 20 steps
- Image optimization: Screenshots MUST be compressed to < 200KB each
- Bundle sizes: Dashboard JS bundle < 300KB gzipped, extension < 100KB
- Database queries MUST use indexes; full table scans require documented justification
- Memory leaks MUST be addressed immediately; extension MUST not exceed 50MB RAM

**Rationale:** Performance directly impacts user perception and business metrics.
Slow tools get abandoned. The Brazilian market has diverse internet connectivity;
performance optimization ensures accessibility across all user segments.

## Technical Standards

### Technology Stack Compliance

All development MUST use the approved technology stack:

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Web | Next.js + Tailwind CSS | 14.x |
| Extension | TypeScript + Manifest V3 | Latest Chrome |
| Backend/API | Supabase Edge Functions | Latest |
| Database | PostgreSQL (Supabase) | 15.x |
| Storage | Supabase Storage | Latest |
| AI/LLM | OpenAI GPT-4 / Claude API | Latest stable |
| Testing | Jest + Playwright + Testing Library | Latest |

Stack modifications require constitution amendment.

### Security Requirements

- All user data MUST be encrypted at rest and in transit
- Authentication MUST use Supabase Auth with proper session management
- API keys and secrets MUST never be committed to version control
- LGPD compliance MUST be maintained (Brazilian data protection law)
- User screenshots MUST be stored in isolated per-user storage buckets
- Public procedure links MUST use non-guessable UUIDs (not sequential IDs)

### Code Organization

Repository structure MUST follow the defined architecture:

```
proceduraai/
├── frontend/          # Next.js dashboard
├── extension/         # Chrome extension
├── backend/           # Supabase configurations
└── packages/          # Shared code (future)
```

Cross-package dependencies MUST be explicitly declared and version-locked.

## Quality Gates

### Pre-Merge Checklist

Every PR MUST pass these gates before merge:

1. **Linting**: Zero ESLint errors, zero Prettier violations
2. **Types**: Zero TypeScript errors in strict mode
3. **Tests**: All tests pass, coverage thresholds met
4. **Build**: Production build completes without warnings
5. **Review**: At least one approval from code owner
6. **Performance**: No regression in Lighthouse scores (for UI changes)
7. **Security**: No new vulnerabilities introduced (dependency audit)

### Release Checklist

Every release MUST complete:

1. All quality gates passed on release branch
2. E2E tests pass in staging environment
3. Performance benchmarks within defined budgets
4. Changelog updated with user-facing changes
5. Database migrations tested on staging data copy

## Governance

This constitution represents the non-negotiable standards for ProceduraAI development.
All team members, contributors, and automated systems MUST enforce these principles.

### Amendment Process

1. Propose amendment via documented PR to constitution file
2. Provide rationale explaining why change is necessary
3. Assess impact on existing codebase and templates
4. Obtain approval from project maintainers
5. Update all dependent templates and documentation
6. Communicate changes to all contributors

### Versioning Policy

Constitution follows semantic versioning:
- **MAJOR**: Principle removal or fundamental redefinition
- **MINOR**: New principle added or significant expansion
- **PATCH**: Clarifications, wording improvements, non-semantic changes

### Compliance Review

- All PRs MUST be reviewed against constitution principles
- Quarterly audits SHOULD assess overall codebase compliance
- Violations MUST be documented and remediation planned
- Persistent violations require process or tooling improvements

**Version**: 1.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
