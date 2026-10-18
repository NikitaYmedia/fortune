'use client';

import clsx from 'clsx';
import {
  addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/empty';
import { TaskDialog, type TaskDialogState } from '@/components/tasks/task-dialog';
import { TaskRow } from '@/components/tasks/task-row';
import { useData } from '@/lib/data/store';
import { dfLocale, fmtDate, toISODate } from '@/lib/utils/date';
import { isOverdue } from '@/lib/utils/stats';

export function CalendarView() {
  const t = useTranslations('calendar');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { tasks, ready } = useData();
  const [cursor, setCursor] = useState(() => new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [dlg, setDlg] = useState<TaskDialogState>({ open: false });
  if (!ready) return <PageLoading />;

  const opts = { weekStartsOn: 1 as const };
  const range = mode === 'month'
    ? { start: startOfWeek(startOfMonth(cursor), opts), end: endOfWeek(endOfMonth(cursor), opts) }
    : { start: startOfWeek(cursor, opts), end: endOfWeek(cursor, opts) };
  const days = eachDayOfInterval(range);
  const shift = (n: number) => setCursor((c) => (mode === 'month' ? addMonths(c, n) : addWeeks(c, n)));
  const todayKey = toISODate(new Date());
  const upcoming = tasks.filter((x) => x.dueDate && x.status !== 'done').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 8);
  const title = mode === 'month'
    ? format(cursor, 'LLLL yyyy', { locale: dfLocale(locale) })
    : `${format(range.start, 'd MMM', { locale: dfLocale(locale) })} – ${format(range.end, 'd MMM yyyy', { locale: dfLocale(locale) })}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-medium">{t('title')}</h1>
        <div className="flex gap-1" role="group">
          <Button variant={mode === 'month' ? 'primary' : 'default'} aria-pressed={mode === 'month'} onClick={() => setMode('month')}>{t('month')}</Button>
          <Button variant={mode === 'week' ? 'primary' : 'default'} aria-pressed={mode === 'week'} onClick={() => setMode('week')}>{t('week')}</Button>
        </div>
        <Button aria-label={t('prev')} onClick={() => shift(-1)}><ChevronLeft size={16} /></Button>
        <span className="min-w-36 text-center text-sm font-medium capitalize">{title}</span>
        <Button aria-label={t('next')} onClick={() => shift(1)}><ChevronRight size={16} /></Button>
        <Button onClick={() => setCursor(new Date())}>{tc('today')}</Button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-1">
          {days.slice(0, 7).map((d) => (
            <div key={d.toISOString()} className="pb-1 text-center text-xs capitalize text-mute">{format(d, 'EEE', { locale: dfLocale(locale) })}</div>
          ))}
          {days.map((d) => {
            const key = toISODate(d);
            const dayTasks = tasks.filter((x) => x.dueDate === key);
            return (
              <div
                key={key}
                className={clsx(
                  'rounded-xl border bg-card p-1.5', mode === 'month' ? 'min-h-24' : 'min-h-48',
                  key === todayKey ? 'border-pri' : 'border-line',
                  mode === 'month' && !isSameMonth(d, cursor) && 'opacity-40',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">{format(d, 'd')}</span>
                  <button
                    type="button" aria-label={t('newOnDate', { date: fmtDate(key, locale, 'd MMMM') })}
                    onClick={() => setDlg({ open: true, date: key })} className="rounded p-0.5 text-mute hover:text-fg"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {dayTasks.map((x) => (
                  <button
                    key={x.id} type="button" onClick={() => setDlg({ open: true, task: x })}
                    className={clsx(
                      'mt-1 block w-full truncate rounded-md border px-1.5 py-0.5 text-left text-xs',
                      isOverdue(x) ? 'border-red-400 text-red-400' : 'border-line bg-elev',
                      x.status === 'done' && 'line-through opacity-60',
                    )}
                  >
                    {x.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <section className="card space-y-2">
        <h2 className="text-sm font-semibold">{t('upcoming')}</h2>
        {upcoming.length === 0 && <p className="text-sm text-mute">{t('noUpcoming')}</p>}
        {upcoming.map((x) => <TaskRow key={x.id} task={x} onEdit={(task) => setDlg({ open: true, task })} />)}
      </section>
      <TaskDialog state={dlg} onClose={() => setDlg({ open: false })} />
    </div>
  );
}
