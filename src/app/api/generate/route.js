import { getCollection, saveCollection } from '@/lib/database';
import { generateStudyPlan } from '@/lib/groq';

export async function POST() {
  const subjects = getCollection('subjects');
  const preferences = getCollection('preferences');

  if (subjects.length === 0) {
    return Response.json({ error: 'Add at least one subject before generating a plan' }, { status: 400 });
  }
  if (!preferences.groqApiKey) {
    return Response.json({ error: 'Set your Groq API key in Settings first' }, { status: 400 });
  }

  try {
    const plan = await generateStudyPlan(
      preferences.groqApiKey,
      subjects,
      preferences.dailyStudyHours,
      preferences.preferredStartTime,
      preferences.breakDuration
    );
    const plans = getCollection('studyPlans');
    saveCollection('studyPlans', [...plans, plan]);
    return Response.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown generation error';
    return Response.json({ error: `Study plan generation failed: ${message}` }, { status: 502 });
  }
}
