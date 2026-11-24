#!/usr/bin/env node
// fizzy-ui CLI: copies component source from a registry into your Angular project (shadcn-style).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    registry: { type: 'string' },
    path: { type: 'string', default: 'src/app/ui' },
    overwrite: { type: 'boolean', default: false },
    'skip-install': { type: 'boolean', default: false },
  },
});
const [command, ...names] = positionals;

// Bundled registry when published, the repo's ./registry in development, or --registry <dir|url>.
const base = opts.registry ?? [join(here, 'registry'), join(here, '../registry')].find(existsSync);
const isUrl = /^https?:\/\//.test(base);

async function read(file) {
  if (!isUrl) return readFileSync(join(base, file), 'utf8');
  const res = await fetch(new URL(file, base.endsWith('/') ? base : base + '/'));
  if (!res.ok) throw new Error(`GET ${res.url} -> ${res.status}`);
  return res.text();
}

// The project's Angular major (from @angular/core), or undefined.
function angularMajor() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  return (pkg.dependencies?.['@angular/core'] ?? pkg.devDependencies?.['@angular/core'])?.match(/\d+/)?.[0];
}

function install(deps, dev = false) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const missing = deps.filter((d) => !pkg.dependencies?.[d] && !pkg.devDependencies?.[d]);
  if (!missing.length) return;
  // @angular/aria and @angular/cdk must match the project's Angular, not be the latest
  const major = angularMajor();
  const specs = missing.map((d) => (major && d.startsWith('@angular/') ? `${d}@${major}` : d));
  const pm = existsSync('pnpm-lock.yaml') ? 'pnpm' : existsSync('yarn.lock') ? 'yarn' : 'npm';
  const cmd = `${pm} ${pm === 'npm' ? 'install' : 'add'} ${dev ? '-D ' : ''}${specs.join(' ')}`;
  console.log(`> ${cmd}${opts['skip-install'] ? ' (skipped)' : ''}`);
  if (!opts['skip-install']) execSync(cmd, { stdio: 'inherit' });
}

// fizzy-ui's major is the Angular major its components are written for.
function checkAngular() {
  const ours = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8')).version.split('.')[0];
  const theirs = angularMajor();
  if (theirs && theirs !== ours)
    console.warn(`warning: this project uses Angular ${theirs}; fizzy-ui ${ours} is for Angular ${ours} (try npx fizzy-ui@${theirs})`);
}

function write(target, content) {
  if (existsSync(target) && !opts.overwrite) return console.log(`skip ${target} (exists, use --overwrite)`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`write ${target}`);
}

async function init() {
  const registry = JSON.parse(await read('registry.json'));
  write('src/fizzy.css', await read(registry.theme));
  const styles = 'src/styles.css';
  const css = existsSync(styles) ? readFileSync(styles, 'utf8') : '';
  const imports = ['@import "tailwindcss";', '@import "./fizzy.css";'].filter((l) => !css.includes(l));
  if (imports.length) writeFileSync(styles, imports.join('\n') + '\n' + css);
  if (!existsSync('.postcssrc.json')) write('.postcssrc.json', '{ "plugins": { "@tailwindcss/postcss": {} } }\n');
  install(['tailwindcss', '@tailwindcss/postcss', 'postcss'], true);
}

async function add() {
  checkAngular();
  const registry = JSON.parse(await read('registry.json'));
  if (!names.length) throw new Error(`usage: fizzy-ui add <${Object.keys(registry.items).join('|')}>...`);
  const deps = new Set();
  for (const name of names) {
    const item = Object.hasOwn(registry.items, name) ? registry.items[name] : null;
    if (!item) throw new Error(`unknown component "${name}". Available: ${Object.keys(registry.items).join(', ')}`);
    // basename(): a registry can never write outside --path
    for (const file of item.files) write(join(opts.path, basename(file)), await read(file));
    item.dependencies.forEach((d) => deps.add(d));
  }
  install([...deps]);
}

const commands = { init, add, list: async () => console.log(Object.keys(JSON.parse(await read('registry.json')).items).join('\n')) };
if (!commands[command]) {
  console.log('usage: fizzy-ui <init|add|list> [names...] [--path src/app/ui] [--registry dir|url] [--overwrite]');
  process.exit(command ? 1 : 0);
}
if (!existsSync(resolve('package.json'))) throw new Error('run fizzy-ui from your Angular project root');
commands[command]().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
