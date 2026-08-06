import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFileListPath,
  createLatestFileRequestGuard,
  normalizeExtension,
  normalizeFileFilters,
} from './file-filters.ts';

const courseA = '5083d2fa-70cd-41fa-91e4-e25d076a789a';
const courseB = '81abf455-2058-428f-8dc4-5612f14cb010';
const records = [
  { id: 'pdf-a', courseId: courseA, extension: 'pdf' },
  { id: 'pptx-a', courseId: courseA, extension: 'pptx' },
  { id: 'pdf-b', courseId: courseB, extension: 'pdf' },
];

function emulateBackend(path) {
  const query = new URL(path, 'https://example.test').searchParams;
  return records.filter((record) =>
    (!query.get('fileType') || record.extension === query.get('fileType')) &&
    (!query.get('courseId') || record.courseId === query.get('courseId'))
  );
}

test('selecting PPTX requests only PPTX records and excludes PDF records', () => {
  const path = buildFileListPath({ fileType: 'PPTX' });
  assert.equal(path, '/files?fileType=pptx');
  assert.deepEqual(emulateBackend(path).map(({ id }) => id), ['pptx-a']);
});

test('selecting PDF requests only PDF records and excludes PPTX records', () => {
  const path = buildFileListPath({ fileType: '.PDF' });
  assert.equal(path, '/files?fileType=pdf');
  assert.deepEqual(emulateBackend(path).map(({ id }) => id), ['pdf-a', 'pdf-b']);
});

test('selecting a course sends its trimmed UUID and returns only that course', () => {
  const path = buildFileListPath({ courseId: `  ${courseA}  ` });
  assert.equal(path, `/files?courseId=${courseA}`);
  assert.ok(emulateBackend(path).every((record) => record.courseId === courseA));
});

test('a newer course request supersedes the previous request', () => {
  const guard = createLatestFileRequestGuard();
  const firstRequest = guard.begin();
  const secondRequest = guard.begin();
  assert.equal(guard.isLatest(firstRequest), false);
  assert.equal(guard.isLatest(secondRequest), true);
  assert.notEqual(buildFileListPath({ courseId: courseA }), buildFileListPath({ courseId: courseB }));
});

test('All Courses removes the course parameter', () => {
  assert.equal(buildFileListPath({ courseId: '' }), '/files');
});

test('combined course and file-type filters send both parameters', () => {
  assert.equal(
    buildFileListPath({ courseId: courseA, fileType: 'PPTX' }),
    `/files?courseId=${courseA}&fileType=pptx`,
  );
});

test('search preserves the selected course and file type', () => {
  assert.equal(
    buildFileListPath({ courseId: courseA, fileType: 'PDF', search: ' reviewer ' }),
    `/files?courseId=${courseA}&fileType=pdf&search=reviewer`,
  );
});

test('a route-provided course remains in normalized initial filters', () => {
  assert.deepEqual(normalizeFileFilters({ courseId: ` ${courseA} ` }), { courseId: courseA });
});

test('extensions are normalized by removing one leading dot and lowercasing', () => {
  assert.equal(normalizeExtension('.PpTx'), 'pptx');
});

test('empty and all-equivalent filter values are not sent', () => {
  assert.equal(buildFileListPath({ courseId: ' ', fileType: '', search: ' ' }), '/files');
});
