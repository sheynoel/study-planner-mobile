import assert from 'node:assert/strict';
import test from 'node:test';

import { createNoteForm, toCreateNoteRequest, validateNoteForm } from './note-form.ts';

test('a note accepts a title, content, or both', () => {
  assert.deepEqual(validateNoteForm({ ...createNoteForm(), title: 'Office hours' }), {});
  assert.deepEqual(validateNoteForm({ ...createNoteForm(), content: 'Ask about the field report.' }), {});
  assert.equal(validateNoteForm(createNoteForm()).content, 'Add a title or write a note.');
});

test('content-only notes synthesize the required transport title without changing the API contract', () => {
  const request = toCreateNoteRequest({ ...createNoteForm('course-id'), content: 'Bring the lab gown tomorrow morning.', isPinned: true });
  assert.equal(request.title, 'Bring the lab gown tomorrow morning.');
  assert.equal(request.content, 'Bring the lab gown tomorrow morning.');
  assert.equal(request.courseId, 'course-id');
  assert.equal(request.isPinned, true);
});
