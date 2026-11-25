#!/usr/bin/env node
// fizzy-ui CLI: copies component source from a registry into your Angular project (shadcn-style).
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';
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

// .fizzy-ui/<target> keeps the registry version a component file was last written from: the base
// that `update` merges your edits and the registry's against. Commit it with the rest.
const baseOf = (target) => join('.fizzy-ui', target);

function put(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function write(target, content, keepBase = false) {
  if (existsSync(target) && !opts.overwrite) return console.log(`skip ${target} (exists, use --overwrite)`);
  put(target, content);
  if (keepBase) put(baseOf(target), content);
  console.log(`write ${target}`);
}

function item(registry, name) {
  const found = Object.hasOwn(registry.items, name) ? registry.items[name] : null;
  if (!found) throw new Error(`unknown component "${name}". Available: ${Object.keys(registry.items).join(', ')}`);
  return found;
}

// The named components, or every one with a file in --path: target path -> registry file, and their dependencies.
async function selection() {
  const registry = JSON.parse(await read('registry.json'));
  const chosen = names.length
    ? names
    : Object.keys(registry.items).filter((n) => registry.items[n].files.some((f) => existsSync(join(opts.path, basename(f)))));
  const files = new Map();
  const deps = new Set();
  for (const name of chosen) {
    const { files: list, dependencies } = item(registry, name);
    for (const file of list) files.set(join(opts.path, basename(file)), file);
    dependencies.forEach((d) => deps.add(d));
  }
  if (!files.size) console.log(`no fizzy-ui components in ${opts.path} (use --path)`);
  return { files, deps };
}

// Writes `content` to a temp file named like `file`, for git to read.
function temp(file, content) {
  const path = join(mkdtempSync(join(tmpdir(), 'fizzy-ui-')), basename(file));
  writeFileSync(path, content);
  return path;
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
    const found = item(registry, name);
    // basename(): a registry can never write outside --path
    for (const file of found.files) write(join(opts.path, basename(file)), await read(file), true);
    found.dependencies.forEach((d) => deps.add(d));
  }
  install([...deps]);
}

// What `update` would change: your file against the registry's (git diff).
async function diff() {
  const { files } = await selection();
  for (const [target, file] of files) {
    if (!existsSync(target)) {
      console.log(`${target}: not added`);
      continue;
    }
    const theirs = await read(file);
    if (readFileSync(target, 'utf8') === theirs) {
      console.log(`${target}: up to date`);
      continue;
    }
    const other = temp(file, theirs);
    const color = `--color=${process.stdout.isTTY ? 'always' : 'never'}`;
    const out = spawnSync('git', ['diff', '--no-index', '--no-prefix', color, '--', target, other], { encoding: 'utf8' });
    if (out.error) console.log(`${target}: differs from the registry (install git to see how)`);
    // the headers name the temp file, with or without its leading slash
    else process.stdout.write(out.stdout.replaceAll(other, `registry/${basename(file)}`).replaceAll(other.slice(1), `registry/${basename(file)}`));
  }
}

// Brings the registry's changes in and keeps yours: a three-way merge against the base in .fizzy-ui/.
async function update() {
  checkAngular();
  const { files, deps } = await selection();
  for (const [target, file] of files) {
    const theirs = await read(file);
    const base = baseOf(target);
    const mine = existsSync(target) ? readFileSync(target, 'utf8') : undefined;
    const old = existsSync(base) ? readFileSync(base, 'utf8') : undefined;
    if (mine === theirs) {
      put(base, theirs);
      console.log(`${target}: up to date`);
    } else if (mine !== undefined && old === theirs) {
      console.log(`${target}: kept your changes (nothing new in the registry)`);
    } else if (mine === undefined || mine === old || opts.overwrite) {
      put(target, theirs);
      put(base, theirs);
      console.log(`update ${target}`);
    } else if (old === undefined) {
      console.log(`${target}: you changed it and there is no base to merge from (added before this version). ` +
        `See the changes with "fizzy-ui diff", or replace it with "fizzy-ui update <name> --overwrite".`);
    } else {
      // git merge-file: exit status = number of conflicts (at most 127), above that an error
      const args = ['merge-file', '-p', '-L', 'yours', '-L', 'base', '-L', 'registry', target, temp(file, old), temp(file, theirs)];
      const out = spawnSync('git', args, { encoding: 'utf8' });
      if (out.error || out.status === null || out.status > 127) {
        console.log(`${target}: you changed it; merging needs git. See "fizzy-ui diff", or use --overwrite.`);
        continue;
      }
      put(target, out.stdout);
      put(base, theirs);
      console.log(out.status ? `merge ${target}: ${out.status} conflict(s), marked with <<<<<<< yours / >>>>>>> registry` : `merge ${target}`);
    }
  }
  install([...deps]);
}

const commands = { init, add, diff, update, list: async () => console.log(Object.keys(JSON.parse(await read('registry.json')).items).join('\n')) };
if (!commands[command]) {
  console.log('usage: fizzy-ui <init|add|diff|update|list> [names...] [--path src/app/ui] [--registry dir|url] [--overwrite]');
  process.exit(command ? 1 : 0);
}
if (!existsSync(resolve('package.json'))) throw new Error('run fizzy-ui from your Angular project root');
commands[command]().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
