# Audit / PR Review Loop

Before calling work complete:

- inspect diff
- check for overengineering
- check for security regressions
- check for auth/RLS/data leaks
- check for duplicate logic
- check for broken UX
- check for missing tests
- check if ticket scope was exceeded

## Purpose

This is where agentic engineering beats vibe coding.

## Review Standard

The audit checks whether the implementation still matches the original ticket and whether the change is safe enough for human review.

The agent should explain what changed, why it changed, what was tested, and what risk remains.
