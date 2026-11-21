import { getCollection, saveCollection } from '@/lib/database';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateStudyPlan } from '@/lib/groq';

export async function POST(request) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return Response.json({ error: 'Please sign in to generate a study plan' }, { status: 401 });
  }

  const subjects = getCollection('subjects', user.id);
  const preferences = getCollection('preferences', user.id);

  if (subjects.length === 0) {
    return Response.json({ error: 'Add at least one subject before generating a plan' }, { status: 400 });
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Configure GROQ_API_KEY in .env.local, then restart the app' }, { status: 400 });
  }

  try {
    const plan = await generateStudyPlan(
      apiKey,
      subjects,
      preferences.dailyStudyHours,
      preferences.preferredStartTime,
      preferences.breakDuration
    );
    const plans = getCollection('studyPlans', user.id);
    saveCollection('studyPlans', [...plans, plan], user.id);
    return Response.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    return Response.json({ error: `Study plan generation failed: ${message}` }, { status: 502 });
  }
}
