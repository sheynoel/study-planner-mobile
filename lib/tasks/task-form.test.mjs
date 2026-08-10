import assert from 'node:assert/strict';
import test from 'node:test';

import { EMPTY_TASK_FORM, toCreateTaskRequest, validateTaskForm } from './task-form.ts';

test('new task defaults preserve TODO status and optional due date', () => {
  const request = toCreateTaskRequest({ ...EMPTY_TASK_FORM, title: 'Read chapter 4' });
  assert.equal(request.status, 'TODO');
  assert.equal(request.dueAt, null);
  assert.equal(request.courseId, null);
});

test('course selection is passed through as its UUID', () => {
  const request = toCreateTaskRequest({ ...EMPTY_TASK_FORM, title: 'Lab report', courseId: 'course-uuid' });
  assert.equal(request.courseId, 'course-uuid');
});

test('a selected date without an explicit time retains the local 23:59 behavior', () => {
  const request = toCreateTaskRequest({ ...EMPTY_TASK_FORM, title: 'Essay', dueDate: '2026-08-14' });
  assert.equal(request.dueAt, new Date(2026, 7, 14, 23, 59, 0, 0).toISOString());
  assert.deepEqual(validateTaskForm({ ...EMPTY_TASK_FORM, title: 'Essay', dueDate: '2026-08-14' }), {});
});
