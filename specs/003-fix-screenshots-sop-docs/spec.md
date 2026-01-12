# Feature Specification: Fix Screenshots Display & SOP Document Generation

**Feature Branch**: `003-fix-screenshots-sop-docs`
**Created**: 2026-01-12
**Status**: Draft
**Input**: User description: "Precisamos fazer duas features agora. A primeira é corrigir os screenshots porque eles não estou aparecendo no detalhes de um sop e nem como thumbnail na listagem. E depois precisamos fazer a feature de pegar esses steps e criar um documento SOP com openai."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Screenshots in SOP Details (Priority: P1)

A user navigates to the details page of an existing SOP and wants to see the screenshots captured for each step of the procedure. Currently, screenshots are not displaying, preventing users from reviewing the visual documentation of their recorded procedures.

**Why this priority**: Screenshots are the core visual documentation of SOPs. Without them, users cannot verify what was recorded or use the SOP effectively for training or reference purposes. This is a critical bug fix that blocks the primary value proposition of the application.

**Independent Test**: Can be fully tested by creating a new SOP recording with screenshots and verifying they display correctly in the detail view. Delivers immediate value by restoring core functionality.

**Acceptance Scenarios**:

1. **Given** a user has a saved SOP with captured screenshots, **When** they navigate to the SOP detail page, **Then** each step displays its corresponding screenshot image
2. **Given** a step has both a raw screenshot and an annotated screenshot, **When** viewing the step, **Then** the annotated screenshot is displayed preferentially
3. **Given** a user clicks on a step screenshot, **When** the modal opens, **Then** the full-size image is displayed and navigation between steps works correctly
4. **Given** a step does not have any screenshot, **When** viewing the step, **Then** a placeholder indicating no screenshot is displayed

---

### User Story 2 - View Thumbnails in SOP Listing (Priority: P1)

A user views their list of SOPs on the dashboard and wants to see thumbnail previews for each procedure. Currently, thumbnails are not appearing, making it difficult to quickly identify and distinguish between different SOPs.

**Why this priority**: Thumbnails provide quick visual identification of SOPs in the listing, improving navigation and user experience. This is part of the same bug that affects screenshot display and should be fixed together.

**Independent Test**: Can be fully tested by viewing the dashboard with existing SOPs and verifying thumbnails appear on procedure cards. Delivers immediate value by improving SOP discoverability.

**Acceptance Scenarios**:

1. **Given** a user has SOPs with captured screenshots, **When** they view the SOP listing page, **Then** each SOP card displays a thumbnail image from the first step
2. **Given** an SOP has no screenshots, **When** viewing the listing, **Then** a placeholder icon is displayed instead of a broken image
3. **Given** multiple SOPs exist, **When** scrolling through the list, **Then** thumbnails load progressively without blocking the page

---

### User Story 3 - Generate SOP Document with AI (Priority: P2)

A user wants to create a formal SOP document from their recorded procedure. They click a button to generate the document, and the system uses AI to analyze the steps and create a professional, well-structured SOP document that can be exported or shared.

**Why this priority**: Document generation extends the value of recorded SOPs by creating shareable, professional documentation. This is a new feature that depends on screenshots working correctly first.

**Independent Test**: Can be fully tested by selecting an existing SOP with steps and generating a document. Delivers value by transforming raw step data into professional documentation.

**Acceptance Scenarios**:

1. **Given** a user is viewing an SOP with multiple steps, **When** they click the generate document button, **Then** the system initiates AI document generation with a loading indicator
2. **Given** the AI has analyzed the SOP steps, **When** generation completes, **Then** a structured SOP document is displayed with title, purpose, prerequisites, step-by-step instructions, and screenshots
3. **Given** a document has been generated, **When** the user reviews it, **Then** each step includes the screenshot, action description, and any relevant notes
4. **Given** document generation is complete, **When** the user clicks export, **Then** the document can be downloaded as PDF or viewed for printing

---

### User Story 4 - Edit Generated Document (Priority: P3)

After generating an SOP document, a user wants to review and edit the AI-generated content before finalizing. They can modify step descriptions, add additional notes, or adjust the document structure.

**Why this priority**: Editing capability ensures users can customize AI-generated content to match their specific needs and organizational standards. Lower priority as core generation must work first.

**Independent Test**: Can be fully tested by generating a document and making edits to the content. Delivers value by allowing customization of generated documents.

**Acceptance Scenarios**:

1. **Given** a document has been generated, **When** the user clicks edit on any section, **Then** they can modify the text content
2. **Given** changes have been made to the document, **When** the user saves, **Then** the modified version is preserved
3. **Given** a user is editing, **When** they want to regenerate a specific section, **Then** they can request AI to rewrite just that portion

---

### Edge Cases

- What happens when an SOP has no steps? The generate document button should be disabled with a tooltip explaining steps are required.
- How does the system handle if AI generation fails? Display an error message with retry option, preserve any partial results.
- What happens if a screenshot URL is invalid or the image was deleted? Display a placeholder and continue with text-only content for that step.
- How does the system handle very long SOPs (50+ steps)? Implement pagination or sections in the generated document to maintain readability.
- What happens if the user's session expires during generation? Preserve generation state and allow resuming or notify user to try again.

## Requirements *(mandatory)*

### Functional Requirements

#### Screenshot Display Fix

- **FR-001**: System MUST correctly resolve and display screenshot URLs from Supabase Storage for each step in the SOP detail view
- **FR-002**: System MUST display annotated screenshots when available, falling back to raw screenshots otherwise
- **FR-003**: System MUST correctly resolve and display thumbnail URLs on SOP listing cards
- **FR-004**: System MUST handle missing or invalid screenshot URLs gracefully by displaying placeholder content
- **FR-005**: System MUST use signed URLs with 1-hour expiration for private screenshot access, regenerating URLs when expired
- **FR-005a**: System MUST copy screenshots to public bucket when an SOP is made public, using direct URLs for public access

#### SOP Document Generation

- **FR-006**: System MUST provide a "Generate Document" action on the SOP detail page
- **FR-007**: System MUST send step data (titles, descriptions, action types, screenshots) to AI for document generation
- **FR-008**: System MUST generate a structured SOP document in Brazilian Portuguese containing: title, purpose/overview, prerequisites, numbered step-by-step instructions, screenshots for each step, and conclusion
- **FR-009**: System MUST display generation progress to the user during AI processing
- **FR-010**: System MUST store generated documents associated with their source SOP
- **FR-011**: System MUST allow users to export generated documents as PDF
- **FR-012**: System MUST allow users to edit generated document content before export
- **FR-013**: System MUST maintain document versions when edits are made
- **FR-014**: System MUST limit AI document generation to 5 times per SOP per day and display remaining generation count to user

### Key Entities

- **Procedure**: Parent entity containing metadata (title, status, thumbnail_url). Key attributes: id, user_id, title, thumbnail_url, is_public
- **Step**: Individual recorded action within a procedure. Key attributes: id, procedure_id, order_index, screenshot_url, annotated_screenshot_url, action_type, generated_text
- **SOPDocument**: Generated document from procedure steps, stored as structured JSON in database. Key attributes: id, procedure_id, content (JSON structure with sections), version, generated_at, last_edited_at. PDFs are generated on-demand during export.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of SOPs with valid screenshots display images correctly in both detail view and listing thumbnails
- **SC-002**: Users can view full-size screenshots in modal with navigation between steps in under 1 second
- **SC-003**: SOP document generation completes within 30 seconds for procedures with up to 20 steps
- **SC-004**: Generated documents include all steps with their corresponding screenshots
- **SC-005**: Users can export generated documents to PDF format
- **SC-006**: 95% of users can successfully generate and export an SOP document on first attempt

## Clarifications

### Session 2026-01-12

- Q: Como documentos gerados devem ser armazenados e versionados? → A: Armazenar no banco como JSON estruturado; PDF gerado sob demanda na exportação
- Q: Qual o limite de gerações de documento por IA? → A: Limitar a 5 gerações por SOP por dia; mostrar contador ao usuário
- Q: Como autenticar URLs de screenshots privados? → A: Signed URLs com expiração curta (1 hora); regenerar quando expirar
- Q: Em qual idioma o documento SOP deve ser gerado? → A: Sempre em português brasileiro
- Q: Como tratar screenshots em SOPs públicos? → A: Copiar screenshots para bucket público ao publicar SOP; usar URLs diretas

## Assumptions

- Screenshots are already being captured and uploaded to Supabase Storage correctly during recording (the issue is display, not capture)
- The OpenAI API is available and configured for the backend to use for document generation
- Users have existing SOPs with steps that can be used for document generation
- The application has a working authentication system that provides user identity for Supabase RLS policies
