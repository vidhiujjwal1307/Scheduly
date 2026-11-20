import { v4 as uuidv4 } from 'uuid';

export async function generateStudyPlan(
  apiKey,
  subjects,
  dailyStudyHours,
  preferredStartTime,
  breakDuration
) {
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
Return a JSON object with a "sessions" array. Each session object must have exactly these fields and types:
{
  "subjectName": "Mathematics",
  "date": "2026-11-20",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "topics": ["Calculus"]
}

Return only the JSON object, with no markdown or explanation. Use exact subject names from the provided subjects.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert study planner. Return only a JSON object with a sessions array.',
        },
        { role: 'user', content: prompt },
      ],
      reasoning_format: 'hidden',
      reasoning_effort: 'low',
      max_completion_tokens: 16384,
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Groq API returned an invalid response (${response.status})`);
  }

  if (!response.ok) {
    const message = result?.error?.message || 'Unknown Groq API error';
    throw new Error(`Groq API request failed (${response.status}): ${message}`);
  }

  const text = result?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    const finishReason = result?.choices?.[0]?.finish_reason;
    throw new Error(
      `Groq returned no study plan text${finishReason ? ` (finish reason: ${finishReason})` : ''}. Please try again.`
    );
  }

  let rawPlan;
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end < start) {
      throw new Error('No JSON object found');
    }
    rawPlan = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error('Groq returned malformed JSON. Please try generating the plan again.');
  }

  if (!rawPlan || typeof rawPlan !== 'object' || Array.isArray(rawPlan) || !Array.isArray(rawPlan.sessions)) {
    throw new Error('Groq response did not contain a sessions array. Please try again.');
  }

  const sessions = rawPlan.sessions.map((session, index) => {
    const validSession =
      session &&
      typeof session.subjectName === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(session.date) &&
      /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(session.startTime) &&
      /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(session.endTime) &&
      Number.isFinite(session.duration) &&
      session.duration > 0 &&
      Array.isArray(session.topics) &&
      session.topics.every((topic) => typeof topic === 'string');
    if (!validSession) {
      throw new Error(`Groq returned an invalid study session at position ${index + 1}. Please try again.`);
    }

    const subject = subjects.find(
      (item) => item.name.toLowerCase() === session.subjectName.toLowerCase()
    );
    if (!subject) {
      throw new Error(`Groq returned an unknown subject: ${session.subjectName}`);
    }

    return {
      id: uuidv4(),
      subjectId: subject.id,
      subjectName: session.subjectName,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      topics: session.topics,
      completed: false,
      color: subject.color || '#0f766e',
    };
  });

  sessions.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const dates = sessions.map((s) => s.date).sort();

  const plan = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    sessions,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    startDate: dates[0] || todayStr,
    endDate: dates[dates.length - 1] || todayStr,
  };

  return plan;
}
