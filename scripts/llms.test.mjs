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
