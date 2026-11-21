import { getCollection, saveCollection } from '@/lib/database';
import { getAuthenticatedUser } from '@/lib/auth';

const validCollections = new Set(['subjects', 'studyPlans', 'notes', 'preferences']);

function responseForCollection(collection, value) {
  if (collection !== 'preferences') {
    return Response.json({ value });
  }

  const { groqApiKey, ...publicPreferences } = value;
  return Response.json({
    value: { ...publicPreferences, groqApiKey: '' },
    hasGroqApiKey: Boolean(process.env.GROQ_API_KEY || groqApiKey),
  });
}

function isValidValue(collection, value) {
  if (collection === 'preferences') {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  return Array.isArray(value);
}

export async function GET(request, { params }) {
  const { collection } = await params;
  if (!validCollections.has(collection)) {
    return Response.json({ error: 'Unknown data collection' }, { status: 404 });
  }
  const user = getAuthenticatedUser(request);
  if (!user) {
    return Response.json({ error: 'Please sign in to access your data' }, { status: 401 });
  }

  return responseForCollection(collection, getCollection(collection, user.id));
}

export async function PUT(request, { params }) {
  const { collection } = await params;
  if (!validCollections.has(collection)) {
    return Response.json({ error: 'Unknown data collection' }, { status: 404 });
  }
  const user = getAuthenticatedUser(request);
  if (!user) {
    return Response.json({ error: 'Please sign in to update your data' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (!Object.hasOwn(body ?? {}, 'value') || !isValidValue(collection, body.value)) {
    return Response.json({ error: 'Invalid value for data collection' }, { status: 400 });
  }

  let value = body.value;
  if (collection === 'preferences') {
    const currentPreferences = getCollection(collection, user.id);
    value = {
      ...currentPreferences,
      ...body.value,
      groqApiKey: body.value.groqApiKey || currentPreferences.groqApiKey,
    };
  }
  saveCollection(collection, value, user.id);
  return responseForCollection(collection, value);
}
