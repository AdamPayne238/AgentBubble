# Session End

Before closing a session, preserve durable context in `.agentbubble/` instead of relying on chat history.

## Required Wrap-Up

- Update `architecture.md` if architectural decisions changed.
- Update `context.md` if product context, failure modes, or do-not-touch areas changed.
- Update `coding-rules.md` if a project rule was clarified.
- Record human approvals or blocked gates in `current-ticket.md`.
- Record implementation notes, test results, and final summary in `current-ticket.md`.
- List unresolved risks or follow-up tasks clearly.

## Final Response

Summarize:

- what changed
- files touched
- tests/checks run
- remaining risks or unknowns
- next human action, if any
