# Contributing to AgentBubble

Thanks for helping make AgentBubble clearer, safer, and easier to use.

AgentBubble is a local operating layer for coding agents. Keep contributions aligned with the real CLI surface:

```text
agentbubble init
agentbubble audit
```

Do not document or implement commands that do not exist.

## Development Setup

Clone the repository, then work from the project root.

AgentBubble uses Node.js and ships as an npm CLI package. Install dependencies if the project adds them in the future; the current test suite runs with Node's built-in test runner.

Try the CLI locally:

```sh
node bin/agentbubble.js init --yes --adapter none
```

To test `audit`, run it inside a git repository that has a baseline commit and `.agentbubble/current-ticket.md`:

```sh
node bin/agentbubble.js audit
```

## Running Tests

Run the full test suite:

```sh
npm test
```

Validate the package contents before publishing-related changes:

```sh
npm pack --dry-run
```

## Project Structure

- `bin/agentbubble.js`: CLI entrypoint
- `lib/`: implementation for init, detection, tickets, path matching, and audit
- `templates/base/.agentbubble/`: files copied into target projects
- `prompts/`: copy-paste prompts for setup and sessions
- `skills/`: adapter guidance for specific coding agents
- `assets/`: launch and package media
- `test/`: Node test coverage
- `README.md`: public product and CLI documentation
- `install.md`: detailed installation flow

## Pull Request Guidelines

- Keep changes focused and reviewable.
- Preserve existing architecture and coding style.
- Add or update tests when behavior changes.
- Keep README examples aligned with real commands.
- Avoid new product concepts unless the implementation exists.
- Run `npm test` before opening a pull request.
- Run `npm pack --dry-run` when package contents or npm metadata change.

## Good First Contributions

Good first contribution ideas include:

- Improve language/runtime detection
- Improve audit report clarity
- Add fixture coverage for adapter generation
- Improve README examples
- Improve terminal output formatting

These are contribution ideas, not a claim that matching GitHub issues already exist.

## Scope Discipline

AgentBubble is built around a simple principle:

The agent may implement, but it may not silently redefine the problem.

Before opening a change, ask:

- Does this preserve the existing architecture?
- Does this keep behavior local and deterministic?
- Does this avoid documenting commands that do not exist?
- Does this keep examples aligned with current implementation?
- Does this include focused test coverage when behavior changes?

Avoid opportunistic refactors. Small, scoped changes are preferred.
