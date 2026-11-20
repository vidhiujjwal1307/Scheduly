'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isPublicPage = pathname === '/' || isAuthPage;
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [verifiedPath, setVerifiedPath] = useState(null);

  useEffect(() => {
    let active = true;

    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Unable to verify your session');
        }
        return result;
      })
      .then((result) => {
        if (!active) return;
        setUser(result.user);
        setStatus(result.user ? 'signed-in' : 'signed-out');
        setVerifiedPath(pathname);
        if (result.user && isAuthPage) router.replace('/dashboard');
        if (!result.user && !isPublicPage) router.replace('/login');
      })
      .catch(() => {
        if (active) {
          setStatus('error');
          setVerifiedPath(pathname);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthPage, isPublicPage, pathname, router]);

  if (verifiedPath === pathname && status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold text-slate-800">Could not verify your session</h1>
          <p className="mt-2 text-sm text-slate-500">Check that the app server is running, then try again.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="gradient-primary mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (verifiedPath !== pathname || status === 'checking' || (isAuthPage && status !== 'signed-out')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-100 border-t-teal-600" />
      </div>
    );
  }

  if (isAuthPage || pathname === '/') return children;
  if (status !== 'signed-in') return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  );
}
