import assert from 'node:assert/strict';
import test from 'node:test';
import { getCourseListView } from './course-list-state.ts';

test('an empty array is loading until the course request succeeds', () => {
  assert.equal(getCourseListView('idle', 0), 'loading');
  assert.equal(getCourseListView('loading', 0), 'loading');
});

test('a successful empty response renders the intentional empty state', () => {
  assert.equal(getCourseListView('success', 0), 'empty');
});

test('a successful non-empty response renders courses', () => {
  assert.equal(getCourseListView('success', 2), 'populated');
});
