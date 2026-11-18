import { UserPreferences } from './types';

export const SUBJECT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
];

export const NOTE_COLORS = [
  '#fef3c7',
  '#dbeafe',
  '#dcfce7',
  '#fce7f3',
  '#e0e7ff',
  '#f3e8ff',
  '#ccfbf1',
  '#fee2e2',
  '#fff7ed',
  '#f0fdf4',
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  dailyStudyHours: 4,
  preferredStartTime: '09:00',
  breakDuration: 15,
  geminiApiKey: '',
};
