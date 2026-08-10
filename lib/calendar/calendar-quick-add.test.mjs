import assert from 'node:assert/strict';
import test from 'node:test';

import { calendarRoutes } from './routes.ts';
import { noteRoutes } from '../notes/routes.ts';
import { taskRoutes } from '../tasks/routes.ts';

test('Calendar quick-add routes forward the selected date without a course', () => {
  const date = '2026-08-18';
  assert.deepEqual(taskRoutes.addForDate(date), { pathname: '/tasks/new', params: { date } });
  assert.deepEqual(calendarRoutes.addForDate(date), { pathname: '/calendar/new', params: { date } });
  assert.deepEqual(noteRoutes.addForDate(date), { pathname: '/notes/new', params: { date } });
});
