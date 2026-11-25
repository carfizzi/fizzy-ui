import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAIRS, contrast, tokensOf } from '../src/app/theme-color.ts';

const css = readFileSync(new URL('../registry/theme/fizzy.css', import.meta.url), 'utf8');
const presets = JSON.parse(readFileSync(new URL('../registry/theme/presets.json', import.meta.url), 'utf8'));

// jsdom can't run axe's color-contrast rule: the tokens are checked here, for every preset and mode.
test('themes: every text/background pair of every preset, light and dark, meets WCAG AA', () => {
  const failures = [];
  for (const [name, preset] of Object.entries(presets))
    for (const [mode, selector] of [['light', ':root'], ['dark', '.dark']]) {
      const tokens = { ...tokensOf(css, selector), ...preset[mode] };
      for (const [fg, bg, min] of PAIRS) {
        const ratio = contrast(tokens[fg], tokens[bg]);
        if (ratio < min) failures.push(`${name} ${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`);
      }
    }
  assert.deepEqual(failures, []);
});

test('themes: presets only set tokens fizzy.css defines', () => {
  const known = Object.keys(tokensOf(css, ':root'));
  for (const preset of Object.values(presets)) for (const mode of ['light', 'dark']) for (const t of Object.keys(preset[mode])) assert.ok(known.includes(t), t);
});
