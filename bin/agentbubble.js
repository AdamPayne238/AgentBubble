#!/usr/bin/env node

import { initAgentBubble } from '../lib/init.js';
import { runAudit } from '../lib/audit.js';

const MASCOT = `
                                                   -..:.
                                                  -::::::
                                              :::  -::..
                                         -.--..--:=
                                     .-..  . ....::..=-
                                  --...........:.:::::::-
                                 -:::..............:::::::=
                                -::::.................:::::-
                               -.:::...................:::::-
                              =-::.:....%%........%%....::::-
                              -.::::...%%%%......%%%%....::.:-
                              -.-::......... %##........:::-:=
                               -.::.....................::---
                               -..:::::::.............:::.-:-
                                :...::::::::::::::::::----:-
                                 =:...::::::::--:::::::::-
                                   -:..:------::.......:=
                                      -:--:-::::..--:-
`;

const ANSI = {
  reset: '\x1b[0m',
  cyan: '\x1b[38;5;80m',
  softCyan: '\x1b[38;5;45m',
  purple: '\x1b[38;5;141m',
  lavender: '\x1b[38;5;183m'
};

function supportsAnsiColor(stream = process.stdout, env = process.env) {
  if (env.FORCE_COLOR === '0') return false;
  if (env.NODE_DISABLE_COLORS === '1') return false;
  if (Object.prototype.hasOwnProperty.call(env, 'NO_COLOR')) return false;
  if (env.FORCE_COLOR) return true;
  if (!stream.isTTY) return false;
  if (env.TERM === 'dumb') return false;
  return true;
}

function colorMascot(mascot, colorEnabled = supportsAnsiColor()) {
  if (!colorEnabled) return mascot;

  return mascot
    .split('\n')
    .map((line, index) => {
      if (!line) return line;

      const baseColor = index < 7 ? ANSI.softCyan : index > 14 ? ANSI.cyan : ANSI.purple;
      const highlighted = line
        .replaceAll('%%', `${ANSI.lavender}%%${baseColor}`)
        .replace('%##', `${ANSI.lavender}%##${baseColor}`);

      return `${baseColor}${highlighted}${ANSI.reset}`;
    })
    .join('\n');
}

function printHelp() {
  console.log(`AgentBubble

Usage:
  agentbubble init [--force] [--yes] [--adapter <claude|cursor|codex|generic|none>]
  agentbubble audit

Commands:
  init    Create .agentbubble/ in the current project
  audit   Inspect changed files for deterministic scope drift risks

Options:
  --force       Replace an existing .agentbubble/ folder
  --yes         Skip interactive questions
  --adapter     Write a lightweight adapter pointer
  --help        Show help
`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {
    command,
    force: false,
    yes: false,
    adapter: undefined
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--yes' || arg === '--non-interactive') {
      options.yes = true;
    } else if (arg === '--adapter') {
      options.adapter = rest[index + 1];
      index += 1;
    } else if (arg.startsWith('--adapter=')) {
      options.adapter = arg.slice('--adapter='.length);
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      options.unknown = arg;
    }
  }

  return options;
}

const argv = process.argv.slice(2);
const options = parseArgs(argv);

if (!options.command || options.help || options.command === '--help' || options.command === '-h') {
  printHelp();
  process.exit(0);
}

if (!['init', 'audit'].includes(options.command)) {
  console.error(`Unknown command: ${options.command}`);
  printHelp();
  process.exit(1);
}

if (options.command === 'audit' && argv.length > 1) {
  console.error(`Unknown option ${argv[1]}. agentbubble audit takes no options.`);
  process.exit(1);
}

if (options.unknown) {
  console.error(`Unknown option: ${options.unknown}`);
  process.exit(1);
}

try {
  if (options.command === 'init') {
    const result = await initAgentBubble({
      projectRoot: process.cwd(),
      force: options.force,
      nonInteractive: options.yes || !process.stdin.isTTY || !process.stdout.isTTY,
      adapter: options.adapter
    });

    console.log(colorMascot(MASCOT));
    console.log(result.summary);
  } else {
    const result = runAudit({
      projectRoot: process.cwd()
    });

    console.log(colorMascot(MASCOT));
    console.log(result.report);
  }
} catch (error) {
  console.error(error.message);
  process.exit(error.exitCode || 1);
}
