import assert from 'node:assert/strict';
import test from 'node:test';

import { filterMaterialFiles, toMaterialApiFilters } from './material-filters.ts';

const courseId = '5083d2fa-70cd-41fa-91e4-e25d076a789a';
const file = (id, extension, assignedCourse = courseId) => ({ id, courseId: assignedCourse, displayName: id, originalName: `${id}.${extension}`, mimeType: 'application/octet-stream', extension, sizeBytes: 10, createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z', course: assignedCourse ? { id: courseId, name: 'Algorithms', code: 'CS 301', color: '#64806a' } : null });
const records = [file('pdf', 'pdf'), file('ppt', 'ppt'), file('pptx', 'pptx'), file('doc', 'doc'), file('docx', 'docx'), file('txt', 'txt'), file('jpg', 'jpg'), file('personal', 'pdf', null)];

test('Slides includes PPT and PPTX exactly', () => {
  assert.deepEqual(filterMaterialFiles(records, { kind: 'all' }, { category: 'slides', search: '' }).map(({ id }) => id), ['ppt', 'pptx']);
});

test('Documents includes DOC, DOCX, and TXT exactly', () => {
  assert.deepEqual(filterMaterialFiles(records, { kind: 'all' }, { category: 'documents', search: '' }).map(({ id }) => id), ['doc', 'docx', 'txt']);
});

test('personal scope excludes every course file', () => {
  assert.deepEqual(filterMaterialFiles(records, { kind: 'personal' }, { category: 'all', search: '' }).map(({ id }) => id), ['personal']);
});

test('course scope sends the stable course UUID and omits category pseudo-values', () => {
  assert.deepEqual(toMaterialApiFilters({ kind: 'course', courseId, courseName: 'Algorithms' }, { category: 'slides', search: ' review ' }), { courseId, search: 'review' });
});

test('all-library Personal selection is local and sends no fake course ID', () => {
  assert.deepEqual(toMaterialApiFilters({ kind: 'all' }, { category: 'all', courseId: 'personal', search: '' }), {});
});

test('search, course filtering, and size sorting compose locally', () => {
  const searchable = [
    { ...file('Lecture Alpha', 'pdf'), sizeBytes: 400 },
    { ...file('Lecture Beta', 'pdf'), sizeBytes: 900 },
    { ...file('Lecture Personal', 'pdf', null), sizeBytes: 1200 },
  ];
  assert.deepEqual(filterMaterialFiles(searchable, { kind: 'all' }, { category: 'pdf', courseId, search: 'lecture', sort: 'largest' }).map(({ id }) => id), ['Lecture Beta', 'Lecture Alpha']);
});

test('all six sorting modes produce deterministic orders', () => {
  const sortable = [
    { ...file('Bravo', 'pdf'), createdAt: '2026-08-02T00:00:00.000Z', sizeBytes: 20 },
    { ...file('Alpha', 'pdf'), createdAt: '2026-08-01T00:00:00.000Z', sizeBytes: 10 },
  ];
  const ids = (sort) => filterMaterialFiles(sortable, { kind: 'all' }, { category: 'all', search: '', sort }).map(({ id }) => id);
  assert.deepEqual(ids('newest'), ['Bravo', 'Alpha']);
  assert.deepEqual(ids('oldest'), ['Alpha', 'Bravo']);
  assert.deepEqual(ids('name_asc'), ['Alpha', 'Bravo']);
  assert.deepEqual(ids('name_desc'), ['Bravo', 'Alpha']);
  assert.deepEqual(ids('largest'), ['Bravo', 'Alpha']);
  assert.deepEqual(ids('smallest'), ['Alpha', 'Bravo']);
});
