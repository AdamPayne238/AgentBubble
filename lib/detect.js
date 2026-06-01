import fs from 'node:fs';
import path from 'node:path';

import { UNKNOWN } from './constants.js';

const LOCKFILES = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['package-lock.json', 'npm'],
  ['npm-shrinkwrap.json', 'npm'],
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun']
];

const FRAMEWORK_SIGNALS = [
  ['next', 'Next.js'],
  ['@vitejs/plugin-react', 'Vite'],
  ['@vitejs/plugin-vue', 'Vite'],
  ['vite', 'Vite'],
  ['react-scripts', 'Create React App'],
  ['nuxt', 'Nuxt'],
  ['@sveltejs/kit', 'SvelteKit'],
  ['astro', 'Astro'],
  ['remix', 'Remix'],
  ['@remix-run/node', 'Remix'],
  ['express', 'Express'],
  ['fastify', 'Fastify']
];

const DATABASE_SIGNALS = [
  ['prisma', 'Prisma'],
  ['@prisma/client', 'Prisma'],
  ['@supabase/supabase-js', 'Supabase'],
  ['supabase', 'Supabase'],
  ['firebase', 'Firebase'],
  ['mongoose', 'Mongoose'],
  ['drizzle-orm', 'Drizzle ORM'],
  ['typeorm', 'TypeORM'],
  ['sequelize', 'Sequelize']
];

const AUTH_SIGNALS = [
  ['next-auth', 'NextAuth/Auth.js'],
  ['@auth/core', 'Auth.js'],
  ['@clerk/nextjs', 'Clerk'],
  ['@clerk/clerk-js', 'Clerk'],
  ['firebase', 'Firebase Auth'],
  ['@supabase/supabase-js', 'Supabase Auth']
];

export function detectProject(projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = readPackageJson(packageJsonPath);
  const dependencies = collectDependencies(packageJson);
  const scripts = packageJson?.scripts || {};

  const files = {
    packageJson: fs.existsSync(packageJsonPath),
    tsconfig: exists(projectRoot, 'tsconfig.json'),
    nextConfig: findFirst(projectRoot, ['next.config.js', 'next.config.mjs', 'next.config.cjs', 'next.config.ts']),
    viteConfig: findFirst(projectRoot, ['vite.config.js', 'vite.config.mjs', 'vite.config.cjs', 'vite.config.ts']),
    src: exists(projectRoot, 'src'),
    app: exists(projectRoot, 'app'),
    pages: exists(projectRoot, 'pages'),
    prisma: exists(projectRoot, 'prisma'),
    supabase: exists(projectRoot, 'supabase'),
    workflows: exists(projectRoot, path.join('.github', 'workflows')),
    readme: findFirst(projectRoot, ['README.md', 'readme.md']),
    envExample: exists(projectRoot, '.env.example')
  };

  const packageManager = detectPackageManager(projectRoot);

  return {
    projectName: packageJson?.name || UNKNOWN,
    productGoal: detectProductGoal(packageJson, files.readme ? path.join(projectRoot, files.readme) : undefined),
    packageManager,
    framework: detectFramework(dependencies, files),
    testCommand: scripts.test ? packageScriptCommand(packageManager, 'test', scripts.test) : UNKNOWN,
    buildCommand: scripts.build ? packageScriptCommand(packageManager, 'build', scripts.build) : UNKNOWN,
    appStructure: detectAppStructure(files),
    databaseTooling: detectNamedSignals(dependencies, DATABASE_SIGNALS, [
      files.prisma ? 'Prisma' : undefined,
      files.supabase ? 'Supabase' : undefined
    ]),
    authTooling: detectNamedSignals(dependencies, AUTH_SIGNALS, []),
    ciTooling: files.workflows ? 'GitHub Actions (.github/workflows/)' : UNKNOWN,
    agentConfigs: detectAgentConfigs(projectRoot),
    keyDirectories: detectKeyDirectories(files),
    packageScripts: Object.keys(scripts).sort(),
    files
  };
}

function exists(projectRoot, relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function findFirst(projectRoot, candidates) {
  return candidates.find((candidate) => exists(projectRoot, candidate));
}

function readPackageJson(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return undefined;
  }
}

function collectDependencies(packageJson) {
  if (!packageJson) return new Set();
  return new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.optionalDependencies || {})
  ]);
}

function detectPackageManager(projectRoot) {
  const matches = LOCKFILES.filter(([file]) => exists(projectRoot, file)).map(([, manager]) => manager);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) return matches.join(', ');
  return UNKNOWN;
}

function packageScriptCommand(packageManager, scriptName, scriptValue) {
  if (packageManager === 'pnpm') return `pnpm ${scriptName}`;
  if (packageManager === 'yarn') return `yarn ${scriptName}`;
  if (packageManager === 'bun') return `bun run ${scriptName}`;
  if (packageManager === 'npm') return `npm run ${scriptName}`;
  return `package.json script "${scriptName}": ${scriptValue}`;
}

function detectFramework(dependencies, files) {
  const matches = [];
  if (files.nextConfig) matches.push('Next.js');
  if (files.viteConfig) matches.push('Vite');
  for (const [dependency, label] of FRAMEWORK_SIGNALS) {
    if (dependencies.has(dependency)) matches.push(label);
  }
  return uniqueOrUnknown(matches);
}

function detectNamedSignals(dependencies, dependencySignals, fileSignals) {
  const matches = fileSignals.filter(Boolean);
  for (const [dependency, label] of dependencySignals) {
    if (dependencies.has(dependency)) matches.push(label);
  }
  return uniqueOrUnknown(matches);
}

function detectAppStructure(files) {
  const parts = [];
  if (files.src) parts.push('src/');
  if (files.app) parts.push('app/');
  if (files.pages) parts.push('pages/');
  if (parts.length === 0) return UNKNOWN;
  return parts.join(', ');
}

function detectKeyDirectories(files) {
  const directories = [];
  for (const [key, label] of [
    ['src', 'src/'],
    ['app', 'app/'],
    ['pages', 'pages/'],
    ['prisma', 'prisma/'],
    ['supabase', 'supabase/'],
    ['workflows', '.github/workflows/']
  ]) {
    if (files[key]) directories.push(label);
  }
  return directories.length > 0 ? directories.join(', ') : UNKNOWN;
}

function detectAgentConfigs(projectRoot) {
  const configs = [
    ['CLAUDE.md', 'Claude'],
    ['.cursorrules', 'Cursor'],
    ['AGENTS.md', 'Generic agent'],
    [path.join('.cursor', 'rules'), 'Cursor rules']
  ];

  const found = configs
    .filter(([relativePath]) => exists(projectRoot, relativePath))
    .map(([relativePath, label]) => `${label} (${relativePath.replaceAll('\\', '/')})`);

  return found.length > 0 ? found : [];
}

function detectProductGoal(packageJson, readmePath) {
  if (packageJson?.description) return packageJson.description;

  if (!readmePath || !fs.existsSync(readmePath)) return UNKNOWN;

  const lines = fs.readFileSync(readmePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const firstParagraph = lines.find((line) => !line.startsWith('#') && !line.startsWith('!['));
  return firstParagraph || UNKNOWN;
}

function uniqueOrUnknown(values) {
  const unique = [...new Set(values.filter(Boolean))].sort();
  return unique.length > 0 ? unique.join(', ') : UNKNOWN;
}
