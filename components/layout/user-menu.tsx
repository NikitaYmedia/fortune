'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-provider';

export function UserMenu() {
  const t = useTranslations('auth');
  const { configured, user, signOut } = useAuth();
  const router = useRouter();
  if (!configured || !user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-xs text-mute lg:inline" title={user.email}>{user.email}</span>
      <button
        type="button" aria-label={t('signOut')} title={t('signOut')}
        onClick={async () => { await signOut(); router.replace('/login'); }}
        className="rounded-xl border border-line bg-elev p-2 hover:border-sec"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
