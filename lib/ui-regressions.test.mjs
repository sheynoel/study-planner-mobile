import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('quick add owns exactly one green FAB and keeps the add icon while expanded', async () => {
  const source = await readFile(new URL('../components/ui/floating-action-menu.tsx', import.meta.url), 'utf8');
  assert.equal((source.match(/<Fab\b/g) ?? []).length, 1);
  assert.equal((source.match(/style=\{\(\{ pressed \}\) => \[styles\.fab/g) ?? []).length, 1);
  assert.equal((source.match(/name="add"/g) ?? []).length, 1);
  assert.doesNotMatch(source, /name="close"|rotate/);
});

test('Android time pickers unmount on the native change event instead of remaining visible', async () => {
  for (const relative of ['../components/ui/time-picker-field.tsx', '../components/class-schedules/time-range-field.tsx']) {
    const source = await readFile(new URL(relative, import.meta.url), 'utf8');
    assert.match(source, /Platform\.OS === 'android'/);
    assert.match(source, /event\.type === 'dismissed'|event\.type !== 'dismissed'/);
    assert.doesNotMatch(source, /useEffect\(.*set(?:Visible|ActivePicker)/s);
  }
});
