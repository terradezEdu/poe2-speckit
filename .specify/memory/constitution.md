<!--
Sync Impact Report (temporary review material; remove before committing)
Version change: unratified scaffold → 1.0.0 (initial adoption)
Modified principles: none previously adopted; established principles I–VII below.
Added sections: Core Principles (seven populated principles), Product Direction and Boundaries,
Development Workflow, Governance.
Removed sections: none; replaced all scaffold placeholders and illustrative comments.
Dependent templates and commands: unchanged; read this constitution at runtime.
Follow-up TODOs: none. Visual references have not been supplied or approved; track that uncertainty
in the relevant specification before claiming visual acceptance.
-->
# PoE2 Campaign Companion Constitution

## Core Principles

### I. Visual Fidelity Is a Primary Product Requirement

Approved visual references MUST guide layout, atmosphere, typography, composition, palettes,
textures, and interactions. Resemblance to those references MUST be an explicit product success
criterion. Visual quality MUST be verified using actual browser screenshots of relevant states;
source inspection and functional correctness alone do not establish visual acceptance.
Significant deviations MUST be documented, justified, and reviewed. Major UI milestones MUST
receive human visual approval. Missing or incomplete references MUST be recorded as uncertainty;
agents MUST NOT invent approval criteria or claim approval that has not occurred.

### II. Incremental, Working Software

Development MUST proceed in small, independently verifiable increments that keep the application
runnable. A compelling, functional end-to-end slice of the core interactive map MUST precede
secondary features and broader campaign coverage. Each increment MUST preserve a practical path
to extending the product without unnecessary architectural rework. The full product MUST NOT be
attempted in a single development cycle; incremental delivery MUST NOT impose an artificial
ceiling on eventual campaign coverage.

### III. Specification Before Implementation

Observable behavior and testable acceptance criteria MUST be specified before feature code is
written. Material ambiguities MUST be explicitly resolved before dependent implementation.
Specifications MUST describe what users can accomplish, remain understandable and maintainable,
and separate product requirements from technical decisions. Technology selection and internal
implementation details belong in planning unless an approved product constraint requires them.

### IV. Evidence-Based Quality

Critical interactions and user journeys MUST be verified through automated tests. Browser-based
checks MUST cover important interactions, navigation flows, and visual states where relevant;
visual acceptance MUST also satisfy Principle I. Test effort MUST reflect risk and complexity,
favor observable behavior, and provide meaningful evidence over arbitrary coverage targets.
Acceptance criteria MUST NOT be changed merely to make failing tests pass. Unresolved critical
failures MUST block feature acceptance. Verification evidence and remaining limitations MUST be
recorded with the work, without introducing excessive testing bureaucracy.

### V. Simplicity and Maintainability

Existing tools, established libraries, and proven solutions MUST be evaluated before equivalent
functionality is built from scratch. Dependencies, abstractions, and architectural complexity
MUST be justified by demonstrated requirements. Code MUST remain readable and modular, with UI,
application behavior, and game data reasonably separated so each can evolve. Maintainability
decisions MUST account for user experience; speculative architecture and custom frameworks
without demonstrated need MUST be avoided.

### VI. Effective Use of Agent Skills

Agents MUST assess available skills for each task and proactively use those whose expertise can
materially improve the outcome. Relevant areas include frontend design, browser testing, React
engineering when applicable, test-driven development, and UX validation. Skill use MUST produce
verifiable value and MUST NOT override approved requirements or this constitution. Standard
GitHub Spec Kit remains the primary workflow; redundant procedures, conflicting instructions,
and unnecessary agent orchestration MUST be avoided. Skills MUST NOT be invoked solely to
demonstrate their use.

### VII. Content Integrity and Responsible Asset Usage

Game information MUST be traceable to identifiable sources. Verified facts MUST be distinguished
from incomplete, outdated, or uncertain information, with relevant game version or verification
date recorded when known. Boss mechanics, damage types, resistances, weaknesses, rewards, and
other gameplay facts MUST NOT be invented and presented as verified. Asset use MUST have an
identified permission or license basis; unrestricted use of proprietary artwork MUST NOT be
assumed. Original or appropriately licensed alternatives MUST be used where necessary. Content
MUST be organized so facts and sources can be updated as the game evolves.

## Product Direction and Boundaries

PoE2 Campaign Companion is an interactive campaign-map companion for Path of Exile 2, pursuing an
immersive dark-fantasy experience closely resembling its campaign map. The enduring direction
combines connected, interactive locations with useful encounter and campaign information,
including Hardcore warnings. Complete campaign coverage is the long-term vision; the first
delivery scope MUST be selected during specification as a compelling vertical slice.

This project also evaluates GitHub Spec Kit and installed agent skills through product quality,
visual fidelity, maintainability, and development autonomy. This experiment MUST NOT introduce
custom methodology layers. VEDD rules, roles, governance mechanisms, and workflow structures
MUST NOT be imported. Feature requirements belong in specifications; technology choices and
architecture belong in plans. No visual references are presumed supplied or approved.

## Development Workflow

Use standard Spec Kit specification, clarification where needed, planning, task generation, and
implementation workflows. Specifications, plans, tasks, and implementation MUST remain
consistent with this constitution and with approved requirements. Each increment MUST identify
its observable acceptance criteria, applicable visual references or gaps, and proportionate
verification evidence within the normal Spec Kit artifacts.

Agents retain autonomy to propose technical solutions and make routine implementation choices
within approved scope. Human approval MUST be obtained for significant changes to product
intent, approved requirements, or major visual references, and for major UI visual milestones.
Additional mandatory approval gates MUST NOT be introduced without an explicit requirement or
documented product risk that justifies them.

## Governance

This constitution governs project specifications, plans, tasks, implementation, and supporting
skill guidance. Normal artifact and change reviews MUST check compliance; a separate review
ceremony is not required. When principles conflict, the responsible agent or contributor MUST
identify the trade-off, explain its impact, and recommend a resolution. Any resolution that
changes approved intent, requirements, or major visual references MUST receive human approval.

Amendments MUST document their rationale, affected principles, and downstream impact, then
update the version and amendment date. Significant changes to product intent, approved
requirements, or major visual references require human approval under the workflow above.
Affected specifications, plans, tasks, and implementation MUST be reconciled before dependent
work proceeds. No blanket exemption from this constitution is implied by an amendment proposal.

Constitution versions follow semantic versioning: MAJOR for incompatible principle or governance
removals or redefinitions; MINOR for new principles, sections, or materially expanded guidance;
PATCH for clarifications and other non-semantic refinements. Preserve the original ratification
date and update the last-amended date whenever the constitution changes.

**Version**: 1.0.0 | **Ratified**: 2026-10-16 | **Last Amended**: 2026-10-16
