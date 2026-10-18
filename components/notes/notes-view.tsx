'use client';

import { Pencil, Pin, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Empty, PageLoading } from '@/components/ui/empty';
import { useToast } from '@/components/ui/toast';
import { useData } from '@/lib/data/store';
import { fmtDate } from '@/lib/utils/date';
import { NoteDialog, type NoteDialogState } from './note-dialog';

export function NotesView() {
  const t = useTranslations();
  const locale = useLocale();
  const { notes, ready, saveNote, togglePin } = useData();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [quick, setQuick] = useState('');
  const [dlg, setDlg] = useState<NoteDialogState>({ open: false });

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQ(initial);
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return notes
      .filter((n) => (!type || n.type === type) && (!term || `${n.title} ${n.content}`.toLowerCase().includes(term)))
      .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, q, type]);

  if (!ready) return <PageLoading />;

  function addQuick() {
    const title = quick.trim();
    if (!title) return;
    saveNote({ title, content: '', type: 'note', tags: [] });
    setQuick('');
    toast(t('common.created'));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-medium">{t('notes.title')}</h1>
        <Button variant="primary" className="ml-auto" onClick={() => setDlg({ open: true })}><Plus size={16} />{t('notes.new')}</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-60 flex-1 gap-2">
          <input
            className="input" value={quick} onChange={(e) => setQuick(e.target.value)} placeholder={t('notes.quickAdd')} aria-label={t('notes.quickAdd')}
            onKeyDown={(e) => { if (e.key === 'Enter') addQuick(); }}
          />
          <Button onClick={addQuick}>{t('common.add')}</Button>
        </div>
        <input type="search" className="input max-w-52" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('notes.search')} aria-label={t('notes.search')} />
        <select className="input w-auto" aria-label={t('notes.type')} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">{t('notes.type')}: {t('common.all')}</option>
          <option value="note">{t('notes.note')}</option>
          <option value="idea">{t('notes.idea')}</option>
        </select>
      </div>

      {list.length === 0 ? (
        <Empty><p>{t('notes.empty')}</p></Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((n) => (
            <article key={n.id} className="card flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="badge" style={{ background: 'rgba(167,139,250,.18)', color: 'var(--sec)' }}>{t(`notes.${n.type}`)}</span>
                {n.isPinned && <span className="text-xs text-mute">{t('notes.pinned')}</span>}
                <button type="button" onClick={() => togglePin(n.id)} aria-pressed={n.isPinned} aria-label={t(n.isPinned ? 'notes.unpin' : 'notes.pin')} className="ml-auto rounded-lg p-1.5 hover:bg-elev">
                  <Pin size={15} className={n.isPinned ? 'text-yel' : 'text-mute'} />
                </button>
                <button type="button" onClick={() => setDlg({ open: true, note: n })} aria-label={t('common.edit')} className="rounded-lg p-1.5 text-mute hover:bg-elev hover:text-fg">
                  <Pencil size={15} />
                </button>
              </div>
              <h2 className="break-words font-medium">{n.title}</h2>
              {n.content && <p className="whitespace-pre-wrap break-words text-sm text-mute">{n.content}</p>}
              <p className="mt-auto text-xs text-mute">{t('notes.updated')}: {fmtDate(n.updatedAt.slice(0, 10), locale, 'd MMM yyyy')}</p>
            </article>
          ))}
        </div>
      )}
      <NoteDialog state={dlg} onClose={() => setDlg({ open: false })} />
    </div>
  );
}
