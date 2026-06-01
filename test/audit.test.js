import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { auditChangedFiles, renderAuditReport, runAudit } from '../lib/audit.js';
import { matchesPattern, normalizeRelativePath } from '../lib/path-match.js';
import { parseCurrentTicket } from '../lib/ticket.js';

test('parseCurrentTicket reads canonical audit sections', () => {
  const parsed = parseCurrentTicket(`# Current Ticket

## Declared Scope
- src/components
- app/page.tsx

## Expected Domains
frontend/**

## Forbidden Domains
- auth

## Risky Systems
- payments

## Acceptance Criteria
- CTA tracking works
`);

  assert.deepEqual(parsed.sections['Declared Scope'], ['src/components', 'app/page.tsx']);
  assert.deepEqual(parsed.sections['Expected Domains'], ['frontend/**']);
  assert.deepEqual(parsed.sections['Forbidden Domains'], ['auth']);
  assert.deepEqual(parsed.sections['Risky Systems'], ['payments']);
  assert.deepEqual(parsed.warnings, []);
});

test('parseCurrentTicket warns but does not crash on malformed sections', () => {
  const parsed = parseCurrentTicket(`# Current Ticket

## Declared Scope
- src

## Declared Scope
- duplicate
`);

  assert.match(parsed.warnings.join('\n'), /Duplicate section: Declared Scope/);
  assert.match(parsed.warnings.join('\n'), /Missing section: Expected Domains/);
  assert.deepEqual(parsed.sections['Declared Scope'], ['src']);
});

test('normalizeRelativePath normalizes Windows and Unix relative paths', () => {
  assert.equal(normalizeRelativePath('.\\frontend\\auth\\middleware.ts'), 'frontend/auth/middleware.ts');
  assert.equal(normalizeRelativePath('./src//app/page.tsx'), 'src/app/page.tsx');
});

test('matchesPattern supports exact, recursive directory, segment directory, and simple glob matches', () => {
  assert.equal(matchesPattern('src/app/page.tsx', 'src/app/page.tsx'), true);
  assert.equal(matchesPattern('src/components/button.tsx', 'src'), true);
  assert.equal(matchesPattern('frontend/analytics/client.ts', 'analytics'), true);
  assert.equal(matchesPattern('frontend/app/page.tsx', 'frontend/**/*.tsx'), true);
  assert.equal(matchesPattern('frontend/app/page.tsx', 'backend/**/*.tsx'), false);
});

test('matchesPattern treats **/ as zero or more directories', () => {
  assert.equal(matchesPattern('middleware.ts', '**/middleware.*'), true);
  assert.equal(matchesPattern('vite.config.ts', '**/*.config.*'), true);
  assert.equal(matchesPattern('next.config.js', '**/next.config.*'), true);
});

test('auditChangedFiles detects out-of-scope changes', () => {
  const result = auditChangedFiles(['src/button.tsx', 'tsconfig.json'], {
    'Declared Scope': ['src'],
    'Expected Domains': [],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });

  const configFinding = result.findings.find((finding) => finding.file === 'tsconfig.json');
  assert.equal(configFinding.severity, 'WARNING');
  assert.equal(configFinding.reasons.includes('out-of-scope change'), true);
});

test('auditChangedFiles detects forbidden domains', () => {
  const result = auditChangedFiles(['frontend/auth/middleware.ts'], {
    'Declared Scope': ['frontend'],
    'Expected Domains': [],
    'Forbidden Domains': ['frontend/auth'],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });

  assert.equal(result.findings[0].severity, 'HIGH RISK');
  assert.equal(result.findings[0].reasons.includes('forbidden domain touched'), true);
});

test('auditChangedFiles detects default risky paths', () => {
  const result = auditChangedFiles(['app/api/payments/route.ts', '.github/workflows/ci.yml'], {
    'Declared Scope': ['app'],
    'Expected Domains': [],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });

  const payments = result.findings.find((finding) => finding.file === 'app/api/payments/route.ts');
  const ci = result.findings.find((finding) => finding.file === '.github/workflows/ci.yml');
  assert.equal(payments.severity, 'HIGH RISK');
  assert.equal(ci.severity, 'WARNING');
});

test('auditChangedFiles separates scope drift, risky changes, and clean changes', () => {
  const result = auditChangedFiles(['src/button.tsx', 'src/auth/middleware.ts', 'docs/readme.md'], {
    'Declared Scope': ['src'],
    'Expected Domains': ['src/auth'],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });

  assert.deepEqual(result.cleanChanges, ['src/button.tsx']);
  assert.deepEqual(result.scopeDrift.map((finding) => finding.file), ['docs/readme.md']);
  assert.deepEqual(result.riskyChanges.map((finding) => finding.file), ['src/auth/middleware.ts']);
});

test('renderAuditReport does not label in-scope risky changes as scope drift', () => {
  const audit = auditChangedFiles(['src/auth/middleware.ts'], {
    'Declared Scope': ['src'],
    'Expected Domains': ['src/auth'],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });
  const report = renderAuditReport({
    changedFiles: ['src/auth/middleware.ts'],
    parsedTicket: {
      sections: {
        'Declared Scope': ['src'],
        'Expected Domains': ['src/auth']
      },
      warnings: []
    },
    ...audit
  });

  assert.doesNotMatch(report, /Scope Drift:/);
  assert.match(report, /Risky Changes:/);
  assert.doesNotMatch(report, /\u00e2/);
});

test('renderAuditReport deduplicates displayed scope entries', () => {
  const audit = auditChangedFiles(['src/button.tsx'], {
    'Declared Scope': ['src'],
    'Expected Domains': ['src'],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });
  const report = renderAuditReport({
    changedFiles: ['src/button.tsx'],
    parsedTicket: {
      sections: {
        'Declared Scope': ['src'],
        'Expected Domains': ['src']
      },
      warnings: []
    },
    ...audit
  });

  assert.equal(report.match(/^- src$/gm).length, 1);
});


test('auditChangedFiles detects large scope expansion heuristically', () => {
  const files = Array.from({ length: 12 }, (_, index) => `src/file-${index}.ts`);
  const result = auditChangedFiles(files, {
    'Declared Scope': ['src/file-1.ts', 'src/file-2.ts'],
    'Expected Domains': [],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });

  assert.equal(result.largeExpansion, true);
});

test('renderAuditReport uses ASCII large expansion warning', () => {
  const files = Array.from({ length: 12 }, (_, index) => `src/file-${index}.ts`);
  const audit = auditChangedFiles(files, {
    'Declared Scope': ['src/file-1.ts', 'src/file-2.ts'],
    'Expected Domains': ['src/file-3.ts'],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });
  const report = renderAuditReport({
    changedFiles: files,
    parsedTicket: {
      sections: {
        'Declared Scope': ['src/file-1.ts', 'src/file-2.ts'],
        'Expected Domains': ['src/file-3.ts']
      },
      warnings: []
    },
    ...audit
  });

  assert.match(report, /WARNING    Large scope expansion detected/);
  assert.doesNotMatch(report, /\u00e2/);
});

test('renderAuditReport warns when scope contract is incomplete', () => {
  const audit = auditChangedFiles(['src/button.tsx'], {
    'Declared Scope': ['src'],
    'Expected Domains': [],
    'Forbidden Domains': [],
    'Risky Systems': [],
    'Acceptance Criteria': []
  });
  const report = renderAuditReport({
    changedFiles: ['src/button.tsx'],
    parsedTicket: {
      sections: {
        'Declared Scope': ['src'],
        'Expected Domains': []
      },
      warnings: []
    },
    ...audit
  });

  assert.match(report, /Scope contract incomplete/);
  assert.doesNotMatch(report, /No scope drift detected/);
});

test('runAudit reports missing git repository cleanly', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-no-git-'));

  assert.throws(
    () => runAudit({ projectRoot: root }),
    /Not inside a git repository/
  );
});

test('runAudit reports missing current-ticket.md cleanly', () => {
  const root = createGitRepo();

  assert.throws(
    () => runAudit({ projectRoot: root }),
    /Missing \.agentbubble\/current-ticket\.md/
  );
});

test('runAudit reports unborn HEAD cleanly', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-unborn-head-'));
  git(root, ['init']);
  writeTicket(root);

  assert.throws(
    () => runAudit({ projectRoot: root }),
    /No commits found\. Commit a baseline before running agentbubble audit\./
  );
});

test('runAudit reports no changes successfully', () => {
  const root = createGitRepo();
  writeTicket(root);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'initial']);

  const result = runAudit({ projectRoot: root });

  assert.equal(result.report, 'No modified files detected.');
});

test('agentbubble audit rejects unsupported options', () => {
  let error;
  try {
    execFileSync('node', [path.resolve('bin', 'agentbubble.js'), 'audit', '--force'], {
      cwd: path.resolve('.'),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
  } catch (caught) {
    error = caught;
  }

  assert.equal(error.status, 1);
  assert.match(error.stderr, /Unknown option --force\. agentbubble audit takes no options\./);
});

test('runAudit includes untracked files in changed file audit', () => {
  const root = createGitRepo();
  writeTicket(root);
  git(root, ['add', '.']);
  git(root, ['commit', '-m', 'ticket']);
  fs.mkdirSync(path.join(root, 'frontend', 'auth'), { recursive: true });
  fs.writeFileSync(path.join(root, 'frontend', 'auth', 'middleware.ts'), 'export const auth = true;\n');

  const result = runAudit({ projectRoot: root });

  assert.deepEqual(result.changedFiles, ['frontend/auth/middleware.ts']);
  assert.equal(result.findings[0].severity, 'HIGH RISK');
});

function createGitRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-git-'));
  git(root, ['init']);
  git(root, ['config', 'user.email', 'agentbubble@example.com']);
  git(root, ['config', 'user.name', 'AgentBubble Test']);
  fs.writeFileSync(path.join(root, 'README.md'), '# Test\n');
  git(root, ['add', 'README.md']);
  git(root, ['commit', '-m', 'initial']);
  return root;
}

function writeTicket(root) {
  fs.mkdirSync(path.join(root, '.agentbubble'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agentbubble', 'current-ticket.md'), `# Current Ticket

## Declared Scope
- src

## Expected Domains

## Forbidden Domains
- auth

## Risky Systems
- payments

## Acceptance Criteria
- Done
`);
}

function git(cwd, args) {
  execFileSync('git', args, {
    cwd,
    stdio: ['ignore', 'ignore', 'pipe']
  });
}
