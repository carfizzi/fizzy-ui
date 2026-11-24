// CLI tests: node --test cli/ (npm run test:cli). Each test runs the real CLI in a fresh temp project.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cli = join(here, 'index.mjs');
const registry = join(here, '../registry');

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'fizzy-cli-'));
  writeFileSync(join(dir, 'package.json'), '{ "name": "app" }');
  return dir;
}
// --skip-install: tests never run a package manager
const run = (cwd, ...args) => spawnSync('node', [cli, ...args, '--registry', registry, '--skip-install'], { cwd, encoding: 'utf8' });
const read = (cwd, file) => readFileSync(join(cwd, file), 'utf8');

test('list prints every registry item', () => {
  const out = run(project(), 'list');
  assert.equal(out.status, 0);
  const items = Object.keys(JSON.parse(read(registry, 'registry.json')).items);
  assert.deepEqual(out.stdout.trim().split('\n'), items);
});

test('no command prints usage; an unknown command fails', () => {
  assert.match(run(project()).stdout, /usage: fizzy-ui/);
  assert.equal(run(project(), 'nope').status, 1);
});

test('refuses to run outside a project root', () => {
  const out = run(mkdtempSync(join(tmpdir(), 'fizzy-cli-')), 'add', 'tabs');
  assert.notEqual(out.status, 0);
  assert.match(out.stderr, /project root/);
});

test('add copies the files of each component into src/app/ui, or --path', () => {
  const dir = project();
  const out = run(dir, 'add', 'tabs', 'menubar');
  assert.equal(out.status, 0, out.stderr);
  assert.equal(read(dir, 'src/app/ui/tabs.ts'), read(registry, 'ui/tabs.ts'));
  assert.equal(read(dir, 'src/app/ui/menu.ts'), read(registry, 'ui/menu.ts'));

  assert.equal(run(dir, 'add', 'button', '--path', 'lib/fz').status, 0);
  assert.ok(existsSync(join(dir, 'lib/fz/button.ts')));
});

test('add rejects an unknown name (and inherited keys) and writes nothing', () => {
  const dir = project();
  for (const name of ['nope', 'constructor']) {
    const out = run(dir, 'add', name);
    assert.equal(out.status, 1);
    assert.match(out.stderr, /unknown component/);
  }
  assert.ok(!existsSync(join(dir, 'src')));
});

test('add never overwrites an existing file unless --overwrite', () => {
  const dir = project();
  mkdirSync(join(dir, 'src/app/ui'), { recursive: true });
  writeFileSync(join(dir, 'src/app/ui/tabs.ts'), '// mine');
  assert.match(run(dir, 'add', 'tabs').stdout, /skip .*tabs\.ts/);
  assert.equal(read(dir, 'src/app/ui/tabs.ts'), '// mine');

  assert.equal(run(dir, 'add', 'tabs', '--overwrite').status, 0);
  assert.equal(read(dir, 'src/app/ui/tabs.ts'), read(registry, 'ui/tabs.ts'));
});

test('a registry cannot write outside --path', () => {
  const root = mkdtempSync(join(tmpdir(), 'fizzy-reg-'));
  mkdirSync(join(root, 'a/reg'), { recursive: true });
  writeFileSync(join(root, 'evil.ts'), '// evil');
  writeFileSync(join(root, 'a/reg/registry.json'), JSON.stringify({ items: { evil: { files: ['../../evil.ts'], dependencies: [] } } }));
  const dir = project();
  const out = spawnSync('node', [cli, 'add', 'evil', '--registry', join(root, 'a/reg'), '--skip-install'], { cwd: dir, encoding: 'utf8' });
  assert.equal(out.status, 0, out.stderr);
  assert.equal(read(dir, 'src/app/ui/evil.ts'), '// evil');
});

test('init writes the theme, imports it once, and sets up PostCSS', () => {
  const dir = project();
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src/styles.css'), 'body { margin: 0; }\n');
  assert.equal(run(dir, 'init').status, 0);
  run(dir, 'init'); // a second run adds nothing
  assert.equal(read(dir, 'src/fizzy.css'), read(registry, 'theme/fizzy.css'));
  assert.equal(read(dir, 'src/styles.css'), '@import "tailwindcss";\n@import "./fizzy.css";\nbody { margin: 0; }\n');
  assert.deepEqual(JSON.parse(read(dir, '.postcssrc.json')), { plugins: { '@tailwindcss/postcss': {} } });
});

test('add works from a registry URL', async () => {
  const server = createServer((req, res) => {
    const file = join(registry, decodeURIComponent(req.url));
    if (!existsSync(file)) return res.writeHead(404).end();
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const dir = project();
    const url = `http://127.0.0.1:${server.address().port}/`;
    // async spawn: a sync one would block the server in this same process
    const child = spawn('node', [cli, 'add', 'badge', '--registry', url, '--skip-install'], { cwd: dir });
    const status = await new Promise((r) => child.on('close', r));
    assert.equal(status, 0);
    assert.equal(read(dir, 'src/app/ui/badge.ts'), read(registry, 'ui/badge.ts'));
  } finally {
    server.close();
  }
});
