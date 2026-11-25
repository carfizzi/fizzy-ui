#!/usr/bin/env node
// fizzy-ui CLI: copies component source from a registry into your Angular project (shadcn-style).
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
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
    harness: { type: 'boolean', default: false },
    theme: { type: 'string' },
    'skip-install': { type: 'boolean', default: false },
  },
});
const [command, ...positionalNames] = positionals;
let names = positionalNames;
// Progress lines: the console, or the result of an MCP tool call (stdout then carries only JSON-RPC).
let out = (line) => console.log(line);
let mcpMode = false;

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
  // The names come from the registry, which --registry can point at a URL: never let one reach the shell as code.
  const bad = missing.find((d) => !/^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/i.test(d));
  if (bad) throw new Error(`refusing to install "${bad}": not an npm package name`);
  const specs = missing.map((d) => (major && d.startsWith('@angular/') ? `${d}@${major}` : d));
  const pm = existsSync('pnpm-lock.yaml') ? 'pnpm' : existsSync('yarn.lock') ? 'yarn' : 'npm';
  const cmd = `${pm} ${pm === 'npm' ? 'install' : 'add'} ${dev ? '-D ' : ''}${specs.join(' ')}`;
  out(`> ${cmd}${opts['skip-install'] ? ' (skipped)' : ''}`);
  if (opts['skip-install']) return;
  if (mcpMode) out(execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }));
  else execSync(cmd, { stdio: 'inherit' });
}

// fizzy-ui's major is the Angular major its components are written for.
function checkAngular() {
  const ours = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8')).version.split('.')[0];
  const theirs = angularMajor();
  if (theirs && theirs !== ours)
    (mcpMode ? out : console.warn)(`warning: this project uses Angular ${theirs}; fizzy-ui ${ours} is for Angular ${ours} (try npx fizzy-ui@${theirs})`);
}

// .fizzy-ui/<target> keeps the registry version a component file was last written from: the base
// that `update` merges your edits and the registry's against. Commit it with the rest.
const baseOf = (target) => join('.fizzy-ui', target);

function put(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function write(target, content, keepBase = false) {
  if (existsSync(target) && !opts.overwrite) return out(`skip ${target} (exists, use --overwrite)`);
  put(target, content);
  if (keepBase) put(baseOf(target), content);
  out(`write ${target}`);
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
    const { files: list, testing = [], dependencies } = item(registry, name);
    for (const file of list) files.set(join(opts.path, basename(file)), file);
    // test harnesses: the ones you have, or all with --harness
    for (const file of testing) if (opts.harness || existsSync(join(opts.path, basename(file)))) files.set(join(opts.path, basename(file)), file);
    dependencies.forEach((d) => deps.add(d));
  }
  if (!files.size) out(`no fizzy-ui components in ${opts.path} (use --path)`);
  return { files, deps };
}

// Writes `content` to a temp file named like `file`, for git to read.
function temp(file, content) {
  const path = join(mkdtempSync(join(tmpdir(), 'fizzy-ui-')), basename(file));
  writeFileSync(path, content);
  return path;
}

// The color tokens of fizzy.css's `:root {` or `.dark {` block: [start, end) and name -> value.
function block(css, selector) {
  const start = css.search(new RegExp(`(^|\\n)${selector.replace('.', '\\.')} \\{`));
  if (start < 0) throw new Error(`no "${selector} {" block in the theme`);
  const end = css.indexOf('}', start);
  return { start, end, tokens: Object.fromEntries([...css.slice(start, end).matchAll(/--([a-z-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])) };
}

// Sets a preset's tokens in both modes; tokens other presets change go back to the registry default.
function applyTheme(css, defaults, presets, name) {
  for (const [selector, mode] of [[':root', 'light'], ['.dark', 'dark']]) {
    const names = new Set(Object.values(presets).flatMap((p) => Object.keys(p[mode])));
    const base = block(defaults, selector).tokens;
    const { start, end } = block(css, selector);
    let text = css.slice(start, end);
    for (const token of names) {
      const value = presets[name][mode][token] ?? base[token];
      const re = new RegExp(`(--${token}:\\s*)[^;]+;`);
      text = re.test(text) ? text.replace(re, `$1${value};`) : `${text}  --${token}: ${value};\n`;
    }
    css = css.slice(0, start) + text + css.slice(end);
  }
  return css;
}

async function init() {
  const registry = JSON.parse(await read('registry.json'));
  const theme = await read(registry.theme);
  if (opts.theme) {
    const presets = JSON.parse(await read(registry.presets));
    if (!Object.hasOwn(presets, opts.theme)) throw new Error(`unknown theme "${opts.theme}". Available: ${Object.keys(presets).join(', ')}`);
    // An existing theme keeps your other edits: only the preset's tokens change.
    const current = existsSync('src/fizzy.css') && !opts.overwrite ? readFileSync('src/fizzy.css', 'utf8') : theme;
    put('src/fizzy.css', applyTheme(current, theme, presets, opts.theme));
    out(`theme ${opts.theme}: src/fizzy.css`);
  } else write('src/fizzy.css', theme);
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
    const files = [...found.files, ...(opts.harness ? (found.testing ?? []) : [])];
    // basename(): a registry can never write outside --path
    for (const file of files) write(join(opts.path, basename(file)), await read(file), true);
    found.dependencies.forEach((d) => deps.add(d));
  }
  install([...deps]);
}

// What `update` would change: your file against the registry's (git diff).
async function diff() {
  const { files } = await selection();
  for (const [target, file] of files) {
    if (!existsSync(target)) {
      out(`${target}: not added`);
      continue;
    }
    const theirs = await read(file);
    if (readFileSync(target, 'utf8') === theirs) {
      out(`${target}: up to date`);
      continue;
    }
    const other = temp(file, theirs);
    const color = `--color=${process.stdout.isTTY ? 'always' : 'never'}`;
    const result = spawnSync('git', ['diff', '--no-index', '--no-prefix', color, '--', target, other], { encoding: 'utf8' });
    if (result.error) out(`${target}: differs from the registry (install git to see how)`);
    // the headers name the temp file, with or without its leading slash
    else out(result.stdout.replaceAll(other, `registry/${basename(file)}`).replaceAll(other.slice(1), `registry/${basename(file)}`).trimEnd());
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
      out(`${target}: up to date`);
    } else if (mine !== undefined && old === theirs) {
      out(`${target}: kept your changes (nothing new in the registry)`);
    } else if (mine === undefined || mine === old || opts.overwrite) {
      put(target, theirs);
      put(base, theirs);
      out(`update ${target}`);
    } else if (old === undefined) {
      out(`${target}: you changed it and there is no base to merge from (added before this version). ` +
        `See the changes with "fizzy-ui diff", or replace it with "fizzy-ui update <name> --overwrite".`);
    } else {
      // git merge-file: exit status = number of conflicts (at most 127), above that an error
      const args = ['merge-file', '-p', '-L', 'yours', '-L', 'base', '-L', 'registry', target, temp(file, old), temp(file, theirs)];
      const result = spawnSync('git', args, { encoding: 'utf8' });
      if (result.error || result.status === null || result.status > 127) {
        out(`${target}: you changed it; merging needs git. See "fizzy-ui diff", or use --overwrite.`);
        continue;
      }
      put(target, result.stdout);
      put(base, theirs);
      out(result.status ? `merge ${target}: ${result.status} conflict(s), marked with <<<<<<< yours / >>>>>>> registry` : `merge ${target}`);
    }
  }
  install([...deps]);
}

// MCP server on stdio (newline-delimited JSON-RPC 2.0): agents list, read and add components.
// The agent picks only names from the registry and a folder inside the project; it never overwrites a file.
const PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const TOOLS = [
  {
    name: 'list_components',
    description: 'List the fizzy-ui components (accessible Angular components on @angular/aria, styled with Tailwind) with a one-line description each.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_component',
    description: 'One component: its docs (install, usage example, keyboard, accessibility, testing) and the full source of its files.',
    inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'A name from list_components' } }, required: ['name'] },
  },
  {
    name: 'add_components',
    description: 'Copy components into the Angular project the server runs in (default folder src/app/ui) and install their npm dependencies. Existing files are kept, never overwritten.',
    inputSchema: {
      type: 'object',
      properties: {
        names: { type: 'array', items: { type: 'string' }, minItems: 1, description: 'Names from list_components' },
        path: { type: 'string', description: 'Folder inside the project (default src/app/ui)' },
        harness: { type: 'boolean', description: 'Also copy the Angular CDK test harnesses' },
      },
      required: ['names'],
    },
  },
];

// The Markdown docs: bundled in the package (docs/), or the repo's public/ in development.
const docsDir = [join(here, 'docs'), join(here, '../public')].find((d) => existsSync(join(d, 'llms.txt')));
const docOf = (name) => {
  const file = docsDir && /^[a-z0-9-]+$/.test(name) ? join(docsDir, 'components', `${name}.md`) : '';
  return file && existsSync(file) ? readFileSync(file, 'utf8') : '';
};

// Whether `path` stays inside the project, following symlinks: its deepest existing folder decides.
function insideProject(path) {
  const root = realpathSync('.');
  let dir = resolve(path);
  const rest = [];
  while (!existsSync(dir)) {
    rest.unshift(basename(dir));
    dir = dirname(dir);
  }
  const real = join(realpathSync(dir), ...rest);
  return real === root || real.startsWith(root + sep);
}

async function callTool(name, args) {
  const registry = JSON.parse(await read('registry.json'));
  if (name === 'list_components')
    return Object.keys(registry.items)
      .map((n) => `${n}: ${/^> (.*)$/m.exec(docOf(n))?.[1] ?? ''}`.trimEnd())
      .join('\n');
  if (name === 'get_component') {
    const found = item(registry, String(args.name));
    const files = [...found.files, ...(found.testing ?? [])];
    const sources = await Promise.all(files.map(async (f) => `## ${basename(f)}\n\n\`\`\`ts\n${(await read(f)).trimEnd()}\n\`\`\``));
    return [docOf(args.name) || `# ${args.name}`, ...sources].join('\n\n');
  }
  if (name === 'add_components') {
    if (!existsSync('package.json')) throw new Error(`no package.json in ${process.cwd()}: start the MCP server in your Angular project`);
    const list = args.names;
    if (!Array.isArray(list) || !list.length || !list.every((n) => typeof n === 'string')) throw new Error('names: a non-empty list of component names');
    const given = args.path === undefined ? 'src/app/ui' : String(args.path);
    if (!insideProject(given)) throw new Error(`path must be a folder inside the project: ${given}`);
    // Normalized: a path that climbs out and back in ('../../proj/x') would put the .fizzy-ui/ base copy outside.
    const path = relative(process.cwd(), resolve(given));
    for (const n of list) item(registry, n); // all known before anything is written
    const saved = { names, path: opts.path, harness: opts.harness, overwrite: opts.overwrite };
    Object.assign(opts, { path, harness: args.harness === true, overwrite: false });
    names = list;
    try {
      await add();
    } finally {
      names = saved.names;
      Object.assign(opts, { path: saved.path, harness: saved.harness, overwrite: saved.overwrite });
    }
    return '';
  }
  throw new Error(`unknown tool: ${name}`);
}

async function mcp() {
  mcpMode = true;
  const version = JSON.parse(readFileSync(join(here, 'package.json'), 'utf8')).version;
  const send = (message) => process.stdout.write(JSON.stringify(message) + '\n');
  const handle = async (line) => {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } });
    }
    const { id, method, params } = message;
    const reply = (result) => send({ jsonrpc: '2.0', id, result });
    const error = (code, text) => send({ jsonrpc: '2.0', id, error: { code, message: text } });
    if (id === undefined) return; // a notification (initialized, cancelled…): nothing to answer
    if (method === 'initialize')
      return reply({
        protocolVersion: PROTOCOLS.includes(params?.protocolVersion) ? params.protocolVersion : PROTOCOLS[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'fizzy-ui', version },
        instructions: 'fizzy-ui copies accessible Angular components into the project (src/app/ui/), where the user owns and edits them. Read a component with get_component before using it; each file exports FZ_<NAME> for the imports of a standalone component.',
      });
    if (method === 'ping') return reply({});
    if (method === 'tools/list') return reply({ tools: TOOLS });
    if (method !== 'tools/call') return error(-32601, `Method not found: ${method}`);
    if (!TOOLS.some((t) => t.name === params?.name)) return error(-32602, `Unknown tool: ${params?.name}`);
    const lines = [];
    out = (text) => lines.push(String(text));
    try {
      const text = await callTool(params.name, params.arguments ?? {});
      reply({ content: [{ type: 'text', text: [text, ...lines].filter(Boolean).join('\n') }] });
    } catch (e) {
      reply({ content: [{ type: 'text', text: [...lines, e.message].join('\n') }], isError: true });
    }
  };
  // One message at a time: a tool call finishes before the next starts.
  let queue = Promise.resolve();
  const input = createInterface({ input: process.stdin });
  input.on('line', (line) => (queue = queue.then(() => handle(line))));
  await new Promise((done) => input.on('close', done));
  await queue;
}

const commands = { init, add, diff, update, mcp, list: async () => out(Object.keys(JSON.parse(await read('registry.json')).items).join('\n')) };
if (!commands[command]) {
  console.log('usage: fizzy-ui <init|add|diff|update|list|mcp> [names...] [--path src/app/ui] [--registry dir|url] [--overwrite] [--harness] [--theme name]');
  process.exit(command ? 1 : 0);
}
// The MCP server checks for a project when a tool needs one: listing and reading work anywhere.
if (command !== 'mcp' && !existsSync(resolve('package.json'))) throw new Error('run fizzy-ui from your Angular project root');
commands[command]().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
