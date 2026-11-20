import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import {
  deleteAuthSession,
  findSessionUser,
  saveAuthSession,
} from './database';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'scheduly_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

export async function hashPassword(password) {
  const passwordSalt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, passwordSalt, 64);
  return { passwordSalt, passwordHash: Buffer.from(derivedKey).toString('hex') };
}

export async function verifyPassword(password, passwordSalt, passwordHash) {
  const derivedKey = Buffer.from(await scrypt(password, passwordSalt, 64));
  const savedHash = Buffer.from(passwordHash, 'hex');
  return savedHash.length === derivedKey.length && timingSafeEqual(savedHash, derivedKey);
}

export function getSessionToken(request) {
  const cookies = request.headers.get('cookie') || '';
  const cookie = cookies
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  return cookie ? cookie.slice(SESSION_COOKIE.length + 1) : null;
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString();
  saveAuthSession(hashSessionToken(token), userId, expiresAt);
  return token;
}

export function getAuthenticatedUser(request) {
  const token = getSessionToken(request);
  return token ? findSessionUser(hashSessionToken(token)) : null;
}

export function revokeSession(request) {
  const token = getSessionToken(request);
  if (token) {
    deleteAuthSession(hashSessionToken(token));
  }
}

export function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function expiredSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}
