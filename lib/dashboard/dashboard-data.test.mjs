import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDashboardSections } from './dashboard-data.ts';

const now = new Date(2026, 7, 6, 10, 0);

function task(id, dueAt, status = 'TODO', courseId = null) {
  return {
    id,
    userId: 'user',
    courseId,
    title: id,
    description: null,
    status,
    priority: 'MEDIUM',
    dueAt,
    completedAt: status === 'COMPLETED' ? now.toISOString() : null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function schedule(id, hour, sourceType = 'event', courseId = null, day = 6) {
  return {
    id,
    sourceId: id,
    scheduleId: sourceType === 'class_schedule' ? id : null,
    sourceType,
    title: id,
    date: `2026-08-${String(day).padStart(2, '0')}`,
    startAt: new Date(2026, 7, day, hour, 0).toISOString(),
    endAt: new Date(2026, 7, day, hour + 1, 0).toISOString(),
    isAllDay: false,
    courseId,
    courseName: courseId ? 'Algorithms' : null,
    color: null,
    location: null,
    status: null,
    priority: null,
  };
}

function file(id, day) {
  return {
    id,
    courseId: null,
    displayName: id,
    originalName: `${id}.pdf`,
    mimeType: 'application/pdf',
    extension: 'pdf',
    sizeBytes: 100,
    createdAt: new Date(2026, 7, day, 8).toISOString(),
    updatedAt: new Date(2026, 7, day, 8).toISOString(),
    course: null,
  };
}

test('combines tasks, classes, events, and files into bounded dashboard sections', () => {
  const result = buildDashboardSections(
    [task('today', new Date(2026, 7, 6, 15).toISOString()), task('upcoming', new Date(2026, 7, 8, 9).toISOString())],
    [schedule('event', 12), schedule('class', 11, 'class_schedule', 'course-a')],
    [file('older', 4), file('newer', 6)],
    now,
  );
  assert.equal(result.allTasksDueTodayCount, 1);
  assert.equal(result.tasksThisWeekCount, 2);
  assert.equal(result.classesTodayCount, 1);
  assert.equal(result.nextScheduleItem?.id, 'class');
  assert.deepEqual(result.recentFiles.map(({ id }) => id), ['newer', 'older']);
});

test('returns empty section data for a user with no records', () => {
  const result = buildDashboardSections([], [], [], now);
  assert.deepEqual(result.tasksDueToday, []);
  assert.deepEqual(result.todaySchedule, []);
  assert.equal(result.nextScheduleItem, null);
});

test('includes a personal task without a course', () => {
  const personal = task('personal-task', new Date(2026, 7, 6, 13).toISOString());
  assert.equal(buildDashboardSections([personal], [], [], now).tasksDueToday[0]?.courseId, null);
});

test('includes a personal event without a course', () => {
  const personal = schedule('personal-event', 14);
  assert.equal(buildDashboardSections([], [personal], [], now).todaySchedule[0]?.courseId, null);
});

test('retains course-related task and event associations', () => {
  const courseTask = task('course-task', new Date(2026, 7, 6, 16).toISOString(), 'TODO', 'course-a');
  const courseEvent = schedule('course-event', 15, 'event', 'course-a');
  const result = buildDashboardSections([courseTask], [courseEvent], [], now);
  assert.equal(result.tasksDueToday[0]?.courseId, 'course-a');
  assert.equal(result.todaySchedule[0]?.courseId, 'course-a');
});

test('returns no next schedule item when the remaining schedule is in the past', () => {
  assert.equal(buildDashboardSections([], [schedule('past', 8)], [], now).nextScheduleItem, null);
});

test('uses the nearest future class or event as next up without adding it to today', () => {
  const result = buildDashboardSections([], [schedule('tomorrow-class', 9, 'class_schedule', 'course-a', 7)], [], now);
  assert.equal(result.nextScheduleItem?.id, 'tomorrow-class');
  assert.equal(result.upcomingSchedule[0]?.id, 'tomorrow-class');
  assert.deepEqual(result.todaySchedule, []);
});

test('keeps a due task in the chronological today timeline', () => {
  const taskItem = { ...schedule('timeline-task', 13, 'task'), status: 'TODO', priority: 'HIGH' };
  assert.equal(buildDashboardSections([], [taskItem], [], now).todaySchedule[0]?.sourceType, 'task');
});

test('completed tasks disappear from both incomplete deadline sections', () => {
  const completedToday = task('done-today', new Date(2026, 7, 6, 12).toISOString(), 'COMPLETED');
  const completedUpcoming = task('done-upcoming', new Date(2026, 7, 8, 12).toISOString(), 'COMPLETED');
  const result = buildDashboardSections([completedToday, completedUpcoming], [], [], now);
  assert.deepEqual(result.tasksDueToday, []);
  assert.deepEqual(result.upcomingDeadlines, []);
});

test('newly uploaded files sort ahead of older files', () => {
  const result = buildDashboardSections([], [], [file('first', 1), file('latest', 6), file('middle', 3)], now);
  assert.deepEqual(result.recentFiles.map(({ id }) => id), ['latest', 'middle', 'first']);
});

test('task and file sections enforce concise display limits', () => {
  const tasks = Array.from({ length: 7 }, (_, index) => task(`task-${index}`, new Date(2026, 7, 6, 11, index).toISOString()));
  const files = Array.from({ length: 6 }, (_, index) => file(`file-${index}`, index + 1));
  const result = buildDashboardSections(tasks, [], files, now);
  assert.equal(result.tasksDueToday.length, 5);
  assert.equal(result.recentFiles.length, 4);
});

test('available sections remain usable when another source has no data', () => {
  const result = buildDashboardSections([], [schedule('working-event', 12)], [file('working-file', 6)], now);
  assert.equal(result.todaySchedule.length, 1);
  assert.equal(result.recentFiles.length, 1);
  assert.deepEqual(result.tasksDueToday, []);
});
