import assert from 'node:assert/strict';
import test from 'node:test';

import { getTaskDeadline } from './task-deadline.ts';
import { activeTaskFilterCount, filterTasksLocally, sortTasks, toTaskApiFilters } from './task-filters.ts';

const courseId = '5083d2fa-70cd-41fa-91e4-e25d076a789a';
const now = new Date(2026, 7, 5, 10, 0, 0);
const task = (id, overrides = {}) => ({ id, userId: 'user', courseId: null, title: id, description: null, status: 'TODO', priority: 'MEDIUM', dueAt: null, completedAt: null, createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z', ...overrides });

test('supported task selections remain composable backend filters', () => {
  assert.deepEqual(toTaskApiFilters({ courseId, priority: 'HIGH', status: 'IN_PROGRESS', due: 'overdue', search: 'exam', selectedDate: null }), { courseId, priority: 'HIGH', status: 'IN_PROGRESS', due: 'overdue' });
});

test('personal, selected date, and search combine locally without inventing API parameters', () => {
  const records = [task('personal exam', { priority: 'HIGH', dueAt: '2026-08-05T14:00:00' }), task('course exam', { courseId, priority: 'HIGH', dueAt: '2026-08-05T14:00:00' }), task('personal reading', { priority: 'LOW', dueAt: '2026-08-06T14:00:00' })];
  const state = { courseId: 'personal', priority: 'HIGH', due: 'any', search: 'exam', selectedDate: '2026-08-05' };
  assert.deepEqual(toTaskApiFilters(state), { courseId: undefined, priority: 'HIGH', status: undefined, due: undefined });
  assert.deepEqual(filterTasksLocally(records, state, () => 'Algorithms', now).map(({ id }) => id), ['personal exam']);
  assert.equal(activeTaskFilterCount(state), 1);
});

test('specific course filters use UUIDs and retain tasks without deadlines', () => {
  const records = [task('course undated', { courseId }), task('other undated', { courseId: 'other' }), task('course dated', { courseId, dueAt: '2026-08-06T14:00:00' })];
  const state = { courseId, due: 'any', search: '', selectedDate: null };
  assert.deepEqual(filterTasksLocally(records, state, () => undefined, now).map(({ id }) => id), ['course undated', 'course dated']);
});

test('status, priority, and today filters combine in local time', () => {
  const records = [
    task('match', { status: 'IN_PROGRESS', priority: 'HIGH', dueAt: '2026-08-05T18:00:00' }),
    task('wrong status', { status: 'TODO', priority: 'HIGH', dueAt: '2026-08-05T18:00:00' }),
    task('wrong day', { status: 'IN_PROGRESS', priority: 'HIGH', dueAt: '2026-08-06T09:00:00' }),
  ];
  const state = { status: 'IN_PROGRESS', priority: 'HIGH', due: 'today', search: '', selectedDate: null };
  assert.deepEqual(filterTasksLocally(records, state, () => undefined, now).map(({ id }) => id), ['match']);
});

test('overdue filtering excludes completed tasks', () => {
  const records = [task('late', { dueAt: '2026-08-04T09:00:00' }), task('done late', { status: 'COMPLETED', dueAt: '2026-08-04T09:00:00' })];
  const state = { due: 'overdue', search: '', selectedDate: null };
  assert.deepEqual(filterTasksLocally(records, state, () => undefined, now).map(({ id }) => id), ['late']);
});

test('completed tasks are hidden by default and remain accessible through the completed filter', () => {
  const records = [task('assigned'), task('working', { status: 'IN_PROGRESS' }), task('done', { status: 'COMPLETED' })];
  const defaultState = { due: 'any', search: '', selectedDate: null };
  assert.deepEqual(filterTasksLocally(records, defaultState, () => undefined, now).map(({ id }) => id), ['assigned', 'working']);
  assert.deepEqual(filterTasksLocally(records, { ...defaultState, status: 'COMPLETED' }, () => undefined, now).map(({ id }) => id), ['done']);
});

test('this month uses the device-local calendar month', () => {
  const records = [task('this month', { dueAt: '2026-08-25T09:00:00' }), task('next month', { dueAt: '2026-09-01T09:00:00' })];
  assert.deepEqual(filterTasksLocally(records, { due: 'this_month', search: '', selectedDate: null }, () => undefined, now).map(({ id }) => id), ['this month']);
});

test('deadline labels are local, human, and never mark completed tasks overdue', () => {
  assert.deepEqual(getTaskDeadline(task('soon', { dueAt: '2026-08-05T15:00:00' }), now), { label: 'Due in 5 hours', tone: 'primary' });
  assert.deepEqual(getTaskDeadline(task('tomorrow', { dueAt: '2026-08-06T09:00:00' }), now), { label: 'Due tomorrow', tone: 'primary' });
  assert.deepEqual(getTaskDeadline(task('future', { dueAt: '2026-08-08T09:00:00' }), now), { label: 'Due in 3 days', tone: 'muted' });
  assert.deepEqual(getTaskDeadline(task('late', { dueAt: '2026-08-04T09:00:00' }), now), { label: 'Overdue by 1 day', tone: 'danger' });
  assert.deepEqual(getTaskDeadline(task('done', { status: 'COMPLETED', dueAt: '2026-08-01T09:00:00', completedAt: '2026-08-02T09:00:00' }), now), { label: 'Completed', tone: 'success' });
});

test('all task sorting options are deterministic and keep undated tasks after dated tasks', () => {
  const records = [
    task('Beta', { courseId: 'other-course', priority: 'LOW', createdAt: '2026-08-01T00:00:00.000Z', dueAt: '2026-08-07T12:00:00' }),
    task('Alpha', { courseId, priority: 'HIGH', createdAt: '2026-08-03T00:00:00.000Z', dueAt: '2026-08-06T12:00:00' }),
    task('Undated', { priority: 'MEDIUM', createdAt: '2026-08-02T00:00:00.000Z' }),
  ];
  assert.deepEqual(sortTasks(records, 'deadline_soonest').map(({ id }) => id), ['Alpha', 'Beta', 'Undated']);
  assert.deepEqual(sortTasks(records, 'deadline_latest').map(({ id }) => id), ['Beta', 'Alpha', 'Undated']);
  assert.deepEqual(sortTasks(records, 'priority').map(({ id }) => id), ['Alpha', 'Undated', 'Beta']);
  assert.deepEqual(sortTasks(records, 'created').map(({ id }) => id), ['Alpha', 'Undated', 'Beta']);
  assert.deepEqual(sortTasks(records, 'created_oldest').map(({ id }) => id), ['Beta', 'Undated', 'Alpha']);
  assert.deepEqual(sortTasks(records, 'course', (id) => id === courseId ? 'Algorithms' : undefined).map(({ id }) => id), ['Beta', 'Alpha', 'Undated']);
  assert.deepEqual(sortTasks(records, 'alphabetical').map(({ id }) => id), ['Alpha', 'Beta', 'Undated']);
});
