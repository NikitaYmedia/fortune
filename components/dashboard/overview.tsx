'use client';

import { eachDayOfInterval, endOfWeek, format, formatDistanceToNow, startOfWeek } from 'date-fns';
import { CircleCheck, Clock, ListChecks, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { ActivityChart } from '@/components/charts/activity-chart';
import { ProgressRing } from '@/components/charts/progress-ring';
import { TaskDialog, type TaskDialogState } from '@/components/tasks/task-dialog';
import { TaskRow } from '@/components/tasks/task-row';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/empty';
import { useToast } from '@/components/ui/toast';
import { Link } from '@/i18n/navigation';
import { useData } from '@/lib/data/store';
import { dfLocale, fmtDate, toISODate } from '@/lib/utils/date';
import { completedPerDay, computeStats, isOverdue } from '@/lib/utils/stats';

export function Overview({ projectId }: { projectId: string }) {
  const t = useTranslations('overview');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { project, tasks, notes, milestones, ready, saveNote } = useData();
  const { toast } = useToast();
  const [dlg, setDlg] = useState<TaskDialogState>({ open: false });
  const [quick, setQuick] = useState('');
  if (!ready) return <PageLoading />;

  const base = `/projects/${projectId}`;
  const stats = computeStats(tasks);
  const chart = completedPerDay(tasks).map((d) => ({ label: format(d.date, 'EEE', { locale: dfLocale(locale) }), count: d.count }));
  const upcoming = tasks.filter((x) => x.dueDate && x.status !== 'done').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const recent = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const week = eachDayOfInterval({ start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) });
  const ms = [...milestones].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const dot = { done: 'var(--ok)', in_progress: 'var(--yel)', planned: 'var(--mute)' } as const;

  function addQuick() {
    const title = quick.trim();
    if (!title) return;
    saveNote({ title, content: '', type: 'note', tags: [] });
    setQuick('');
    toast(t('noteAdded'));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm text-mute">{t('label')}</p>
          <h1 className="break-words text-3xl font-medium">{project.name}</h1>
          <p className="text-sm text-mute">{project.description}</p>
          {project.isDemo && <span className="badge mt-2 inline-block" style={{ background: 'rgba(253,224,71,.14)', color: 'var(--yel)' }}>{t('demoData')}</span>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-xl border border-line bg-elev px-3 py-1.5 text-sm hover:border-sec">{t('actions')}</summary>
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-line bg-elev p-1 shadow-xl">
              <Link href={`${base}/introduction`} className="block rounded-lg px-3 py-2 text-sm hover:bg-card">{t('editProject')}</Link>
              <Link href={`${base}/calendar`} className="block rounded-lg px-3 py-2 text-sm hover:bg-card">{t('openCalendar')}</Link>
            </div>
          </details>
          <Link href={`${base}/introduction`} className="rounded-xl border border-line bg-elev px-3 py-1.5 text-sm hover:border-sec">{tc('manage')}</Link>
          <Button variant="primary" onClick={() => setDlg({ open: true })}><Plus size={16} />{tc('new')}</Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: 'total', n: stats.total, Icon: ListChecks, color: 'var(--sec)' },
              { k: 'completed', n: stats.completed, Icon: CircleCheck, color: 'var(--ok)' },
              { k: 'open', n: stats.open, Icon: Clock, color: 'var(--yel)' },
            ].map(({ k, n, Icon, color }) => (
              <div key={k} className="card flex flex-col justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--elev)', color }}><Icon size={18} /></span>
                <div>
                  <p className="text-4xl font-medium leading-none">{n}</p>
                  <p className="mt-1 text-xs text-mute">{t(k)}</p>
                </div>
              </div>
            ))}
            <div className="card flex flex-col items-center justify-center gap-1">
              <ProgressRing value={stats.progress} label={t('progress')} />
              <p className="text-xs text-mute">{t('progress')}</p>
            </div>
          </div>

          <section className="card">
            <h2 className="mb-2 text-sm font-semibold">{t('activity')}</h2>
            <ActivityChart data={chart} />
          </section>

          <section className="card">
            <h2 className="mb-2 text-sm font-semibold">{t('week')}</h2>
            <div className="overflow-x-auto">
              <div className="grid min-w-[560px] grid-cols-7 gap-2">
                {week.map((d) => {
                  const key = toISODate(d);
                  return (
                    <div key={key} className={`rounded-xl border p-2 ${key === toISODate(new Date()) ? 'border-pri' : 'border-line'}`}>
                      <p className="text-xs capitalize text-mute">{format(d, 'EEE d', { locale: dfLocale(locale) })}</p>
                      {tasks.filter((x) => x.dueDate === key).map((x) => (
                        <button key={x.id} type="button" onClick={() => setDlg({ open: true, task: x })} className={`mt-1 block w-full truncate rounded-md bg-elev px-1.5 py-0.5 text-left text-xs ${isOverdue(x) ? 'text-red-400' : ''}`}>
                          {x.title}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="card space-y-2">
            <h2 className="text-sm font-semibold">{t('recent')}</h2>
            {recent.length === 0 && <p className="text-sm text-mute">{t('noTasks')}</p>}
            {recent.slice(0, 5).map((x) => <TaskRow key={x.id} task={x} onEdit={(task) => setDlg({ open: true, task })} />)}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card space-y-2">
            <h2 className="text-sm font-semibold">{t('deadlines')}</h2>
            {upcoming.length === 0 && <p className="text-sm text-mute">{t('noDeadlines')}</p>}
            {upcoming.map((x) => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{x.title}</span>
                <span className={`shrink-0 text-xs ${isOverdue(x) ? 'text-red-400' : 'text-mute'}`}>{fmtDate(x.dueDate, locale)}</span>
              </div>
            ))}
          </section>

          <section className="card space-y-2">
            <h2 className="text-sm font-semibold">{t('milestones')}</h2>
            {ms.length === 0 && <p className="text-sm text-mute">{t('noMilestones')}</p>}
            <ol className="space-y-2 border-l border-line pl-4">
              {ms.map((m) => (
                <li key={m.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: dot[m.status] }} />
                  <p>{m.title}</p>
                  <p className="text-xs text-mute">{fmtDate(m.dueDate, locale, 'd MMM yyyy')}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="card space-y-2">
            <h2 className="text-sm font-semibold">{t('activityFeed')}</h2>
            {recent.length === 0 && <p className="text-sm text-mute">{t('noActivity')}</p>}
            {recent.slice(0, 4).map((x) => (
              <p key={x.id} className="flex justify-between gap-2 text-sm">
                <span className="truncate">{x.title}</span>
                <span className="shrink-0 text-xs text-mute">{formatDistanceToNow(new Date(x.updatedAt), { addSuffix: true, locale: dfLocale(locale) })}</span>
              </p>
            ))}
          </section>

          <section className="card space-y-2">
            <h2 className="text-sm font-semibold">{t('notes')}</h2>
            <div className="flex gap-2">
              <input
                className="input" value={quick} onChange={(e) => setQuick(e.target.value)} placeholder={t('quickNote')} aria-label={t('quickNote')}
                onKeyDown={(e) => { if (e.key === 'Enter') addQuick(); }}
              />
              <Button onClick={addQuick}>{tc('add')}</Button>
            </div>
            <Link href={`${base}/notes`} className="text-sm text-sec hover:underline">{t('openNotes')} ({notes.length})</Link>
          </section>
        </aside>
      </div>
      <TaskDialog state={dlg} onClose={() => setDlg({ open: false })} />
    </div>
  );
}
