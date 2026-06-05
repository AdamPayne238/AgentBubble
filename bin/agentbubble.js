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

    console.log(MASCOT);
    console.log(result.summary);
  } else {
    const result = runAudit({
      projectRoot: process.cwd()
    });

    console.log(MASCOT);
    console.log(result.report);
  }
} catch (error) {
  console.error(error.message);
  process.exit(error.exitCode || 1);
}
