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
