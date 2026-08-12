import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_NOTIFICATION_PREFERENCES, normalizeNotificationPreferences } from './notification-preferences.ts';

test('notification preferences default to delivery off with reminder choices preserved', () => {
  assert.deepEqual(normalizeNotificationPreferences(null), DEFAULT_NOTIFICATION_PREFERENCES);
  assert.equal(DEFAULT_NOTIFICATION_PREFERENCES.enabled, false);
  assert.equal(DEFAULT_NOTIFICATION_PREFERENCES.taskReminders, true);
});

test('notification preferences retain valid booleans and sanitize malformed fields', () => {
  assert.deepEqual(normalizeNotificationPreferences({ enabled: true, taskReminders: false, eventReminders: 'yes', noteReminders: false }), {
    enabled: true,
    taskReminders: false,
    eventReminders: true,
    noteReminders: false,
    classReminders: true,
  });
});
