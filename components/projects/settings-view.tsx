'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { getTheme, setTheme, type Theme } from '@/lib/utils/theme';

export function SettingsView() {
  const t = useTranslations('settings');
  const { user } = useAuth();
  const [theme, setLocal] = useState<Theme>('dark');
  useEffect(() => { setLocal(getTheme()); }, []);

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-medium">{t('title')}</h1>
      <div className="card space-y-4">
        <div>
          <p className="label !mt-0">{t('language')}</p>
          <LanguageSwitcher className="w-full" />
        </div>
        <div>
          <label htmlFor="theme" className="label !mt-0">{t('theme')}</label>
          <select id="theme" className="input" value={theme} onChange={(e) => { const v = e.target.value as Theme; setLocal(v); setTheme(v); }}>
            <option value="dark">{t('dark')}</option>
            <option value="light">{t('light')}</option>
          </select>
        </div>
        <div>
          <p className="label !mt-0">{t('profile')}</p>
          <p className="text-sm text-mute">{user ? t('account', { email: user.email }) : t('profileOff')}</p>
        </div>
        <p className="text-xs text-mute">{t('userContent')}</p>
      </div>
    </div>
  );
}
