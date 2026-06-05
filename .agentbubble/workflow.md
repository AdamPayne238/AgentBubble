# Workflow

**The agent may implement, but it may not silently redefine the problem.**

Execution loop:

Context → Ticket Understanding → Plan → Minimal Implementation → Test → Audit → Fix → QA-Ready

## Context Factory

Read the local `.agentbubble/` files and compress the project into usable working context.

Use:

- `context.md`
- `architecture.md`
- `coding-rules.md`
- `human-gates.md`
- `definition-of-done.md`
- `current-ticket.md`

## Ticket Intake Loop

Before coding, answer:

- What is the ticket asking?
- What problem is actually being solved?
- What files/domains are likely involved?
- What is unknown?
- What should not change?
- What is the smallest safe implementation?
- What is the acceptance criteria?

## Implementation Loop

- follow existing patterns
- touch the fewest files possible
- no opportunistic refactors
- no architecture changes unless explicitly required
- build one slice at a time
- test after each meaningful change
- fix only what is related

## Audit / PR Review Loop

Before calling work complete:

- inspect diff
- check for overengineering
- check for security regressions
- check for auth/RLS/data leaks
- check for duplicate logic
- check for broken UX
- check for missing tests
- check if ticket scope was exceeded

## Definition of Done

Use `definition-of-done.md` before marking work QA-ready or production-ready.

## Context Decay Checkpoint

During long sessions, periodically re-summarize:

- current goal
- files changed
- decisions made
- remaining work
- risks
- next action

## Session End

Before closing a session:

- Did any architectural decisions get made? Update `architecture.md`.
- Did a new failure mode surface? Update `context.md`.
- Did any coding rules need clarification? Update `coding-rules.md`.
- Did any human gates trigger? Record them in `current-ticket.md`.
- Is `current-ticket.md` complete with implementation notes, test results, and final summary?
- Are there unresolved risks or follow-up tasks? Record them clearly.

Do not silently rely on chat history. Preserve durable context in `.agentbubble/` files.
