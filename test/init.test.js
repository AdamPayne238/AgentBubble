import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { REQUIRED_AGENTBUBBLE_FILES, UNKNOWN } from '../lib/constants.js';
import { initAgentBubble } from '../lib/init.js';

test('init copies the base template and writes deterministic context', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-init-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'sample',
    description: 'Sample app.',
    scripts: {
      test: 'node --test',
      build: 'vite build'
    },
    devDependencies: {
      vite: '^6.0.0'
    }
  }, null, 2));
  fs.writeFileSync(path.join(root, 'package-lock.json'), '{}');
  fs.writeFileSync(path.join(root, 'vite.config.js'), 'export default {};');
  fs.mkdirSync(path.join(root, 'src'));

  const result = await initAgentBubble({ projectRoot: root, nonInteractive: true });

  for (const file of REQUIRED_AGENTBUBBLE_FILES) {
    assert.equal(fs.existsSync(path.join(root, '.agentbubble', file)), true, file);
  }

  const context = fs.readFileSync(path.join(root, '.agentbubble', 'context.md'), 'utf8');
  const architecture = fs.readFileSync(path.join(root, '.agentbubble', 'architecture.md'), 'utf8');

  assert.match(context, /Sample app\./);
  assert.match(architecture, /Framework: Vite/);
  assert.match(architecture, /npm run build/);
  assert.match(result.summary, /AgentBubble initialized/);
});

test('init refuses to overwrite an existing .agentbubble folder', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-existing-'));
  fs.mkdirSync(path.join(root, '.agentbubble'));

  await assert.rejects(
    () => initAgentBubble({ projectRoot: root, nonInteractive: true }),
    /already exists/
  );
});

test('init writes short adapter pointers when configs are present', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-adapter-'));
  fs.writeFileSync(path.join(root, 'CLAUDE.md'), '# Existing\n');

  const result = await initAgentBubble({ projectRoot: root, nonInteractive: true });
  const claude = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8');

  assert.match(claude, /\.agentbubble\/session-start\.md/);
  assert.deepEqual(result.adapters, ['CLAUDE.md']);
});

test('init uses unknown marker for absent deterministic fields', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-unknown-'));

  await initAgentBubble({ projectRoot: root, nonInteractive: true });

  const architecture = fs.readFileSync(path.join(root, '.agentbubble', 'architecture.md'), 'utf8');
  assert.match(architecture, new RegExp(escapeRegExp(UNKNOWN)));
});

test('init validates adapter before creating .agentbubble', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agentbubble-bad-adapter-'));

  await assert.rejects(
    () => initAgentBubble({ projectRoot: root, nonInteractive: true, adapter: 'bad' }),
    /Unknown adapter/
  );

  assert.equal(fs.existsSync(path.join(root, '.agentbubble')), false);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
