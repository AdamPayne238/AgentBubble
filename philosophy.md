# Agent Bubble Operating System

AgentBubbleOS is a practical operating system for human-directed agentic engineering.

It is built around one governing rule:

**The agent may implement, but it may not silently redefine the problem.**

## 1. Context Factory

Purpose: compress the project into agent-usable context.

Includes:

- product goal
- current architecture
- coding patterns
- brand/taste rules
- security rules
- database rules
- "do not touch" areas
- known failure modes
- definition of good work

Core idea:

> Agents are only as good as the context bubble they operate inside.

## 2. Ticket Intake Loop

Before coding, the agent must answer:

- What is the ticket asking?
- What problem is actually being solved?
- What files/domains are likely involved?
- What is unknown?
- What should not change?
- What is the smallest safe implementation?
- What is the acceptance criteria?

Purpose:

Prevent agents from wandering through the codebase or redefining scope.

## 3. Implementation Loop

Rules:

- follow existing patterns
- touch the fewest files possible
- no opportunistic refactors
- no architecture changes unless explicitly required
- build one slice at a time
- test after each meaningful change
- fix only what is related

Purpose:

This is the anti-chaos layer.

## 4. Audit / PR Review Loop

Before calling work complete:

- inspect diff
- check for overengineering
- check for security regressions
- check for auth/RLS/data leaks
- check for duplicate logic
- check for broken UX
- check for missing tests
- check if ticket scope was exceeded

Purpose:

This is where agentic engineering beats vibe coding.

## 5. Definition of Done

Ready for QA means:

- ticket acceptance criteria satisfied
- tests pass
- build passes
- no unrelated files changed
- migration impact understood
- UI manually testable
- rollback risk understood
- PR summary explains what changed and why

Ready for production means:

- QA validated
- no critical bugs
- no auth/payment/data risk
- monitoring/logging acceptable
- user impact understood
