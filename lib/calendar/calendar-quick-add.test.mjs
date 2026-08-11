import assert from 'node:assert/strict';
import test from 'node:test';

import { calendarRoutes } from './routes.ts';
import { noteRoutes } from '../notes/routes.ts';
import { taskRoutes } from '../tasks/routes.ts';
import { fileRoutes } from '../files/routes.ts';

test('Calendar quick-add routes forward the selected date without a course', () => {
  const date = '2026-08-18';
  assert.deepEqual(taskRoutes.addForDate(date), { pathname: '/tasks/new', params: { date } });
  assert.deepEqual(calendarRoutes.addForDate(date), { pathname: '/calendar/new', params: { date } });
  assert.deepEqual(noteRoutes.addForDate(date), { pathname: '/notes/new', params: { date } });
});

test('Home week-strip navigation opens Calendar on the requested date', () => {
  assert.deepEqual(calendarRoutes.forDate('2026-08-14'), { pathname: '/calendar', params: { date: '2026-08-14' } });
});

test('Course creation routes preserve course context without changing API payloads', () => {
  const courseId = 'course-123';
  assert.deepEqual(taskRoutes.addForCourse(courseId), { pathname: '/tasks/new', params: { courseId } });
  assert.deepEqual(calendarRoutes.addForCourse(courseId), { pathname: '/calendar/new', params: { courseId } });
  assert.deepEqual(noteRoutes.addForCourse(courseId), { pathname: '/notes/new', params: { courseId } });
  assert.deepEqual(fileRoutes.uploadFromCourseDetails(courseId), { pathname: '/files/upload', params: { autoPick: '1', courseId, returnOnSuccess: '1' } });
});
