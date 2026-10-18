'use client';

import { useEffect, type ReactNode } from 'react';
import { PageLoading } from '@/components/ui/empty';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-provider';

/** In account mode, sends signed-out visitors to /login. In demo mode it lets everyone in. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { configured, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && !user) router.replace('/login');
  }, [loading, configured, user, router]);

  if (loading || (configured && !user)) return <PageLoading />;
  return <>{children}</>;
}
