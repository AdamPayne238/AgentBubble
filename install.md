# Install AgentBubble

AgentBubble installs a local `.agentbubble/` operating layer into a project.

It does not install a CLI, package, dependency, automation script, editor extension, or agent runtime.

Execution loop:

Context → Ticket Understanding → Plan → Minimal Implementation → Test → Audit → Fix → QA-Ready

## What Gets Installed

Install only the `.agentbubble/` folder from `templates/base/.agentbubble/` into the target project root.

The installed files provide:

- project context
- architecture map
- coding rules
- human approval gates
- workflow
- definition of done
- current ticket workspace
- session bootstrap instructions

## Recommended Installation Method

From the target project, use `prompts/install-agentbubble.md` with your coding agent.

The agent should copy the base `.agentbubble/` template into the target project, inspect the project lightly, and customize `context.md` and `architecture.md`.

## Manual Copy Method

Copy:

`templates/base/.agentbubble/`

to:

`.agentbubble/`

in the target project root.

Then edit:

- `.agentbubble/context.md`
- `.agentbubble/architecture.md`

Mark unknown sections explicitly instead of guessing.

## Agent-Native Install Method

Use the generic install prompt from `prompts/install-agentbubble.md`.

If the base template is not available locally, provide the AgentBubble repo path or URL. The agent should copy only the `.agentbubble/` folder into the target project.

## Start a Session

After installation, use the tiny bootstrap prompt in `prompts/start-session.md`.

The agent should read `.agentbubble/session-start.md`, use the local `.agentbubble/` files as operating context, and begin with Ticket Intake.

## Use a Ticket

Use `prompts/pull-ticket.md` when working from an Asana, Jira, GitHub, or manually written ticket.

Paste ticket details into `.agentbubble/current-ticket.md` or directly into chat, then have the agent run Ticket Intake before coding.

## Tool-Specific Adapters

Use `skills/` only as adapter guidance for specific tools.

The `.agentbubble/` folder remains the source of truth.

Adapters should point the tool to `.agentbubble/session-start.md` and relevant local files. They should not duplicate the full framework.

## What Not To Do

- do not clone AgentBubble into every project root as a permanent dependency
- do not make agents reread the public repo every session
- do not paste the full framework every session
- do not add package tooling
- do not add dependencies
- do not add a CLI
- do not make `.agentbubble/` depend on a vendor, model, editor, CLI, or agent runtime

Install local `.agentbubble/` once, customize it per project, then use tiny bootstrap prompts after install.
