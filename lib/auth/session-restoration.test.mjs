import assert from 'node:assert/strict';
import test from 'node:test';
import { classifySessionRestorationFailure } from './session-restoration.ts';

test('network and timeout failures preserve a locally known session', () => {
  assert.equal(classifySessionRestorationFailure({ kind: 'network' }), 'offline');
  assert.equal(classifySessionRestorationFailure({ kind: 'timeout' }), 'offline');
});

test('temporary server failures do not prove the session is invalid', () => {
  assert.equal(classifySessionRestorationFailure({ kind: 'http', status: 503 }), 'offline');
});

test('a conclusive authentication rejection invalidates the session', () => {
  assert.equal(classifySessionRestorationFailure({ kind: 'http', status: 401 }), 'invalidate');
});
