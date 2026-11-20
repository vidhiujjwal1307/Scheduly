import { findUserByEmail } from '@/lib/database';
import { createSession, sessionCookie, verifyPassword } from '@/lib/auth';

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
  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordSalt, user.passwordHash))) {
    return Response.json({ error: 'Email or password is incorrect' }, { status: 401 });
  }

  const token = createSession(user.id);
  return Response.json(
    { user: { id: user.id, email: user.email } },
    { headers: { 'Set-Cookie': sessionCookie(token) } }
  );
}
