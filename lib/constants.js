export const UNKNOWN = '[UNKNOWN — ask project owner]';

export const REQUIRED_AGENTBUBBLE_FILES = [
  'context.md',
  'architecture.md',
  'coding-rules.md',
  'workflow.md',
  'session-start.md',
  'session-end.md',
  'current-ticket.md',
  'definition-of-done.md',
  'human-gates.md'
];

export const ADAPTER_POINTERS = {
  claude: {
    file: 'CLAUDE.md',
    label: 'Claude',
    body: '# Claude Instructions\n\nRead `.agentbubble/session-start.md` before starting work. Use `.agentbubble/` as the local operating layer for this project.\n'
  },
  cursor: {
    file: '.cursorrules',
    label: 'Cursor',
    body: 'Read `.agentbubble/session-start.md` before starting work. Use `.agentbubble/` as the local operating layer for this project.\n'
  },
  codex: {
    file: 'AGENTS.md',
    label: 'Codex',
    body: '# Agent Instructions\n\nRead `.agentbubble/session-start.md` before starting work. Use `.agentbubble/` as the local operating layer for this project.\n'
  },
  generic: {
    file: 'AGENTS.md',
    label: 'Generic agent',
    body: '# Agent Instructions\n\nRead `.agentbubble/session-start.md` before starting work. Use `.agentbubble/` as the local operating layer for this project.\n'
  }
};
