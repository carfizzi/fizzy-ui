#!/usr/bin/env node
// npm run release [minor|patch] [-- --dry-run]
// Bumps cli/package.json, runs the tests, commits, tags v<version> and pushes; the Release workflow publishes.
// The major always follows the docs app's @angular/core: a new Angular major gives <major>.0.0.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

export function nextVersion(current, angularMajor, kind) {
  const [major, minor, patch] = current.split('.').map(Number);
  if (angularMajor < major) throw new Error(`Angular ${angularMajor} is older than fizzy-ui ${current}`);
  if (angularMajor > major) return `${angularMajor}.0.0`;
  return kind === 'patch' ? `${major}.${minor}.${patch + 1}` : `${major}.${minor + 1}.0`;
}

if (import.meta.main) {
  const sh = (cmd, quiet = true) => execSync(cmd, { encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit' })?.trim();
  const fail = (msg) => (console.error(msg), process.exit(1));
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const kind = args.find((a) => !a.startsWith('--')) ?? 'minor';
  if (!['minor', 'patch'].includes(kind)) fail('usage: npm run release [minor|patch] [-- --dry-run]');

  const file = 'cli/package.json';
  const text = readFileSync(file, 'utf8');
  const current = JSON.parse(text).version;
  const angular = Number(JSON.parse(readFileSync('package.json', 'utf8')).dependencies['@angular/core'].match(/\d+/)[0]);
  const next = nextVersion(current, angular, kind);
  console.log(`${current} -> ${next}`);
  if (dry) process.exit(0);

  if (sh('git branch --show-current') !== 'main') fail('release from main');
  if (sh('git status --porcelain')) fail('commit or stash your changes first');
  if (sh(`git tag -l v${next}`)) fail(`tag v${next} already exists`);
  sh('npm test', false);
  sh('npm run test:cli', false);
  writeFileSync(file, text.replace(`"version": "${current}"`, `"version": "${next}"`));
  sh(`git commit -qam "Release v${next}"`);
  sh(`git tag v${next}`);
  sh(`git push origin main v${next}`, false);
  console.log(`v${next} pushed: the Release workflow publishes it to npm.`);
}
