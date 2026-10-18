'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useData } from '@/lib/data/store';

export function GlobalSearch({ projectId }: { projectId: string }) {
  const t = useTranslations('search');
  const { tasks, notes, ready } = useData();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const term = q.trim().toLowerCase();
  const foundTasks = term ? tasks.filter((x) => `${x.title} ${x.description} ${x.tags.join(' ')}`.toLowerCase().includes(term)).slice(0, 5) : [];
  const foundNotes = term ? notes.filter((x) => `${x.title} ${x.content}`.toLowerCase().includes(term)).slice(0, 5) : [];
  const close = () => { setOpen(false); setQ(''); };

  return (
    <div
      className="relative w-full max-w-md"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
    >
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
      <input
        type="search"
        value={q}
        disabled={!ready}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
        className="input pl-9"
      />
      {open && term && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-auto rounded-xl border border-line bg-elev p-2 shadow-xl">
          {foundTasks.length === 0 && foundNotes.length === 0 && <p className="p-2 text-sm text-mute">{t('noResults')}</p>}
          {foundTasks.length > 0 && <p className="px-2 pt-1 text-xs text-mute">{t('tasks')}</p>}
          {foundTasks.map((x) => (
            <Link key={x.id} href={`/projects/${projectId}/tasks`} onClick={close} className="block truncate rounded-lg px-2 py-1.5 text-sm hover:bg-card focus-visible:bg-card">{x.title}</Link>
          ))}
          {foundNotes.length > 0 && <p className="px-2 pt-1 text-xs text-mute">{t('notes')}</p>}
          {foundNotes.map((x) => (
            <Link key={x.id} href={`/projects/${projectId}/notes`} onClick={close} className="block truncate rounded-lg px-2 py-1.5 text-sm hover:bg-card focus-visible:bg-card">{x.title}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
