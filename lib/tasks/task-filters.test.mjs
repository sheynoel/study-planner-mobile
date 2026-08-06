import assert from 'node:assert/strict';
import test from 'node:test';

import { activeTaskFilterCount, filterTasksLocally, groupTasks, sortTasks, toTaskApiFilters } from './task-filters.ts';

const courseId = '5083d2fa-70cd-41fa-91e4-e25d076a789a';
const now = new Date(2026, 7, 5, 10, 0, 0);
const task = (id, overrides = {}) => ({ id, userId: 'user', courseId: null, title: id, description: null, status: 'TODO', priority: 'MEDIUM', dueAt: null, completedAt: null, createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z', ...overrides });

test('supported task selections remain composable backend filters', () => {
  assert.deepEqual(toTaskApiFilters({ timeView: 'all', courseId, priority: 'HIGH', status: 'IN_PROGRESS', due: 'overdue', search: 'exam' }), { courseId, priority: 'HIGH', status: 'IN_PROGRESS', due: 'overdue' });
});

test('personal and search selections combine locally without inventing API parameters', () => {
  const records = [task('personal exam', { priority: 'HIGH' }), task('course exam', { courseId, priority: 'HIGH' }), task('personal reading', { priority: 'LOW' })];
  const state = { timeView: 'all', courseId: 'personal', priority: 'HIGH', due: 'any', search: 'exam' };
  assert.deepEqual(toTaskApiFilters(state), { courseId: undefined, priority: 'HIGH', status: undefined, due: undefined });
  assert.deepEqual(filterTasksLocally(records, state, () => 'Algorithms', now).map(({ id }) => id), ['personal exam']);
  assert.equal(activeTaskFilterCount(state), 2);
});

test('task grouping separates overdue, today, tomorrow, this week, later, undated, and completed', () => {
  const records = [
    task('overdue', { dueAt: '2026-08-05T09:00:00' }),
    task('today', { dueAt: '2026-08-05T12:00:00' }),
    task('tomorrow', { dueAt: '2026-08-06T12:00:00' }),
    task('week', { dueAt: '2026-08-07T12:00:00' }),
    task('later', { dueAt: '2026-08-10T12:00:00' }),
    task('undated'),
    task('completed', { status: 'COMPLETED' }),
  ];
  assert.deepEqual(groupTasks(records, now).map(({ key }) => key), ['overdue', 'today', 'tomorrow', 'week', 'later', 'undated', 'completed']);
});

test('priority and alphabetical sorting are deterministic', () => {
  const records = [task('Beta', { priority: 'LOW' }), task('Alpha', { priority: 'HIGH' })];
  assert.deepEqual(sortTasks(records, 'priority', () => undefined).map(({ id }) => id), ['Alpha', 'Beta']);
  assert.deepEqual(sortTasks(records, 'alphabetical', () => undefined).map(({ id }) => id), ['Alpha', 'Beta']);
});
