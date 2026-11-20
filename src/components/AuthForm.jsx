'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }
      router.replace('/');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-teal-50/60 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-teal-100 bg-white p-6 shadow-sm sm:p-9">
        <Link href="/" className="mb-8 inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-teal-800">Scheduly</span>
        </Link>

        <header className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isSignup
              ? 'Keep your subjects and study plan together in one place.'
              : 'Sign in to continue with your study plan.'}
          </p>
        </header>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              minLength={isSignup ? 8 : undefined}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Type your password again"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isSignup ? 'Already have an account?' : 'New to Scheduly?'}{' '}
          <Link
            href={isSignup ? '/login' : '/signup'}
            className="font-semibold text-teal-700 hover:text-teal-900"
          >
            {isSignup ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  );
}
