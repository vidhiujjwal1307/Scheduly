import { GoogleGenerativeAI } from '@google/generative-ai';
import { Subject, StudySession, StudyPlan } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function generateStudyPlan(
  apiKey: string,
  subjects: Subject[],
  dailyStudyHours: number,
  preferredStartTime: string,
  breakDuration: number
): Promise<StudyPlan> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const sortedSubjects = [...subjects].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  const subjectDetails = sortedSubjects
    .map((s, i) => {
      const daysUntilExam = Math.ceil(
        (new Date(s.examDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${i + 1}. Subject: "${s.name}"
   - Exam Date: ${s.examDate} (${daysUntilExam} days away)
   - Priority: ${s.priority}
   - Topics to cover: ${s.topics.length > 0 ? s.topics.join(', ') : 'General study'}
   - Color: ${s.color}`;
    })
    .join('\n');

  const prompt = `You are an expert study planner AI. Create a structured, day-wise study timetable for a student.

TODAY'S DATE: ${todayStr}

STUDENT'S SUBJECTS:
${subjectDetails}

CONSTRAINTS:
- Maximum ${dailyStudyHours} hours of study per day
- Preferred start time: ${preferredStartTime}
- Break duration between sessions: ${breakDuration} minutes
- Each study session should be 45-90 minutes long
- Prioritize subjects with closer exam dates and higher priority
- Distribute topics evenly across available days
- Do NOT schedule study for a subject after its exam date
- Ensure no scheduling conflicts (no overlapping sessions)
- Include revision sessions 1-2 days before each exam
- Balance the workload - avoid cramming

RESPONSE FORMAT:
Return ONLY a valid JSON array of study sessions. Each session object must have exactly these fields:
{
  "subjectName": "string (exact subject name from above)",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM (24-hour format)",
  "endTime": "HH:MM (24-hour format)",
  "duration": number (in minutes),
  "topics": ["topic1", "topic2"]
}

Return ONLY the JSON array, no markdown, no explanation, no code blocks. Just the raw JSON array.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  let text = response.text().trim();

  text = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

  let sessions: StudySession[];
  try {
    const rawSessions = JSON.parse(text);
    sessions = rawSessions.map((s: Record<string, unknown>) => {
      const subject = subjects.find(
        (sub) => sub.name.toLowerCase() === (s.subjectName as string).toLowerCase()
      );
      return {
        id: uuidv4(),
        subjectId: subject?.id || '',
        subjectName: s.subjectName as string,
        date: s.date as string,
        startTime: s.startTime as string,
        endTime: s.endTime as string,
        duration: s.duration as number,
        topics: (s.topics as string[]) || [],
        completed: false,
        color: subject?.color || '#6366f1',
      };
    });
  } catch {
    throw new Error(
      'Failed to parse AI response. Please try again. Raw: ' + text.substring(0, 200)
    );
  }

  sessions.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const dates = sessions.map((s) => s.date).sort();

  const plan: StudyPlan = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    sessions,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    startDate: dates[0] || todayStr,
    endDate: dates[dates.length - 1] || todayStr,
  };

  return plan;
}
