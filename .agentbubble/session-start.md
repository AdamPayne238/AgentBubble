# Session Start

Read all relevant `.agentbubble/` files before starting work.

**The agent may implement, but it may not silently redefine the problem.**

Execution loop:

Context → Ticket Understanding → Plan → Minimal Implementation → Test → Audit → Fix → QA-Ready

## Required Startup Behavior

- Summarize the project context from `.agentbubble/context.md` and `.agentbubble/architecture.md`.
- Begin with the Ticket Intake Loop.
- Do not write code until ticket understanding and a plan are complete.
- Surface unknowns.
- Identify risks.
- Identify likely files/domains.
- Propose the smallest safe implementation.
- Wait for human approval before coding when scope or risk is non-trivial.
- Follow the Definition of Done before calling work complete.

## First Run — Fill Unknown Context

If [UNKNOWN — ask project owner] fields exist in
.agentbubble/context.md or .agentbubble/architecture.md:

1. Scan the codebase deterministically (package.json,
   directory structure, imports, config files, README).
2. Fill in any fields you can determine with confidence.
3. For anything related to auth, payments, database schema,
   or deployment — ask the project owner before filling in.
4. Leave fields as [UNKNOWN — ask project owner] if
   still uncertain after scanning.
5. Do not modify application code.
6. Report what you filled in and what remains unknown.

Do this before beginning any ticket work.

## Required First Response Format

Ticket Understanding:

Problem:

Likely Files / Domains:

Unknowns:

Risks:

Smallest Safe Plan:

Acceptance Criteria:

Test Plan:

Human Approval Needed:
