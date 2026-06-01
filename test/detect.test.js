import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { UNKNOWN } from '../lib/constants.js';
import { detectProject } from '../lib/detect.js';

test('detectProject reads deterministic package and file signals', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-detect-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'demo-app',
    description: 'Demo product goal.',
    scripts: {
      test: 'vitest run',
      build: 'next build'
    },
    dependencies: {
      next: '^15.0.0',
      '@prisma/client': '^5.0.0',
      'next-auth': '^4.0.0'
    }
  }, null, 2));
  fs.writeFileSync(path.join(root, 'pnpm-lock.yaml'), '');
  fs.writeFileSync(path.join(root, 'tsconfig.json'), '{}');
  fs.mkdirSync(path.join(root, 'app'));
  fs.mkdirSync(path.join(root, 'prisma'));
  fs.mkdirSync(path.join(root, '.github', 'workflows'), { recursive: true });
  fs.writeFileSync(path.join(root, 'CLAUDE.md'), '');

  const detection = detectProject(root);

  assert.equal(detection.projectName, 'demo-app');
  assert.equal(detection.productGoal, 'Demo product goal.');
  assert.equal(detection.packageManager, 'pnpm');
  assert.equal(detection.framework, 'Next.js');
  assert.equal(detection.testCommand, 'pnpm test');
  assert.equal(detection.buildCommand, 'pnpm build');
  assert.equal(detection.appStructure, 'app/');
  assert.equal(detection.databaseTooling, 'Prisma');
  assert.equal(detection.authTooling, 'NextAuth/Auth.js');
  assert.equal(detection.ciTooling, 'GitHub Actions (.github/workflows/)');
  assert.deepEqual(detection.agentConfigs, ['Claude (CLAUDE.md)']);
});

test('detectProject leaves unknown fields unknown when signals are absent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-detect-empty-'));
  const detection = detectProject(root);

  assert.equal(detection.framework, UNKNOWN);
  assert.equal(detection.packageManager, UNKNOWN);
  assert.equal(detection.testCommand, UNKNOWN);
  assert.equal(detection.buildCommand, UNKNOWN);
  assert.equal(detection.databaseTooling, UNKNOWN);
});

test('detectProject reports package scripts without guessing a package manager', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-detect-script-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    scripts: {
      test: 'vitest run'
    }
  }, null, 2));

  const detection = detectProject(root);

  assert.equal(detection.packageManager, UNKNOWN);
  assert.equal(detection.testCommand, 'package.json script "test": vitest run');
});
