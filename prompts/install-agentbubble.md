# Install AgentBubble

Install AgentBubble in this project by creating a local `.agentbubble/` folder.

Use `templates/base/.agentbubble/` as the source if it is available locally. If it is not available, ask the user for the AgentBubble repo path or URL.

Copy only the `.agentbubble/` folder into the target project.

Do not modify application code.

After copying:

- inspect the target project lightly
- customize `.agentbubble/context.md` based on actual project files
- customize `.agentbubble/architecture.md` based on actual project files
- do not invent secrets
- do not infer risky deployment, payment, auth, or permission details
- preserve unknowns where the codebase does not provide enough evidence

For any section you cannot determine from the codebase, write:
[UNKNOWN — ask project owner]

Do not guess.
Do not infer.
Mark it and move on.

Finish by telling the user:

- `.agentbubble/` has been installed
- which files were customized
- which sections remain unknown
- to start the first ticket session by using `prompts/start-session.md` or by asking the agent to read `.agentbubble/session-start.md`
