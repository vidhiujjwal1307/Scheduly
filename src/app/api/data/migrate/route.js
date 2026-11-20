import { importLegacyData } from '@/lib/database';

const validCollections = new Set(['subjects', 'studyPlans', 'notes', 'preferences']);

function isValidValue(collection, value) {
  if (collection === 'preferences') {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  return Array.isArray(value);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  if (body?.values === null || typeof body?.values !== 'object' || Array.isArray(body.values)) {
    return Response.json({ error: 'Migration values must be an object' }, { status: 400 });
  }
  for (const [collection, value] of Object.entries(body.values)) {
    if (!validCollections.has(collection) || !isValidValue(collection, value)) {
      return Response.json({ error: `Invalid migration data for ${collection}` }, { status: 400 });
    }
  }

  return Response.json({ imported: importLegacyData(body.values) });
}
