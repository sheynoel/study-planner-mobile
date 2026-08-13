import assert from 'node:assert/strict';
import test from 'node:test';
import { classifySessionRestorationFailure } from './session-restoration.ts';

test('network and timeout failures preserve a locally known session', () => {
  assert.equal(classifySessionRestorationFailure({ kind: 'network' }), 'offline');
  assert.equal(classifySessionRestorationFailure({ kind: 'timeout' }), 'offline');
});

test('HTTP and contract failures are never mislabeled as offline', () => {
  assert.equal(classifySessionRestorationFailure({ kind: 'http', status: 403 }), 'error');
  assert.equal(classifySessionRestorationFailure({ kind: 'http', status: 500 }), 'error');
  assert.equal(classifySessionRestorationFailure({ kind: 'http', status: 503 }), 'error');
  assert.equal(classifySessionRestorationFailure({ kind: 'invalid-response', status: 200 }), 'error');
});

test('a conclusive authentication rejection invalidates the session', () => {
  assert.equal(classifySessionRestorationFailure({ kind: 'http', status: 401 }), 'invalidate');
});
