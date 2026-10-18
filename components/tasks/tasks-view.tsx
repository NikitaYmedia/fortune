'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Empty, PageLoading } from '@/components/ui/empty';
import { useData } from '@/lib/data/store';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';
import { TaskBoard } from './task-board';
import { TaskDialog, type TaskDialogState } from './task-dialog';
import { TaskRow } from './task-row';

const PRIO: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 };
const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

export function TasksView() {
  const t = useTranslations();
  const { tasks, ready } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState<'due' | 'priority' | 'created'>('due');
  const [mode, setMode] = useState<'list' | 'board'>('board');
  const [dlg, setDlg] = useState<TaskDialogState>({ open: false });

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQ(initial);
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = tasks.filter((x) =>
      (!status || x.status === status) && (!priority || x.priority === priority) &&
      (!term || `${x.title} ${x.description} ${x.tags.join(' ')}`.toLowerCase().includes(term)));
    out.sort((a, b) => {
      if (sort === 'due') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      if (sort === 'priority') return PRIO[b.priority] - PRIO[a.priority];
      return b.createdAt.localeCompare(a.createdAt);
    });
    return out;
  }, [tasks, q, status, priority, sort]);

  if (!ready) return <PageLoading />;
  const edit = (task: Task) => setDlg({ open: true, task });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-medium">{t('tasks.title')}</h1>
        <Button variant="primary" className="ml-auto" onClick={() => setDlg({ open: true })}><Plus size={16} />{t('tasks.new')}</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input type="search" className="input max-w-60" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('tasks.search')} aria-label={t('tasks.search')} />
        <select className="input w-auto" aria-label={t('tasks.status')} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t('tasks.status')}: {t('common.all')}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
        </select>
        <select className="input w-auto" aria-label={t('tasks.priority')} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">{t('tasks.priority')}: {t('common.all')}</option>
          {['low', 'medium', 'high', 'urgent'].map((s) => <option key={s} value={s}>{t(`priority.${s}`)}</option>)}
        </select>
        <select className="input w-auto" aria-label={t('tasks.sort')} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="due">{t('tasks.sortDue')}</option>
          <option value="priority">{t('tasks.sortPriority')}</option>
          <option value="created">{t('tasks.sortCreated')}</option>
        </select>
        <div className="flex gap-1" role="group">
          <Button variant={mode === 'board' ? 'primary' : 'default'} aria-pressed={mode === 'board'} onClick={() => setMode('board')}>{t('tasks.viewBoard')}</Button>
          <Button variant={mode === 'list' ? 'primary' : 'default'} aria-pressed={mode === 'list'} onClick={() => setMode('list')}>{t('tasks.viewList')}</Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Empty>
          <p>{t('tasks.empty')}</p>
          <Button variant="primary" className="mt-3" onClick={() => setDlg({ open: true })}>{t('tasks.createFirst')}</Button>
        </Empty>
      ) : mode === 'board' ? (
        <TaskBoard tasks={list} onEdit={edit} />
      ) : list.length === 0 ? (
        <Empty><p>{t('tasks.emptyFiltered')}</p></Empty>
      ) : (
        <div className="space-y-2">{list.map((x) => <TaskRow key={x.id} task={x} onEdit={edit} />)}</div>
      )}
      <TaskDialog state={dlg} onClose={() => setDlg({ open: false })} />
    </div>
  );
}
