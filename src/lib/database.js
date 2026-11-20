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
  PRAGMA foreign_keys = ON;
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
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS auth_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_migrations (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    PRIMARY KEY (user_id, id)
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

function userCollectionKey(userId, collection) {
  return `user:${userId}:${collection}`;
}

function writeUserCollection(collection, value, userId) {
  database
    .prepare(
      `INSERT INTO app_data (collection, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(collection) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`
    )
    .run(userCollectionKey(userId, collection), JSON.stringify(value), new Date().toISOString());
}

export function getCollection(collection, userId) {
  const key = userCollectionKey(userId, collection);
  const row = database.prepare('SELECT value FROM app_data WHERE collection = ?').get(key);
  return row ? JSON.parse(row.value) : JSON.parse(JSON.stringify(initialCollections[collection]));
}

export function saveCollection(collection, value, userId) {
  writeUserCollection(collection, value, userId);
}

export function createLocalUser({ id, email, passwordSalt, passwordHash }) {
  database.exec('BEGIN IMMEDIATE');
  try {
    const hasAccounts = database.prepare('SELECT COUNT(*) AS count FROM users').get().count > 0;
    const createdAt = new Date().toISOString();
    const insert = database
      .prepare(
        `INSERT OR IGNORE INTO users (id, email, password_salt, password_hash, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(id, email, passwordSalt, passwordHash, createdAt);

    if (Number(insert.changes) === 0) {
      database.exec('COMMIT');
      return null;
    }

    const resetLegacy = database.prepare(
      'UPDATE app_data SET value = ?, updated_at = ? WHERE collection = ?'
    );
    for (const [collection, defaultValue] of Object.entries(initialCollections)) {
      const oldRow = hasAccounts
        ? null
        : database.prepare('SELECT value FROM app_data WHERE collection = ?').get(collection);
      const value = oldRow ? JSON.parse(oldRow.value) : defaultValue;
      writeUserCollection(collection, value, id);
      if (!hasAccounts) {
        resetLegacy.run(JSON.stringify(defaultValue), createdAt, collection);
      }
    }

    database.exec('COMMIT');
    return { id, email };
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function findUserByEmail(email) {
  return database
    .prepare(
      'SELECT id, email, password_salt AS passwordSalt, password_hash AS passwordHash FROM users WHERE email = ?'
    )
    .get(email) ?? null;
}

export function saveAuthSession(tokenHash, userId, expiresAt) {
  database.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').run(new Date().toISOString());
  database
    .prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(tokenHash, userId, expiresAt);
}

export function findSessionUser(tokenHash) {
  return (
    database
      .prepare(
        `SELECT users.id, users.email
         FROM auth_sessions
         JOIN users ON users.id = auth_sessions.user_id
         WHERE auth_sessions.token_hash = ? AND auth_sessions.expires_at > ?`
      )
      .get(tokenHash, new Date().toISOString()) ?? null
  );
}

export function deleteAuthSession(tokenHash) {
  database.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(tokenHash);
}

export function importLegacyData(values, userId) {
  database.exec('BEGIN IMMEDIATE');
  try {
    const migration = database
      .prepare('SELECT id FROM user_migrations WHERE user_id = ? AND id = ?')
      .get(userId, 'browser_local_storage_v1');
    if (migration) {
      database.exec('COMMIT');
      return false;
    }

    const isEmpty = Object.entries(initialCollections).every(
      ([collection, value]) => JSON.stringify(getCollection(collection, userId)) === JSON.stringify(value)
    );
    if (isEmpty) {
      for (const [collection, value] of Object.entries(values)) {
        writeUserCollection(collection, value, userId);
      }
    }

    database
      .prepare('INSERT INTO user_migrations (user_id, id, completed_at) VALUES (?, ?, ?)')
      .run(userId, 'browser_local_storage_v1', new Date().toISOString());
    database.exec('COMMIT');
    return isEmpty;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
