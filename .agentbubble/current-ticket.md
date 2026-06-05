# Current Ticket

## Ticket Source
Asana — AgentBubble board


## Ticket Title
agentbubble audit — ignore .claude/ worktrees by default


## Ticket Description
agentbubble audit flags .claude/worktrees/ files as scope drift. 
These are Claude Code internal working directories, not application 
code. Creates noise in the audit report and is not actionable.



## Declared Scope
<!-- List directories, files, or glob patterns in scope -->
- lib/audit.js

## Expected Domains
<!-- Expected directories/files likely to change -->
- lib/audit.js


## Forbidden Domains
<!-- Paths the agent must not touch -->
- bin/
- templates/
- prompts/
- skills/
- README.md
- philosophy.md
- package.json

## Risky Systems
<!-- auth / payments / migrations / config / infrastructure -->
- none


## Acceptance Criteria
<!-- Ticket success conditions -->
- .claude/ files do not appear in scope drift output
- All 28 existing tests still pass
- No other files changed

## Notes / Comments


## Links


## Human Clarifications


## Agent Intake Summary


## Approved Plan


## Implementation Notes


## Test Results


## Final Summary
