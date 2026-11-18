export interface Subject {
  id: string;
  name: string;
  examDate: string;
  priority: 'high' | 'medium' | 'low';
  color: string;
  topics: string[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  topics: string[];
  completed: boolean;
  color: string;
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  sessions: StudySession[];
  totalHours: number;
  startDate: string;
  endDate: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  subjectName?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface UserPreferences {
  dailyStudyHours: number;
  preferredStartTime: string;
  breakDuration: number;
  geminiApiKey: string;
}
