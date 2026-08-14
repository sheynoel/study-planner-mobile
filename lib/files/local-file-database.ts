import * as SQLite from 'expo-sqlite';

import type { FileRecord } from '@/lib/api/file.types';

const DATABASE_NAME = 'offline-files.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

type FileRow = {
  id: string; original_name: string; display_name: string; local_uri: string;
  extension: string | null; mime_type: string; size_bytes: number; date_added: string;
  last_opened_at: string | null; course_id: string | null; course_name: string | null;
  description: string | null; local_only: number; updated_at: string;
};

export async function getFileDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) databasePromise = openAndMigrate();
  return databasePromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS local_files (
      id TEXT PRIMARY KEY NOT NULL,
      original_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      local_uri TEXT NOT NULL UNIQUE,
      extension TEXT,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL DEFAULT 0,
      date_added TEXT NOT NULL,
      last_opened_at TEXT,
      course_id TEXT,
      course_name TEXT,
      description TEXT,
      local_only INTEGER NOT NULL DEFAULT 1 CHECK (local_only = 1),
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_local_files_course_id ON local_files(course_id);
    CREATE INDEX IF NOT EXISTS idx_local_files_date_added ON local_files(date_added DESC);
    PRAGMA user_version = 1;
  `);
  return db;
}

export async function listLocalFileRecords(): Promise<FileRecord[]> {
  const db = await getFileDatabase();
  return (await db.getAllAsync<FileRow>('SELECT * FROM local_files ORDER BY date_added DESC')).map(toRecord);
}

export async function getLocalFileRecord(id: string): Promise<FileRecord | null> {
  const db = await getFileDatabase();
  const row = await db.getFirstAsync<FileRow>('SELECT * FROM local_files WHERE id = ?', id);
  return row ? toRecord(row) : null;
}

export async function insertLocalFileRecord(file: FileRecord): Promise<void> {
  const db = await getFileDatabase();
  await db.runAsync(`INSERT INTO local_files
    (id, original_name, display_name, local_uri, extension, mime_type, size_bytes, date_added, last_opened_at, course_id, course_name, description, local_only, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    file.id, file.originalName, file.displayName, file.localUri, file.extension, file.mimeType,
    file.sizeBytes, file.createdAt, file.lastOpenedAt, file.courseId, file.course?.name ?? null,
    file.description, file.updatedAt);
}

export async function updateLocalFileRecord(id: string, values: { displayName?: string; courseId?: string | null; courseName?: string | null; description?: string | null; lastOpenedAt?: string | null }): Promise<void> {
  const current = await getLocalFileRecord(id);
  if (!current) throw new Error('This local file record no longer exists.');
  const now = new Date().toISOString();
  const displayName = values.displayName ?? current.displayName;
  const courseId = values.courseId === undefined ? current.courseId : values.courseId;
  const courseName = values.courseName === undefined ? current.course?.name ?? null : values.courseName;
  const description = values.description === undefined ? current.description : values.description;
  const lastOpenedAt = values.lastOpenedAt === undefined ? current.lastOpenedAt : values.lastOpenedAt;
  const db = await getFileDatabase();
  await db.runAsync('UPDATE local_files SET display_name = ?, course_id = ?, course_name = ?, description = ?, last_opened_at = ?, updated_at = ? WHERE id = ?', displayName, courseId, courseName, description, lastOpenedAt, now, id);
}

export async function deleteLocalFileRecord(id: string): Promise<void> {
  const db = await getFileDatabase();
  await db.runAsync('DELETE FROM local_files WHERE id = ?', id);
}

function toRecord(row: FileRow): FileRecord {
  return {
    id: row.id, originalName: row.original_name, displayName: row.display_name, localUri: row.local_uri,
    extension: row.extension, mimeType: row.mime_type, sizeBytes: row.size_bytes, createdAt: row.date_added,
    updatedAt: row.updated_at, lastOpenedAt: row.last_opened_at, courseId: row.course_id,
    course: row.course_id && row.course_name ? { id: row.course_id, name: row.course_name, code: null, color: '#64806A' } : null,
    description: row.description, localOnly: true,
  };
}
