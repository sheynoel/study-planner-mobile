import assert from 'node:assert/strict';
import test from 'node:test';
import { createSingleFlight } from './single-flight.ts';

test('concurrent callers share exactly one refresh operation', async () => {
  const run = createSingleFlight();
  let calls = 0;
  const operation = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return 'new-access-token';
  };
  const results = await Promise.all(Array.from({ length: 5 }, () => run(operation)));
  assert.equal(calls, 1);
  assert.deepEqual(results, Array(5).fill('new-access-token'));
});

test('a completed refresh does not lock future refreshes', async () => {
  const run = createSingleFlight();
  let calls = 0;
  await run(async () => ++calls);
  await run(async () => ++calls);
  assert.equal(calls, 2);
});
