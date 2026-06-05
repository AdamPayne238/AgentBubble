# Human Gates

Pause and ask for approval before:

- database migrations
- auth/RLS/permissions changes
- payment/billing changes
- destructive operations
- broad refactors
- dependency changes
- environment variable changes
- production/deployment changes
- unclear requirements
- repeated failure/stuck condition
- security-sensitive code

## Stuck Condition Protocol

After 3 failed attempts at the same issue, stop, summarize what failed, identify likely causes, and ask for direction.
