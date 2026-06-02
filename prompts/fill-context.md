# Fill AgentBubble Context

You are working in this project after `agentbubble init`.

Scan the codebase and fill in all `[UNKNOWN]` fields in:

- `.agentbubble/context.md`
- `.agentbubble/architecture.md`

Use only evidence from local project files.

Rules:

- Do not modify application code.
- Do not infer secrets, environment variable values, credentials, tokens, or private configuration.
- Do not guess business context unless it is explicitly present in README, package metadata, docs, or code comments.
- Ask the user before writing anything security, auth, permissions, payments, billing, production infrastructure, deployment, or data-access related.
- If a field is still unknown after scanning, keep it marked as `[UNKNOWN — ask project owner]`.
- Keep updates concise and specific to this project.

Suggested scan targets:

- `README.md`
- `package.json`
- lockfiles
- `tsconfig.json`
- framework config files
- `src/`, `app/`, `pages/`
- `prisma/`, `supabase/`
- `.github/workflows/`
- `.env.example`
- existing agent config files such as `CLAUDE.md`, `.cursorrules`, `AGENTS.md`

After scanning:

1. Summarize what you found.
2. List any security/auth/payments/deployment questions for the user.
3. Update only `.agentbubble/context.md` and `.agentbubble/architecture.md`.
4. Leave unresolved items as `[UNKNOWN — ask project owner]`.
