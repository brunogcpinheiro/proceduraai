# Feature Specification: Save SOP Recordings

**Feature Branch**: `002-save-sop-recordings`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Vamos criar a feature de salvar os records. Testei e ele está capturando cliques e creio que tambem está gravando a tela. Vamos salvar os SOPs e criar uma pagina onde podemos ver essas gravações."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save Recording When Finished (Priority: P1)

As a user recording a procedure, when I finish capturing steps, I want to save the recording so that it is permanently stored and I can access it later.

**Why this priority**: This is the core functionality - without saving, all captured data is lost. Users cannot derive any value from the recording feature if they cannot persist their work.

**Independent Test**: Can be fully tested by recording a procedure, clicking "Stop/Save", and verifying the recording appears in the user's saved list with all captured steps intact.

**Acceptance Scenarios**:

1. **Given** I am recording a procedure with captured steps, **When** I click the stop/save button, **Then** all captured steps and screenshots are saved to my account
2. **Given** I have finished recording, **When** the save process completes, **Then** I see a confirmation message with a link to view the saved SOP
3. **Given** I am saving a recording, **When** a network error occurs, **Then** the recording is saved locally and automatically synced when connection is restored
4. **Given** I have captured 50 steps with screenshots, **When** I save the recording, **Then** all steps and screenshots are preserved without data loss

---

### User Story 2 - View Saved Recordings List (Priority: P1)

As a user, I want to see a list of all my saved SOP recordings so that I can find and access any procedure I have created.

**Why this priority**: Users need to access their saved work. This is essential for the feature to provide value - recording without retrieval is useless.

**Independent Test**: Can be fully tested by navigating to the recordings page and verifying all saved SOPs appear in a list with relevant metadata.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I navigate to the recordings page, **Then** I see a list of all my saved SOPs sorted by most recent first
2. **Given** I have multiple recordings, **When** I view the list, **Then** I see the title, date created, step count, and status for each recording
3. **Given** I have no recordings yet, **When** I view the recordings page, **Then** I see an empty state with guidance on how to create my first SOP
4. **Given** I have many recordings, **When** I view the list, **Then** I can search and filter recordings by title, date, or status

---

### User Story 3 - View Individual Recording Details (Priority: P1)

As a user, I want to view the details of a specific SOP recording so that I can see all the captured steps and screenshots.

**Why this priority**: Viewing the captured content is the primary way users consume the value of their recordings. Without this, saved data cannot be reviewed or used.

**Independent Test**: Can be fully tested by clicking on a recording from the list and verifying all steps display with their screenshots, descriptions, and metadata.

**Acceptance Scenarios**:

1. **Given** I am viewing the recordings list, **When** I click on a recording, **Then** I see the full details page with all captured steps
2. **Given** I am viewing a recording detail, **When** I look at each step, **Then** I see the screenshot on the left and action description with metadata on the right in a vertical timeline
3. **Given** I am viewing a recording with many steps, **When** I scroll through, **Then** steps are displayed in chronological order as a vertical timeline with clear visual flow
4. **Given** I am viewing a step screenshot, **When** I click on it, **Then** I can view it in full size

---

### User Story 4 - Edit Recording Metadata (Priority: P2)

As a user, I want to edit the title and description of my saved recordings so that I can organize and document my SOPs properly.

**Why this priority**: While not blocking core functionality, proper organization helps users manage multiple SOPs effectively.

**Independent Test**: Can be fully tested by opening a recording, editing title/description, saving, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** I am viewing a recording, **When** I click edit, **Then** I can modify the title and description
2. **Given** I have edited the metadata, **When** I save changes, **Then** the updated information is displayed and persisted
3. **Given** I am editing, **When** I cancel without saving, **Then** my changes are discarded and original values remain

---

### User Story 5 - Delete Recording (Priority: P2)

As a user, I want to delete recordings I no longer need so that I can keep my workspace organized.

**Why this priority**: Important for data management but not blocking core save/view functionality.

**Independent Test**: Can be fully tested by selecting a recording, deleting it, and verifying it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** I am viewing a recording, **When** I click delete, **Then** I see a confirmation dialog before deletion
2. **Given** I confirm deletion, **When** the process completes, **Then** the recording and all its data are permanently removed
3. **Given** I am on the confirmation dialog, **When** I cancel, **Then** the recording remains intact

---

### User Story 6 - Share Recording via Public Link (Priority: P2)

As a user, I want to share my SOP recordings via a public link so that others can view my documented procedures without needing an account.

**Why this priority**: Sharing extends the value of recordings beyond personal use, enabling team collaboration and knowledge distribution.

**Independent Test**: Can be fully tested by generating a share link, opening it in an incognito browser, and verifying the recording is viewable.

**Acceptance Scenarios**:

1. **Given** I am viewing my recording, **When** I click the share button, **Then** I can generate a public link
2. **Given** I have a public link, **When** someone without an account opens it, **Then** they can view the full recording
3. **Given** I have shared a recording, **When** I toggle it back to private, **Then** the public link no longer works

---

### Edge Cases

- What happens when the user closes the browser while saving? Recording should be recoverable from local storage.
- How does the system handle recordings with corrupted screenshot data? Display placeholder and log error.
- What happens when storage quota is exceeded? Alert user and suggest deleting old recordings.
- How are concurrent edits handled if user has multiple tabs open? Last write wins with timestamp-based conflict resolution.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST save all captured steps when user finishes recording, including action type, element selector, element text, coordinates, URL, and timestamp
- **FR-002**: System MUST save all screenshots associated with each step
- **FR-003**: System MUST display a list of all saved recordings for the authenticated user
- **FR-004**: System MUST display recording metadata in the list view (title, creation date, step count, status)
- **FR-005**: System MUST allow users to view full details of any saved recording
- **FR-006**: System MUST display each step with its screenshot, action description, and metadata
- **FR-007**: System MUST allow users to edit recording title and description
- **FR-008**: System MUST allow users to delete recordings with confirmation
- **FR-009**: System MUST persist recordings offline and sync when connection is restored
- **FR-010**: System MUST provide search, filter, and pagination capabilities for recordings list (20 items per page)
- **FR-011**: System MUST show a progress indicator while saving large recordings
- **FR-012**: System MUST display steps in chronological order of capture
- **FR-013**: System MUST provide full-size screenshot viewing capability
- **FR-014**: System MUST show an empty state with guidance when no recordings exist
- **FR-015**: System MUST allow users to generate a public sharing link for any recording
- **FR-016**: System MUST allow users to toggle recording visibility (private/public)
- **FR-017**: System MUST allow anyone with a public link to view the recording without authentication

### Key Entities

- **Procedure (SOP)**: A complete recorded workflow containing title, description, status (draft/recording/processing/ready/error), creation timestamp, step count, and associated user
- **Step**: An individual captured action within a procedure, containing action type (click/input/navigate/scroll/select), element information (selector, text, tag), coordinates, URL, screenshot reference, and timestamp
- **Screenshot**: Image capture of the screen at the moment of each step, stored with reference to its parent step

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can save a complete recording in under 10 seconds for recordings with up to 50 steps
- **SC-002**: Users can find any saved recording within 15 seconds using search or browsing
- **SC-003**: 100% of captured steps and screenshots are preserved after save without data loss
- **SC-004**: Recordings saved offline sync successfully within 30 seconds of connection restoration
- **SC-005**: Users can view a recording's full details page within 3 seconds of clicking
- **SC-006**: 95% of users successfully save their first recording without encountering errors
- **SC-007**: Users can manage (edit/delete) their recordings without needing support assistance

## Clarifications

### Session 2026-01-11

- Q: Como a lista de gravações deve lidar com muitos registros? → A: Paginação tradicional (ex: 20 por página com navegação)
- Q: Qual modelo de privacidade e compartilhamento? → A: Compartilhamento básico via link público (usando public_slug existente)
- Q: Qual ordenação padrão da lista de gravações? → A: Mais recentes primeiro (por data de criação)
- Q: Como os passos devem ser exibidos na página de detalhes? → A: Timeline vertical (screenshot à esquerda, descrição à direita)

## Assumptions

- User is authenticated before recording (existing auth system in place)
- Extension has necessary permissions for screen capture (already configured)
- Supabase database schema for procedures and steps already exists
- Screenshot storage bucket is configured and accessible
- Users have reasonable internet connectivity for sync (offline-first as fallback)
- Maximum of 100 steps per recording (existing configuration)
