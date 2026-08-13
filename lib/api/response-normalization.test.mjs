import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeUser } from './auth-normalization.ts';
import { normalizeClassSchedule, normalizeClassSchedules } from './class-schedule-normalization.ts';
import { normalizeCourse, normalizeCourses } from './course-normalization.ts';

const timestamp = '2026-08-13T03:00:00.000Z';
const legacyUser = { id: 'user-1', name: 'Student', email: 'student@example.com', createdAt: timestamp, updatedAt: timestamp };
const legacySchedule = { id: 'schedule-1', userId: 'user-1', courseId: 'course-1', weekday: 'MONDAY', startTime: '08:00', endTime: '09:30', room: 'Lab 2', startDate: '2026-08-17', endDate: '2026-12-18', createdAt: timestamp, updatedAt: timestamp };
const legacyCourse = { id: 'course-1', userId: 'user-1', name: 'Algorithms', code: 'CS 301', description: null, instructor: 'Professor Rivera', room: 'Room 402', color: '#0A7EA4', createdAt: timestamp, updatedAt: timestamp };

test('pre-timezone auth users normalize to the canonical nullable timezone contract', () => {
  assert.deepEqual(normalizeUser(legacyUser), { ...legacyUser, timezone: null });
  assert.equal(normalizeUser({ ...legacyUser, timezone: 8 }), null);
});

test('an existing pre-group single-day schedule receives safe extension defaults', () => {
  assert.deepEqual(normalizeClassSchedule(legacySchedule, 'Asia/Manila'), { ...legacySchedule, scheduleGroupId: null, timezone: 'Asia/Manila', courseArchived: false, holidayDates: [], exceptions: [] });
});

test('an empty schedule list remains a valid no-classes response', () => {
  assert.deepEqual(normalizeClassSchedules([]), []);
});

test('new grouped Mon/Wed/Fri schedules retain canonical group metadata', () => {
  const schedules = ['MONDAY', 'WEDNESDAY', 'FRIDAY'].map((weekday, index) => normalizeClassSchedule({ ...legacySchedule, id: `schedule-${index}`, weekday, scheduleGroupId: 'group-1', timezone: 'Asia/Manila', courseArchived: false, holidayDates: [], exceptions: [] }));
  assert.ok(schedules.every((schedule) => schedule?.scheduleGroupId === 'group-1'));
  assert.deepEqual(schedules.map((schedule) => schedule?.weekday), ['MONDAY', 'WEDNESDAY', 'FRIDAY']);
});

test('archived and cancelled canonical fields remain available to consumers', () => {
  const normalized = normalizeClassSchedule({ ...legacySchedule, scheduleGroupId: null, timezone: 'Asia/Manila', courseArchived: true, holidayDates: ['2026-08-24'], exceptions: [{ id: 'exception-1', date: '2026-08-31', cancelled: true, startTimeOverride: null, endTimeOverride: null, roomOverride: null }] });
  assert.equal(normalized?.courseArchived, true);
  assert.equal(normalized?.exceptions[0].cancelled, true);
});

test('malformed extension fields are rejected rather than silently discarded', () => {
  assert.equal(normalizeClassSchedule({ ...legacySchedule, exceptions: [{ cancelled: 'yes' }] }), null);
  assert.equal(normalizeClassSchedule({ ...legacySchedule, scheduleGroupId: 42 }), null);
});

test('pre-semester courses normalize to the canonical nullable lifecycle contract', () => {
  assert.deepEqual(normalizeCourse(legacyCourse), { ...legacyCourse, semesterId: null, archivedAt: null });
  assert.deepEqual(normalizeCourses([]), []);
});

test('canonical archived courses retain lifecycle fields and malformed fields are rejected', () => {
  const archivedAt = '2026-08-13T04:00:00.000Z';
  assert.deepEqual(normalizeCourse({ ...legacyCourse, semesterId: 'semester-1', archivedAt }), { ...legacyCourse, semesterId: 'semester-1', archivedAt });
  assert.equal(normalizeCourse({ ...legacyCourse, semesterId: 42 }), null);
  assert.equal(normalizeCourse({ ...legacyCourse, archivedAt: 'not-a-date' }), null);
});
