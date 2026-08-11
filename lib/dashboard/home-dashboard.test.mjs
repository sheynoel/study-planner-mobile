import assert from 'node:assert/strict';
import test from 'node:test';

import { getClassNotes, getClassTimeState, getHomeReminders, getHomeTodayHero, getImportantHomeTasks, getNextRemainingClass, getNextUpcomingEvent, getTodayClasses } from './home-dashboard.ts';

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

test('class notes also include an exact-course reminder due today', () => {
  const matching = note({ id: 'matching-reminder', relevantAt: null, reminderAt: new Date(2026, 7, 7, 9).toISOString() });
  const tomorrow = note({ id: 'tomorrow-reminder', relevantAt: null, reminderAt: new Date(2026, 7, 8, 9).toISOString() });
  assert.deepEqual(getClassNotes([tomorrow, matching], 'course-1', now).map((item) => item.id), ['matching-reminder']);
});

test('important Home tasks are bounded and rank deadline urgency before priority', () => {
  const tasks = [
    task({ id: 'undated-high', priority: 'HIGH' }),
    task({ id: 'soon-low', priority: 'LOW', dueAt: new Date(2026, 7, 8, 9).toISOString() }),
    task({ id: 'today-low', priority: 'LOW', dueAt: new Date(2026, 7, 7, 18).toISOString() }),
    task({ id: 'overdue-low', priority: 'LOW', dueAt: new Date(2026, 7, 6, 9).toISOString() }),
    task({ id: 'completed', status: 'COMPLETED', dueAt: new Date(2026, 7, 5, 9).toISOString() }),
  ];
  assert.deepEqual(getImportantHomeTasks(tasks, now, 3).map((item) => item.id), ['overdue-low', 'today-low', 'soon-low']);
});

test('Home reminders include today events, overdue reminders, and only recent undated pins', () => {
  const courses = [{ id: 'course-1', name: 'Database Systems', code: 'IT401', color: '#567890' }];
  const todayEvent = classItem({ id: 'event', sourceId: 'event-source', sourceType: 'event', title: 'Exam', courseCode: 'IT401' });
  const overdue = note({ id: 'overdue', relevantAt: null, reminderAt: new Date(2026, 7, 6, 8).toISOString() });
  const recentPin = note({ id: 'recent-pin', relevantAt: null, isPinned: true, updatedAt: new Date(2026, 7, 5).toISOString() });
  const oldPin = note({ id: 'old-pin', relevantAt: null, isPinned: true, updatedAt: new Date(2026, 6, 1).toISOString() });
  const reminders = getHomeReminders([todayEvent], [oldPin, recentPin, overdue], courses, new Set(), now);
  assert.deepEqual(reminders.map((item) => item.sourceId), ['overdue', 'event-source', 'recent-pin']);
  assert.equal(reminders[0].courseLabel, 'IT401');
});

test('Today hero counts remaining classes and active tasks due on the local day', () => {
  const pastClass = classItem({ id: 'past', startAt: '2026-08-07T08:00:00', endAt: '2026-08-07T09:00:00' });
  const currentClass = classItem({ id: 'current', startAt: '2026-08-07T10:00:00', endAt: '2026-08-07T11:30:00' });
  const futureClass = classItem({ id: 'future', startAt: '2026-08-07T13:00:00', endAt: '2026-08-07T14:00:00' });
  const hero = getHomeTodayHero([futureClass, pastClass, currentClass], [
    task({ id: 'today', dueAt: new Date(2026, 7, 7, 18).toISOString() }),
    task({ id: 'done', status: 'COMPLETED', dueAt: new Date(2026, 7, 7, 12).toISOString() }),
  ], now);
  assert.equal(hero.remainingClasses, 2);
  assert.equal(hero.tasksDueToday, 1);
  assert.equal(hero.nextItem?.id, 'current');
  assert.equal(hero.nextState, 'current');
});

test('Today hero falls back to an upcoming event when no class remains', () => {
  const event = classItem({ id: 'event', sourceType: 'event', startAt: '2026-08-07T12:00:00', endAt: '2026-08-07T13:00:00' });
  const hero = getHomeTodayHero([event], [], now);
  assert.equal(hero.nextItem?.id, 'event');
  assert.equal(hero.nextState, 'upcoming');
});

test('context projections choose the current class and next future event', () => {
  const currentClass = classItem({ id: 'current', startAt: '2026-08-07T10:00:00', endAt: '2026-08-07T11:30:00' });
  const tomorrowEvent = classItem({ id: 'tomorrow-event', sourceType: 'event', date: '2026-08-08', startAt: '2026-08-08T09:00:00', endAt: '2026-08-08T10:00:00' });
  assert.equal(getNextRemainingClass([currentClass], now)?.id, 'current');
  assert.equal(getNextUpcomingEvent([tomorrowEvent], now)?.id, 'tomorrow-event');
});
