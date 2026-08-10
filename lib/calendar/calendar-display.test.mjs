import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CALENDAR_DISPLAY, filterCalendarItems, sanitizeCalendarDisplay, toggleHiddenCourse } from './calendar-display.ts';

const item = (sourceType, courseId = null) => ({ id: `${sourceType}:${courseId}`, sourceType, courseId });

test('calendar display toggles filter presentation only', () => {
  const items = [item('class_schedule', 'one'), item('task', 'one'), item('event'), item('note')];
  assert.deepEqual(filterCalendarItems(items, { ...DEFAULT_CALENDAR_DISPLAY, showClasses: false, showEventsNotes: false }).map(({ sourceType }) => sourceType), ['task']);
});

test('hidden courses compose with source visibility and personal items remain visible', () => {
  const preferences = toggleHiddenCourse(DEFAULT_CALENDAR_DISPLAY, 'one', false);
  assert.deepEqual(filterCalendarItems([item('task', 'one'), item('event', 'two'), item('note')], preferences).map(({ id }) => id), ['event:two', 'note:null']);
  assert.deepEqual(toggleHiddenCourse(preferences, 'one', true).hiddenCourseIds, []);
});

test('stored calendar preferences are sanitized safely', () => {
  assert.deepEqual(sanitizeCalendarDisplay({ showTasks: false, density: 'detailed', hiddenCourseIds: ['one', 'one', 3] }), { showClasses: true, showTasks: false, showEventsNotes: true, density: 'detailed', hiddenCourseIds: ['one'] });
});
