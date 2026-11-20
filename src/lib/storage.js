import { DEFAULT_PREFERENCES } from './constants';

const LEGACY_KEYS = {
  subjects: 'scheduly_subjects',
  studyPlans: 'scheduly_study_plans',
  notes: 'scheduly_notes',
  preferences: 'scheduly_preferences',
};

let migrationPromise;

function migrateLegacyData() {
  if (typeof window === 'undefined' || window.localStorage.getItem('scheduly_db_migrated')) {
    return Promise.resolve();
  }

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const values = {};
      for (const [collection, key] of Object.entries(LEGACY_KEYS)) {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) {
          const value = JSON.parse(stored);
          if (
            collection === 'preferences' &&
            value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            value.geminiApiKey
          ) {
            delete value.geminiApiKey;
            value.groqApiKey = value.groqApiKey || '';
          }
          values[collection] = value;
        }
      }

      const response = await fetch('/api/data/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to migrate browser data');
      }
      window.localStorage.setItem('scheduly_db_migrated', 'true');
    })().catch((error) => {
      migrationPromise = undefined;
      throw error;
    });
  }

  return migrationPromise;
}

async function getCollection(collection) {
  await migrateLegacyData();
  const response = await fetch(`/api/data/${collection}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `Failed to load ${collection}`);
  }
  if (collection === 'preferences') {
    return { ...result.value, hasGroqApiKey: result.hasGroqApiKey };
  }
  return result.value;
}

async function saveCollection(collection, value) {
  const response = await fetch(`/api/data/${collection}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `Failed to save ${collection}`);
  }
  if (collection === 'preferences') {
    return { ...result.value, hasGroqApiKey: result.hasGroqApiKey };
  }
  return result.value;
}

export const getSubjects = () => getCollection('subjects');
export const saveSubjects = (subjects) => saveCollection('subjects', subjects);

export const getStudyPlans = () => getCollection('studyPlans');
export const saveStudyPlans = (plans) => saveCollection('studyPlans', plans);

export async function getActiveStudyPlan() {
  const plans = await getStudyPlans();
  return plans.length > 0 ? plans[plans.length - 1] : null;
}

export const getNotes = () => getCollection('notes');
export const saveNotes = (notes) => saveCollection('notes', notes);

export async function getPreferences() {
  const preferences = await getCollection('preferences');
  return {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    hasGroqApiKey: Boolean(preferences.hasGroqApiKey),
  };
}

export function savePreferences(preferences) {
  const settings = { ...preferences };
  delete settings.hasGroqApiKey;
  return saveCollection('preferences', settings);
}
