'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useData } from '@/lib/data/store';
import { isDueSoon, isOverdue } from '@/lib/utils/stats';

/** Only real, derived events: overdue and due-soon tasks. */
export function NotificationsMenu() {
  const t = useTranslations('notifications');
  const { tasks } = useData();
  const [open, setOpen] = useState(false);
  const overdue = tasks.filter(isOverdue).length;
  const soon = tasks.filter((x) => isDueSoon(x)).length;
  const items = [
    overdue > 0 ? { key: 'o', text: t('overdue', { count: overdue }), bad: true } : null,
    soon > 0 ? { key: 's', text: t('dueSoon', { count: soon }), bad: false } : null,
  ].filter((x): x is { key: string; text: string; bad: boolean } => x !== null);

  return (
    <div className="relative" onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
      <button
        type="button" aria-label={t('title')} aria-expanded={open} onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl border border-line bg-elev p-2 hover:border-sec"
      >
        <Bell size={18} />
        {items.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-yel" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-line bg-elev p-3 shadow-xl">
          <p className="mb-2 text-sm font-semibold">{t('title')}</p>
          {items.length === 0 && <p className="text-sm text-mute">{t('empty')}</p>}
          {items.map((i) => <p key={i.key} className={`py-1 text-sm ${i.bad ? 'text-red-400' : ''}`}>{i.text}</p>)}
        </div>
      )}
    </div>
  );
}
