import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build, stale } from './llms.mjs';

test('llms: public/llms.txt and public/components/*.md match docs.ts, the demos and the registry (npm run llms)', async () => {
  assert.deepEqual(await stale(), []);
});

test('llms: the index links every component page, which has its install line and usage', async () => {
  const files = await build();
  const index = files.get('llms.txt');
  const pages = [...files.keys()].filter((p) => p.endsWith('.md'));
  assert.ok(pages.length > 50);
  for (const page of pages) assert.ok(index.includes(`/${page}):`), page);
  const tabs = files.get('components/tabs.md');
  assert.match(tabs, /^# Tabs\n/);
  assert.match(tabs, /`npx fizzy-ui add tabs` copies `tabs.ts`/);
  assert.match(tabs, /from '\.\/ui\/tabs'/);
  assert.match(tabs, /\| ← \/ → \| Move between tabs/);
});

test('harnesses: each docs.ts harness class is exported by the testing file of its registry item, and every testing file is documented', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const { DOCS } = await import('../src/app/docs.ts');
  const registry = JSON.parse(readFileSync(new URL('../registry/registry.json', import.meta.url), 'utf8')).items;
  for (const doc of DOCS) {
    const testing = registry[doc.name].testing ?? [];
    assert.equal(!!doc.harness, testing.length > 0, `${doc.name}: harness in docs.ts and testing in registry.json go together`);
    if (doc.harness) {
      const source = testing.map((f) => readFileSync(new URL(`../registry/${f}`, import.meta.url), 'utf8')).join('\n');
      assert.match(source, new RegExp(`export class ${doc.harness}\\b`), `${doc.name}: ${doc.harness}`);
    }
  }
  const used = new Set(Object.values(registry).flatMap((i) => i.testing ?? []));
  for (const f of readdirSync(new URL('../registry/testing', import.meta.url)).filter((f) => f.endsWith('.harness.ts')))
    assert.ok(used.has(`testing/${f}`), `testing/${f} belongs to a registry item`);
});
