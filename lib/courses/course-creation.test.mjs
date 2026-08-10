import assert from 'node:assert/strict';
import test from 'node:test';

import { createCourseWithSchedules, expandWeekdaySchedules } from './course-creation.ts';

test('creates a course without requiring schedules', async () => {
  const result = await createCourseWithSchedules(async () => ({ id: 'course-1' }), [], async () => undefined);
  assert.deepEqual(result, { course: { id: 'course-1' }, createdScheduleCount: 0, scheduleError: null });
});

test('creates multiple schedules sequentially for the confirmed course', async () => {
  const calls = [];
  const result = await createCourseWithSchedules(async () => ({ id: 'course-1' }), ['Monday', 'Thursday'], async (courseId, schedule) => { calls.push([courseId, schedule]); });
  assert.deepEqual(calls, [['course-1', 'Monday'], ['course-1', 'Thursday']]);
  assert.equal(result.createdScheduleCount, 2);
  assert.equal(result.scheduleError, null);
});

test('reports a partial schedule result without losing the course', async () => {
  const failure = new Error('Schedule conflict');
  const result = await createCourseWithSchedules(async () => ({ id: 'course-1' }), ['Monday', 'Thursday', 'Friday'], async (_courseId, schedule) => { if (schedule === 'Thursday') throw failure; });
  assert.equal(result.course.id, 'course-1');
  assert.equal(result.createdScheduleCount, 1);
  assert.equal(result.scheduleError, failure);
});

test('expands a shared multi-weekday schedule into one record per weekday', () => {
  const schedules = expandWeekdaySchedules([{ weekdays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'], startTime: '08:00', endTime: '09:30', room: 'Room 204', startDate: '2026-08-10', endDate: '2026-12-18' }]);
  assert.deepEqual(schedules.map((schedule) => schedule.weekday), ['MONDAY', 'WEDNESDAY', 'FRIDAY']);
  assert.ok(schedules.every((schedule) => schedule.startTime === '08:00' && schedule.room === 'Room 204'));
});
