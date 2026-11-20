import { v4 as uuidv4 } from 'uuid';
import { createLocalUser, findUserByEmail } from '@/lib/database';
import { createSession, hashPassword, sessionCookie } from '@/lib/auth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }

  const input = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ error: 'Enter a valid email address' }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return Response.json({ error: 'Password must be between 8 and 128 characters' }, { status: 400 });
  }
  if (findUserByEmail(email)) {
    return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const { passwordSalt, passwordHash } = await hashPassword(password);
  const user = createLocalUser({
    id: uuidv4(),
    email,
    passwordSalt,
    passwordHash,
  });
  if (!user) {
    return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const token = createSession(user.id);
  return Response.json(
    { user },
    { headers: { 'Set-Cookie': sessionCookie(token) } }
  );
}
