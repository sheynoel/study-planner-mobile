import assert from 'node:assert/strict';
import test from 'node:test';

import { filterHomeTasks, getClassNotes, getClassTimeState, getTodayClasses } from './home-dashboard.ts';

const now = new Date(2026, 7, 7, 10, 30);

function task(overrides = {}) {
  return { id: crypto.randomUUID(), userId: 'user', courseId: 'course-1', title: 'Task', description: null, status: 'TODO', priority: 'MEDIUM', dueAt: null, completedAt: null, createdAt: now.toISOString(), updatedAt: now.toISOString(), ...overrides };
}

function classItem(overrides = {}) {
  return { id: crypto.randomUUID(), sourceId: 'schedule', scheduleId: 'schedule', sourceType: 'class_schedule', title: 'Database Systems', date: '2026-08-07', startAt: '2026-08-07T10:00:00', endAt: '2026-08-07T11:30:00', isAllDay: false, courseId: 'course-1', courseName: 'Database Systems', color: '#567890', location: 'Lab 2', status: null, priority: null, ...overrides };
}

function note(overrides = {}) {
  return { id: crypto.randomUUID(), userId: 'user', courseId: 'course-1', title: 'Bring lab gown', content: null, relevantAt: new Date(2026, 7, 7, 8).toISOString(), reminderAt: null, isPinned: false, createdAt: now.toISOString(), updatedAt: now.toISOString(), ...overrides };
}

test('today classes are chronological and exclude other calendar sources', () => {
  const later = classItem({ id: 'later', startAt: '2026-08-07T13:00:00', endAt: '2026-08-07T14:00:00' });
  const earlier = classItem({ id: 'earlier' });
  const event = classItem({ id: 'event', sourceType: 'event' });
  assert.deepEqual(getTodayClasses([later, event, earlier], now).map((item) => item.id), ['earlier', 'later']);
});

test('class state distinguishes past, current, and upcoming meetings', () => {
  assert.equal(getClassTimeState(classItem({ endAt: '2026-08-07T09:00:00' }), now), 'past');
  assert.equal(getClassTimeState(classItem(), now), 'current');
  assert.equal(getClassTimeState(classItem({ startAt: '2026-08-07T12:00:00', endAt: '2026-08-07T13:00:00' }), now), 'upcoming');
});

test('class notes require the exact course and today as the relevant local date', () => {
  const matching = note({ id: 'matching' });
  const otherCourse = note({ id: 'other-course', courseId: 'course-2' });
  const tomorrow = note({ id: 'tomorrow', relevantAt: new Date(2026, 7, 8, 8).toISOString() });
  const undated = note({ id: 'undated', relevantAt: null });
  assert.deepEqual(getClassNotes([otherCourse, tomorrow, matching, undated], 'course-1', now).map((item) => item.id), ['matching']);
});

test('default Home tasks are active and ordered overdue, future, then no deadline', () => {
  const tasks = [
    task({ id: 'none', title: 'No due date' }),
    task({ id: 'future', dueAt: new Date(2026, 7, 9, 11).toISOString() }),
    task({ id: 'complete', status: 'COMPLETED', dueAt: new Date(2026, 7, 6, 11).toISOString() }),
    task({ id: 'overdue', dueAt: new Date(2026, 7, 6, 11).toISOString() }),
  ];
  assert.deepEqual(filterHomeTasks(tasks, { time: 'any' }, now).map((item) => item.id), ['overdue', 'future', 'none']);
  assert.deepEqual(filterHomeTasks(tasks, { time: 'any', status: 'COMPLETED' }, now).map((item) => item.id), ['complete']);
});

test('Home task filters combine time, course, status, and priority', () => {
  const matching = task({ id: 'matching', courseId: null, priority: 'HIGH', status: 'IN_PROGRESS', dueAt: new Date(2026, 7, 7, 15).toISOString() });
  const wrongPriority = task({ id: 'wrong-priority', courseId: null, priority: 'LOW', status: 'IN_PROGRESS', dueAt: matching.dueAt });
  const result = filterHomeTasks([matching, wrongPriority], { courseId: 'personal', priority: 'HIGH', status: 'IN_PROGRESS', time: 'today' }, now);
  assert.deepEqual(result.map((item) => item.id), ['matching']);
});

test('This month includes earlier overdue work in the current local month', () => {
  const earlier = task({ id: 'earlier', dueAt: new Date(2026, 7, 2, 12).toISOString() });
  const previousMonth = task({ id: 'previous', dueAt: new Date(2026, 6, 31, 12).toISOString() });
  assert.deepEqual(filterHomeTasks([previousMonth, earlier], { time: 'this_month' }, now).map((item) => item.id), ['earlier']);
});
