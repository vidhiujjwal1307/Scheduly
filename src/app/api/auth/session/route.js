import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request) {
  const user = getAuthenticatedUser(request);
  return Response.json({
    user: user ? { id: user.id, email: user.email } : null,
  });
}
