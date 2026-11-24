import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextVersion } from './release.mjs';

test('nextVersion: minor and patch within the Angular major, a new Angular major resets', () => {
  assert.equal(nextVersion('22.0.0', 22, 'minor'), '22.1.0');
  assert.equal(nextVersion('22.1.3', 22, 'minor'), '22.2.0');
  assert.equal(nextVersion('22.1.3', 22, 'patch'), '22.1.4');
  assert.equal(nextVersion('22.4.1', 23, 'patch'), '23.0.0');
  assert.throws(() => nextVersion('23.0.0', 22, 'minor'), /older/);
});
