// CLI tests: node --test cli/ (npm run test:cli). Each test runs the real CLI in a fresh temp project.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
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

test("add installs @angular/* at the project's Angular major, and warns on a mismatch", () => {
  const dir = project();
  writeFileSync(join(dir, 'package.json'), '{ "name": "app", "dependencies": { "@angular/core": "^22.3.0" } }');
  const out = run(dir, 'add', 'tabs');
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /> npm install @angular\/aria@22 @angular\/cdk@22 \(skipped\)/);
  assert.doesNotMatch(out.stderr, /warning/);

  writeFileSync(join(dir, 'package.json'), '{ "name": "app", "dependencies": { "@angular/core": "~21.1.0" } }');
  const old = run(dir, 'add', 'badge', '--overwrite');
  assert.equal(old.status, 0, old.stderr);
  assert.match(old.stderr, /Angular 21; fizzy-ui 22 is for Angular 22 \(try npx fizzy-ui@21\)/);
});

// A one-file registry the test can change between `add` and `update`.
function fakeRegistry(content) {
  const root = mkdtempSync(join(tmpdir(), 'fizzy-reg-'));
  mkdirSync(join(root, 'ui'));
  writeFileSync(join(root, 'registry.json'), JSON.stringify({ items: { box: { files: ['ui/box.ts'], dependencies: [] } } }));
  const set = (text) => writeFileSync(join(root, 'ui/box.ts'), text);
  set(content);
  return { root, set };
}
const runWith = (reg, cwd, ...args) => spawnSync('node', [cli, ...args, '--registry', reg, '--skip-install'], { cwd, encoding: 'utf8' });
const lines = (...l) => l.join('\n') + '\n';

test('add keeps the registry version in .fizzy-ui/ as the base for update', () => {
  const dir = project();
  assert.equal(run(dir, 'add', 'tabs').status, 0);
  assert.equal(read(dir, '.fizzy-ui/src/app/ui/tabs.ts'), read(registry, 'ui/tabs.ts'));
});

test('diff: up to date, or a git diff from your file to the registry; only components you have', () => {
  const reg = fakeRegistry(lines('a', 'b', 'c'));
  const dir = project();
  runWith(reg.root, dir, 'add', 'box');
  assert.match(runWith(reg.root, dir, 'diff').stdout, /src\/app\/ui\/box\.ts: up to date/);
  reg.set(lines('a', 'B', 'c'));
  const out = runWith(reg.root, dir, 'diff', 'box');
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /--- src\/app\/ui\/box\.ts\n\+\+\+ registry\/box\.ts/);
  assert.match(out.stdout, /-b\n\+B/);
  assert.match(run(project(), 'diff').stdout, /no fizzy-ui components/);
});

test('update: replaces an untouched file, keeps your edits when the registry has none, merges both', () => {
  const reg = fakeRegistry(lines('one', 'two', 'three', 'four', 'five'));
  const dir = project();
  const box = 'src/app/ui/box.ts';
  runWith(reg.root, dir, 'add', 'box');

  // untouched: replaced
  reg.set(lines('one', 'two', 'three', 'four', 'FIVE'));
  assert.match(runWith(reg.root, dir, 'update').stdout, /update src\/app\/ui\/box\.ts/);
  assert.equal(read(dir, box), lines('one', 'two', 'three', 'four', 'FIVE'));

  // your edit, nothing new upstream: kept
  writeFileSync(join(dir, box), lines('ONE', 'two', 'three', 'four', 'FIVE'));
  assert.match(runWith(reg.root, dir, 'update').stdout, /kept your changes/);
  assert.equal(read(dir, box), lines('ONE', 'two', 'three', 'four', 'FIVE'));

  // your edit and an upstream one elsewhere: both
  reg.set(lines('one', 'two', 'THREE', 'four', 'FIVE'));
  const merged = runWith(reg.root, dir, 'update', 'box');
  assert.match(merged.stdout, /merge src\/app\/ui\/box\.ts\n/);
  assert.equal(read(dir, box), lines('ONE', 'two', 'THREE', 'four', 'FIVE'));
  assert.equal(read(dir, '.fizzy-ui/' + box), lines('one', 'two', 'THREE', 'four', 'FIVE'));

  // the same line changed on both sides: a marked conflict
  writeFileSync(join(dir, box), lines('ONE', 'two', 'mine', 'four', 'FIVE'));
  reg.set(lines('one', 'two', 'theirs', 'four', 'FIVE'));
  assert.match(runWith(reg.root, dir, 'update').stdout, /1 conflict\(s\)/);
  assert.match(read(dir, box), /<<<<<<< yours\nmine\n=======\ntheirs\n>>>>>>> registry/);
});

test('update without a base (added by an older CLI) leaves an edited file alone unless --overwrite', () => {
  const reg = fakeRegistry(lines('new'));
  const dir = project();
  mkdirSync(join(dir, 'src/app/ui'), { recursive: true });
  writeFileSync(join(dir, 'src/app/ui/box.ts'), lines('old, edited'));
  assert.match(runWith(reg.root, dir, 'update').stdout, /no base to merge from/);
  assert.equal(read(dir, 'src/app/ui/box.ts'), lines('old, edited'));
  runWith(reg.root, dir, 'update', '--overwrite');
  assert.equal(read(dir, 'src/app/ui/box.ts'), lines('new'));
  assert.equal(read(dir, '.fizzy-ui/src/app/ui/box.ts'), lines('new'));
});

test('add --harness also copies the test harness (with its base); diff and update follow the harnesses you have', () => {
  const dir = project();
  assert.equal(run(dir, 'add', 'select', '--harness').status, 0);
  assert.equal(read(dir, 'src/app/ui/select.harness.ts'), read(registry, 'testing/select.harness.ts'));
  assert.equal(read(dir, '.fizzy-ui/src/app/ui/select.harness.ts'), read(registry, 'testing/select.harness.ts'));
  assert.match(run(dir, 'diff').stdout, /select\.harness\.ts: up to date/);

  const plain = project();
  run(plain, 'add', 'tabs');
  assert.ok(!existsSync(join(plain, 'src/app/ui/tabs.harness.ts')));
  assert.doesNotMatch(run(plain, 'diff').stdout, /harness/);
});

test('init --theme sets a preset in both modes, keeps your other edits, and neutral goes back to the defaults', () => {
  const dir = project();
  const presets = JSON.parse(read(registry, 'theme/presets.json'));
  assert.equal(run(dir, 'init', '--theme', 'blue').status, 0);
  const blue = read(dir, 'src/fizzy.css');
  assert.ok(blue.includes(`--primary: ${presets.blue.light.primary};`));
  assert.ok(blue.slice(blue.indexOf('\n.dark {')).includes(`--primary: ${presets.blue.dark.primary};`));

  writeFileSync(join(dir, 'src/fizzy.css'), blue.replace('--radius: 0.5rem;', '--radius: 1rem;'));
  assert.equal(run(dir, 'init', '--theme', 'rose').status, 0);
  const rose = read(dir, 'src/fizzy.css');
  assert.ok(rose.includes('--radius: 1rem;'), 'kept');
  assert.ok(rose.includes(`--ring: ${presets.rose.light.ring};`));

  assert.equal(run(dir, 'init', '--theme', 'neutral').status, 0);
  assert.equal(read(dir, 'src/fizzy.css'), read(registry, 'theme/fizzy.css').replace('--radius: 0.5rem;', '--radius: 1rem;'));

  const bad = run(dir, 'init', '--theme', 'plaid');
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /unknown theme "plaid". Available: neutral, blue/);
});

// An MCP session: the server on stdio, newline-delimited JSON-RPC; resolves with every reply by id.
async function mcpSession(cwd, messages) {
  const child = spawn('node', [cli, 'mcp', '--registry', registry, '--skip-install'], { cwd });
  let stdout = '';
  child.stdout.on('data', (d) => (stdout += d));
  for (const m of messages) child.stdin.write((typeof m === 'string' ? m : JSON.stringify({ jsonrpc: '2.0', ...m })) + '\n');
  child.stdin.end();
  await new Promise((done) => child.on('close', done));
  const lines = stdout.trim().split('\n');
  const replies = lines.map((l) => JSON.parse(l)); // every stdout line is JSON-RPC
  return Object.fromEntries(replies.map((r) => [r.id, r]));
}
const call = (id, name, args = {}) => ({ id, method: 'tools/call', params: { name, arguments: args } });

test('mcp: handshake, tools, listing and reading a component (docs and source), outside a project too', async () => {
  const r = await mcpSession(mkdtempSync(join(tmpdir(), 'fizzy-mcp-')), [
    { id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } } },
    { method: 'notifications/initialized' },
    { id: 2, method: 'tools/list' },
    call(3, 'list_components'),
    call(4, 'get_component', { name: 'select' }),
    { id: 5, method: 'nope' },
    call(6, 'rm_rf'),
    'not json',
  ]);
  assert.equal(r[1].result.protocolVersion, '2025-06-18');
  assert.equal(r[1].result.serverInfo.name, 'fizzy-ui');
  assert.deepEqual(r[2].result.tools.map((t) => t.name), ['list_components', 'get_component', 'add_components']);
  assert.match(r[3].result.content[0].text, /^select: Pick one value from a popup list\.$/m);
  const select = r[4].result.content[0].text;
  assert.match(select, /^# Select/);
  assert.match(select, /## select\.ts\n\n```ts\nimport/);
  assert.match(select, /## select\.harness\.ts/);
  assert.equal(r[5].error.code, -32601);
  assert.equal(r[6].error.code, -32602);
  assert.equal(r[null].error.code, -32700);
});

test('mcp: add_components writes into the project, never overwrites, and refuses paths outside it and unknown names', async () => {
  const dir = project();
  mkdirSync(join(dir, 'src/app/ui'), { recursive: true });
  writeFileSync(join(dir, 'src/app/ui/tabs.ts'), '// mine');
  const outside = mkdtempSync(join(tmpdir(), 'fizzy-outside-'));
  symlinkSync(outside, join(dir, 'link'));
  const r = await mcpSession(dir, [
    call(1, 'add_components', { names: ['select', 'tabs'], harness: true }),
    call(2, 'add_components', { names: ['badge'], path: '../elsewhere' }),
    call(3, 'add_components', { names: ['badge'], path: '/tmp' }),
    call(4, 'add_components', { names: ['badge'], path: 'link/ui' }),
    call(5, 'add_components', { names: ['badge', 'nope'] }),
    call(6, 'get_component', { name: '../../package' }),
    call(7, 'add_components', { names: ['badge'], path: `../${basename(dir)}/src/app/lib` }), // out and back in
  ]);
  assert.ok(!r[1].result.isError, r[1].result.content[0].text);
  assert.match(r[1].result.content[0].text, /write src\/app\/ui\/select\.ts/);
  assert.match(r[1].result.content[0].text, /skip src\/app\/ui\/tabs\.ts/);
  assert.equal(read(dir, 'src/app/ui/select.ts'), read(registry, 'ui/select.ts'));
  assert.ok(existsSync(join(dir, 'src/app/ui/select.harness.ts')));
  assert.equal(read(dir, 'src/app/ui/tabs.ts'), '// mine');
  for (const id of [2, 3, 4]) {
    assert.equal(r[id].result.isError, true);
    assert.match(r[id].result.content[0].text, /inside the project/);
  }
  assert.ok(!existsSync(join(outside, 'ui')));
  assert.equal(r[5].result.isError, true);
  assert.match(r[5].result.content[0].text, /unknown component "nope"/);
  assert.ok(!existsSync(join(dir, 'src/app/ui/badge.ts')), 'nothing written when a name is unknown');
  assert.equal(r[6].result.isError, true);
  assert.ok(!r[7].result.isError, r[7].result.content[0].text);
  assert.ok(existsSync(join(dir, 'src/app/lib/badge.ts')));
  assert.ok(existsSync(join(dir, '.fizzy-ui/src/app/lib/badge.ts')), 'the base copy stays inside the project too');
});

test('install refuses a dependency name that is not an npm package name (a registry from a URL is not trusted code)', () => {
  const root = mkdtempSync(join(tmpdir(), 'fizzy-reg-'));
  mkdirSync(join(root, 'ui'));
  writeFileSync(join(root, 'ui/x.ts'), '// x');
  writeFileSync(join(root, 'registry.json'), JSON.stringify({ items: { x: { files: ['ui/x.ts'], dependencies: ['left-pad; touch pwned'] } } }));
  const dir = project();
  const out = spawnSync('node', [cli, 'add', 'x', '--registry', root], { cwd: dir, encoding: 'utf8' });
  assert.equal(out.status, 1);
  assert.match(out.stderr, /refusing to install "left-pad; touch pwned"/);
  assert.ok(!existsSync(join(dir, 'pwned')));
});
