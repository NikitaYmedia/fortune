'use client';

import clsx from 'clsx';
import { Pencil } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useData } from '@/lib/data/store';
import { fmtDate } from '@/lib/utils/date';
import { isOverdue } from '@/lib/utils/stats';
import type { Task } from '@/types/task';

const prioStyle: Record<Task['priority'], { background: string; color: string }> = {
  low: { background: 'rgba(167,139,250,.18)', color: 'var(--sec)' },
  medium: { background: 'rgba(167,139,250,.18)', color: 'var(--sec)' },
  high: { background: 'rgba(253,224,71,.16)', color: 'var(--yel)' },
  urgent: { background: 'rgba(248,113,113,.2)', color: '#F87171' },
};

export function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const t = useTranslations('priority');
  return <span className="badge" style={prioStyle[priority]}>{t(priority)}</span>;
}

export function TaskRow({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const { setTaskStatus } = useData();
  const overdue = isOverdue(task);
  const done = task.status === 'done';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-elev px-3 py-2">
      <input
        type="checkbox" checked={done} aria-label={t('tasks.markComplete')}
        onChange={(e) => setTaskStatus(task.id, e.target.checked ? 'done' : 'todo')}
        className="h-4 w-4 shrink-0 accent-[var(--pri)]"
      />
      <div className="min-w-0 flex-1">
        <p className={clsx('truncate text-sm', done && 'text-mute line-through')}>{task.title}</p>
        <p className="flex flex-wrap items-center gap-2 text-xs text-mute">
          {task.dueDate && (
            <span className={overdue ? 'text-red-400' : ''}>
              {fmtDate(task.dueDate, locale)}{overdue && ` · ${t('tasks.overdue')}`}
            </span>
          )}
          {task.tags.map((g) => <span key={g} className="badge" style={{ background: 'rgba(167,139,250,.18)', color: 'var(--sec)' }}>{g}</span>)}
        </p>
      </div>
      <PriorityBadge priority={task.priority} />
      <button type="button" onClick={() => onEdit(task)} aria-label={t('common.edit')} className="rounded-lg p-1.5 text-mute hover:bg-card hover:text-fg">
        <Pencil size={15} />
      </button>
    </div>
  );
}
