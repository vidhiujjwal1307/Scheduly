import { Subject, StudyPlan, Note, UserPreferences } from './types';
import { DEFAULT_PREFERENCES } from './constants';

const KEYS = {
  SUBJECTS: 'scheduly_subjects',
  STUDY_PLANS: 'scheduly_study_plans',
  NOTES: 'scheduly_notes',
  PREFERENCES: 'scheduly_preferences',
};

export function getSubjects(): Subject[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.SUBJECTS);
  return data ? JSON.parse(data) : [];
}

export function saveSubjects(subjects: Subject[]): void {
  localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function getStudyPlans(): StudyPlan[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.STUDY_PLANS);
  return data ? JSON.parse(data) : [];
}

export function saveStudyPlans(plans: StudyPlan[]): void {
  localStorage.setItem(KEYS.STUDY_PLANS, JSON.stringify(plans));
}

export function getActiveStudyPlan(): StudyPlan | null {
  const plans = getStudyPlans();
  return plans.length > 0 ? plans[plans.length - 1] : null;
}

export function getNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.NOTES);
  return data ? JSON.parse(data) : [];
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
}

export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  const data = localStorage.getItem(KEYS.PREFERENCES);
  return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
}
