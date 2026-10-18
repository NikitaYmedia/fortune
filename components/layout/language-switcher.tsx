'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label={t('language')}
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className={`input w-auto ${className}`}
    >
      <option value="en">English</option>
      <option value="uk">Українська</option>
    </select>
  );
}
