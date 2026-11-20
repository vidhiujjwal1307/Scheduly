import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DEFAULT_PREFERENCES } from './constants';

const databasePath =
  process.env.SCHEDULY_DB_PATH || path.join(process.cwd(), 'data', 'scheduly.sqlite');

mkdirSync(path.dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);

database.exec(`
  PRAGMA busy_timeout = 10000;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS app_data (
    collection TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS app_migrations (
    id TEXT PRIMARY KEY,
    completed_at TEXT NOT NULL
  );
`);

const initialCollections = {
  subjects: [],
  studyPlans: [],
  notes: [],
  preferences: DEFAULT_PREFERENCES,
};

const insertCollection = database.prepare(
  'INSERT OR IGNORE INTO app_data (collection, value, updated_at) VALUES (?, ?, ?)'
);
database.exec('BEGIN IMMEDIATE');
try {
  for (const [collection, value] of Object.entries(initialCollections)) {
    insertCollection.run(collection, JSON.stringify(value), new Date().toISOString());
  }

  const savedPreferences = JSON.parse(
    database.prepare('SELECT value FROM app_data WHERE collection = ?').get('preferences').value
  );
  if (Object.hasOwn(savedPreferences, 'geminiApiKey')) {
    delete savedPreferences.geminiApiKey;
    savedPreferences.groqApiKey = savedPreferences.groqApiKey || '';
    database
      .prepare('UPDATE app_data SET value = ?, updated_at = ? WHERE collection = ?')
      .run(JSON.stringify(savedPreferences), new Date().toISOString(), 'preferences');
  }
  database.exec('COMMIT');
} catch (error) {
  database.exec('ROLLBACK');
  throw error;
}

export function getCollection(collection) {
  const row = database.prepare('SELECT value FROM app_data WHERE collection = ?').get(collection);
  return JSON.parse(row.value);
}

export function saveCollection(collection, value) {
  database
    .prepare(
      `INSERT INTO app_data (collection, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(collection) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`
    )
    .run(collection, JSON.stringify(value), new Date().toISOString());
}

export function importLegacyData(values) {
  database.exec('BEGIN IMMEDIATE');
  try {
    const migration = database
      .prepare('SELECT id FROM app_migrations WHERE id = ?')
      .get('browser_local_storage_v1');
    if (migration) {
      database.exec('COMMIT');
      return false;
    }

    const isEmpty = Object.entries(initialCollections).every(
      ([collection, value]) => JSON.stringify(getCollection(collection)) === JSON.stringify(value)
    );
    if (isEmpty) {
      for (const [collection, value] of Object.entries(values)) {
        saveCollection(collection, value);
      }
    }

    database
      .prepare('INSERT INTO app_migrations (id, completed_at) VALUES (?, ?)')
      .run('browser_local_storage_v1', new Date().toISOString());
    database.exec('COMMIT');
    return isEmpty;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
