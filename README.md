# AgentBubble

<p align="center">
  <img src="assets/logo.png" width="320" alt="AgentBubble" />
</p>

<h3 align="center">Stop coding agents from wandering outside the ticket.</h3>

<p align="center">
  AgentBubble gives Claude Code and Codex a local task contract before they start editing.<br />
  Initialize the project, define the scope, hand it to your agent, then audit the diff before review.
</p>

<p align="center">
  <a href="#install"><strong>Install</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="#what-agentbubble-does"><strong>What It Does</strong></a> ·
  <a href="#how-audit-works"><strong>How Audit Works</strong></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/agentbubble"><img src="https://img.shields.io/npm/v/agentbubble" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <img src="assets/agentbubble-claude-demo.gif" alt="AgentBubble init, then handing off to Claude Code with a single 'start' message" width="900">
</p>

## Install

Run AgentBubble from the project you want to prepare:

```sh
npx agentbubble@latest init --adapter claude
```

Using Codex instead:

```sh
npx agentbubble@latest init --adapter codex
```

Supported adapters are `claude`, `cursor`, `codex`, `generic`, and `none`.

## Quick Start

1. Initialize local project guidance for your coding agent:

```sh
npx agentbubble@latest init --adapter claude
```

2. Fill `.agentbubble/current-ticket.md` with the current task, declared scope, expected domains, forbidden domains, risky systems, and acceptance criteria.

3. Tell your coding agent: "Ticket is ready. Begin intake."

4. Audit changed files for scope drift risks before review:

```sh
npx agentbubble@latest audit
```

## What AgentBubble Does

AgentBubble creates a local `.agentbubble/` folder that gives coding agents project-specific guidance before they start editing.

It helps you:

- capture project context and architecture notes
- write the active ticket in a consistent format
- point Claude Code, Codex, Cursor, or another agent at the same local guidance
- audit changed files against the ticket before review

AgentBubble is local-only. It does not install an agent runtime, hosted service, telemetry, model integration, or background automation.

## Why AgentBubble Exists

Coding agents work better when they have clear context, explicit constraints, and a small task contract.

AgentBubble gives the agent a bounded place to start, then gives the human a quick audit of whether changed files match the declared scope.

## Claude Code / Codex / Cursor Usage

Use the adapter that matches your coding agent:

```sh
npx agentbubble@latest init --adapter claude
```

```sh
npx agentbubble@latest init --adapter codex
```

```sh
npx agentbubble@latest init --adapter cursor
```

Adapters write lightweight pointers for the selected tool. The `.agentbubble/` folder remains the source of truth.

## Commands

```text
agentbubble init [--force] [--yes] [--adapter <claude|cursor|codex|generic|none>]
agentbubble audit
```

`agentbubble init` creates `.agentbubble/` in the current project, detects deterministic local project signals, and writes lightweight adapter pointers when requested.

`agentbubble audit` inspects changed files against `.agentbubble/current-ticket.md` and reports scope drift, risky changes, and clean changes.

## How Audit Works

`agentbubble audit` requires a git repository, a baseline commit, and `.agentbubble/current-ticket.md`.

It checks changed files from:

- unstaged changes
- staged changes
- untracked files

It compares those files with the ticket sections:

- `Declared Scope`
- `Expected Domains`
- `Forbidden Domains`
- `Risky Systems`
- `Acceptance Criteria`

Example audit output:

```text
Ticket Scope Audit

Declared scope:
- frontend/app/(app)/calendar/

Changed files:
1

Clean Changes: 1

No scope drift detected.
```

## Project Files Created

AgentBubble copies the base template into `.agentbubble/`:

- `context.md`: product, architecture, rules, and known risks
- `architecture.md`: stack, directories, services, and commands
- `current-ticket.md`: the active task contract
- `session-start.md`: the bootstrap file agents read first
- `workflow.md`: the expected work loop
- `coding-rules.md`: local coding constraints
- `human-gates.md`: places where the agent should stop for approval
- `definition-of-done.md`: review and QA expectations
- `session-end.md`: end-of-session handoff guidance

See [install.md](install.md) for the full install flow.

## Philosophy

AgentBubble is a practical operating layer for human-directed agentic engineering.

Agents are powerful but stochastic. They can write useful code quickly, but they need clear boundaries, current context, and explicit acceptance criteria.

AgentBubble treats agent work as engineering work:

- preserve the existing architecture
- follow established patterns
- mutate the smallest necessary surface area
- avoid opportunistic refactors
- verify behavior before claiming completion
- audit the diff against the original ticket

The agent may implement, but it may not silently redefine the problem.

```text
Context -> Ticket Understanding -> Plan -> Minimal Implementation -> Test -> Audit -> Fix -> QA-Ready
```

## Repository Contents

- `philosophy.md`: core operating model
- `context-factory.md`: project context compression
- `ticket-intake-loop.md`: pre-implementation scope control
- `implementation-loop.md`: safe coding rules
- `audit-loop.md`: review and risk inspection
- `definition-of-done.md`: QA and production readiness
- `install.md`: installation guide
- `prompts/`: copy-paste prompts
- `templates/`: reusable specs, checklists, and base `.agentbubble/` files
- `skills/`: tool-specific adapter guidance
- `assets/`: launch and package media

## Contributing

Contributions should keep AgentBubble focused on real `init` and `audit` workflows, deterministic local behavior, and scoped launch polish. See [CONTRIBUTING.md](CONTRIBUTING.md).
