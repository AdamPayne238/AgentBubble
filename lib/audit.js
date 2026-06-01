import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { matchesAnyPattern, normalizeRelativePath } from './path-match.js';
import { parseCurrentTicket } from './ticket.js';

const DEFAULT_RISK_RULES = [
  { label: 'auth flow mutation', severity: 'HIGH RISK', patterns: ['auth', 'middleware', '**/middleware.*', '**/auth/**'] },
  { label: 'payment system touched', severity: 'HIGH RISK', patterns: ['payments', 'payment', 'billing', 'stripe', '**/payments/**', '**/billing/**'] },
  { label: 'migration or schema touched', severity: 'HIGH RISK', patterns: ['migrations', 'migration', 'schema', 'prisma/schema.prisma', '**/migrations/**', '**/schema.*'] },
  { label: 'security middleware touched', severity: 'HIGH RISK', patterns: ['security', '**/security/**'] },
  { label: 'config drift', severity: 'WARNING', patterns: ['package.json', 'tsconfig.json', 'vite.config.*', 'next.config.*', '**/*.config.*'] },
  { label: 'infrastructure touched', severity: 'WARNING', patterns: ['infra', 'infrastructure', 'terraform', 'docker-compose.*', 'Dockerfile', '.github/workflows', '**/.github/workflows/**'] },
  { label: 'deployment config touched', severity: 'WARNING', patterns: ['vercel.json', 'netlify.toml', 'render.yaml', 'fly.toml', 'railway.json'] },
  { label: 'environment config touched', severity: 'WARNING', patterns: ['.env', '.env.*', '.env.example'] }
];

export function runAudit(options = {}) {
  const projectRoot = path.resolve(options.projectRoot || process.cwd());
  const ticketPath = path.join(projectRoot, '.agentbubble', 'current-ticket.md');

  ensureGitRepository(projectRoot);

  if (!fs.existsSync(ticketPath)) {
    const error = new Error('Missing .agentbubble/current-ticket.md. Run `agentbubble init` or restore the ticket file before auditing.');
    error.exitCode = 1;
    throw error;
  }

  let ticketContent;
  try {
    ticketContent = fs.readFileSync(ticketPath, 'utf8');
  } catch {
    const error = new Error('Unable to read .agentbubble/current-ticket.md.');
    error.exitCode = 1;
    throw error;
  }

  const parsedTicket = parseCurrentTicket(ticketContent);
  const changedFiles = getChangedFiles(projectRoot);

  if (changedFiles.length === 0) {
    return {
      changedFiles,
      parsedTicket,
      findings: [],
      scopeDrift: [],
      riskyChanges: [],
      cleanChanges: [],
      risks: [],
      largeExpansion: false,
      scopeContractIncomplete: isScopeContractIncomplete(parsedTicket.sections),
      report: 'No modified files detected.'
    };
  }

  const audit = auditChangedFiles(changedFiles, parsedTicket.sections);
  return {
    changedFiles,
    parsedTicket,
    ...audit,
    report: renderAuditReport({
      changedFiles,
      parsedTicket,
      ...audit
    })
  };
}

export function auditChangedFiles(changedFiles, sections) {
  const declaredScope = sections['Declared Scope'] || [];
  const expectedDomains = sections['Expected Domains'] || [];
  const forbiddenDomains = sections['Forbidden Domains'] || [];
  const riskySystems = sections['Risky Systems'] || [];
  const scopePatterns = [...declaredScope, ...expectedDomains];
  const findingsByFile = new Map();
  const risks = new Set();
  const cleanChanges = [];

  for (const file of changedFiles.map(normalizeRelativePath).sort()) {
    const finding = {
      file,
      severity: 'INFO',
      reasons: [],
      isScopeDrift: false,
      isRisky: false
    };

    if (forbiddenDomains.length > 0 && matchesAnyPattern(file, forbiddenDomains)) {
      finding.severity = 'HIGH RISK';
      finding.reasons.push('forbidden domain touched');
      finding.isRisky = true;
      risks.add('forbidden domain touched');
    }

    const configuredRisk = riskySystems.find((pattern) => matchesAnyPattern(file, [pattern]));
    if (configuredRisk) {
      finding.severity = maxSeverity(finding.severity, 'HIGH RISK');
      finding.reasons.push(`risky system touched: ${configuredRisk}`);
      finding.isRisky = true;
      risks.add(`risky system touched: ${configuredRisk}`);
    }

    for (const rule of DEFAULT_RISK_RULES) {
      if (matchesAnyPattern(file, rule.patterns)) {
        finding.severity = maxSeverity(finding.severity, rule.severity);
        finding.reasons.push(rule.label);
        finding.isRisky = true;
        risks.add(rule.label);
      }
    }

    if (scopePatterns.length > 0 && !matchesAnyPattern(file, scopePatterns)) {
      finding.severity = maxSeverity(finding.severity, 'WARNING');
      finding.reasons.push('out-of-scope change');
      finding.isScopeDrift = true;
    }

    if (finding.severity !== 'INFO') {
      findingsByFile.set(file, finding);
    } else {
      cleanChanges.push(file);
    }
  }

  const findings = [...findingsByFile.values()];

  return {
    findings,
    scopeDrift: findings.filter((finding) => finding.isScopeDrift),
    riskyChanges: findings.filter((finding) => finding.isRisky),
    cleanChanges,
    risks: [...risks].sort(),
    largeExpansion: hasLargeScopeExpansion(changedFiles.length, scopePatterns.length),
    scopeContractIncomplete: isScopeContractIncomplete(sections)
  };
}

export function getChangedFiles(projectRoot) {
  ensureBaselineCommit(projectRoot);
  const unstaged = gitLines(projectRoot, ['diff', '--name-only', 'HEAD']);
  const staged = gitLines(projectRoot, ['diff', '--name-only', '--staged']);
  const untracked = gitLines(projectRoot, ['ls-files', '--others', '--exclude-standard']);
  return [...new Set([...unstaged, ...staged, ...untracked].map(normalizeRelativePath).filter(Boolean))].sort();
}

export function renderAuditReport({ changedFiles, parsedTicket, findings, scopeDrift, riskyChanges, cleanChanges, risks, largeExpansion, scopeContractIncomplete }) {
  const sections = parsedTicket.sections;
  const declared = [...new Set([...sections['Declared Scope'], ...sections['Expected Domains']])];
  const output = ['Ticket Scope Audit', ''];

  if (parsedTicket.warnings.length > 0) {
    output.push('Warnings:');
    for (const warning of parsedTicket.warnings) {
      output.push(`- ${warning}`);
    }
    output.push('');
  }

  output.push('Declared scope:');
  if (declared.length > 0) {
    for (const item of declared) output.push(`- ${item}`);
  } else {
    output.push('- [none declared]');
  }

  output.push('');
  output.push('Changed files:');
  output.push(String(changedFiles.length));

  if (scopeDrift.length > 0) {
    output.push('');
    output.push('Scope Drift:');
    for (const finding of scopeDrift) {
      output.push(`  ${finding.severity.padEnd(10)} ${finding.file}`);
    }
  }

  if (riskyChanges.length > 0) {
    output.push('');
    output.push('Risky Changes:');
    for (const finding of riskyChanges) {
      output.push(`  ${finding.severity.padEnd(10)} ${finding.file}`);
    }
  }

  if (cleanChanges.length > 0) {
    output.push('');
    output.push(`Clean Changes: ${cleanChanges.length}`);
  }

  if (risks.length > 0) {
    output.push('');
    output.push('Potential risks:');
    for (const risk of risks) output.push(`- ${risk}`);
  }

  if (largeExpansion) {
    output.push('');
    output.push('WARNING    Large scope expansion detected');
  }

  output.push('');
  if (scopeContractIncomplete) {
    output.push('Scope contract incomplete — add Declared Scope and Expected Domains to .agentbubble/current-ticket.md before relying on this report.');
  } else {
    output.push(findings.length > 0 || largeExpansion ? 'Review recommended before merge.' : 'No scope drift detected.');
  }

  return output.join('\n');
}

function ensureGitRepository(projectRoot) {
  try {
    const result = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();

    if (result !== 'true') throw new Error('not a git repository');
  } catch {
    const error = new Error('Not inside a git repository. `agentbubble audit` requires git changes to inspect.');
    error.exitCode = 1;
    throw error;
  }
}

function ensureBaselineCommit(projectRoot) {
  try {
    execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch {
    const error = new Error('No commits found. Commit a baseline before running agentbubble audit.');
    error.exitCode = 1;
    throw error;
  }
}

function gitLines(projectRoot, args) {
  try {
    return execFileSync('git', args, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    })
      .split(/\r?\n/)
      .map(normalizeRelativePath)
      .filter(Boolean);
  } catch {
    const error = new Error(`Unable to read git changes with: git ${args.join(' ')}`);
    error.exitCode = 1;
    throw error;
  }
}

function isScopeContractIncomplete(sections) {
  return (sections['Declared Scope'] || []).length === 0 || (sections['Expected Domains'] || []).length === 0;
}

function hasLargeScopeExpansion(changedCount, declaredCount) {
  if (declaredCount === 0) return changedCount >= 10;
  return changedCount >= Math.max(10, declaredCount * 4);
}

function maxSeverity(current, next) {
  const rank = {
    INFO: 0,
    WARNING: 1,
    'HIGH RISK': 2
  };
  return rank[next] > rank[current] ? next : current;
}
