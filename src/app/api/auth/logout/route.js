import { expiredSessionCookie, revokeSession } from '@/lib/auth';

export async function POST(request) {
  revokeSession(request);
  return Response.json({ success: true }, { headers: { 'Set-Cookie': expiredSessionCookie() } });
}
