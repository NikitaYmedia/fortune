'use client';

import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import clsx from 'clsx';
import { GripVertical, Pencil } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useData } from '@/lib/data/store';
import { fmtDate } from '@/lib/utils/date';
import { isOverdue } from '@/lib/utils/stats';
import type { Task, TaskStatus } from '@/types/task';
import { PriorityBadge } from './task-row';

const COLUMNS: { status: TaskStatus; color: string }[] = [
  { status: 'todo', color: 'var(--mute)' },
  { status: 'in_progress', color: 'var(--yel)' },
  { status: 'done', color: 'var(--ok)' },
];

function CardBody({ task }: { task: Task }) {
  const t = useTranslations('tasks');
  const locale = useLocale();
  const overdue = isOverdue(task);
  return (
    <>
      <p className={clsx('break-words text-sm', task.status === 'done' && 'text-mute line-through')}>{task.title}</p>
      {task.tags.length > 0 && (
        <p className="mt-1 flex flex-wrap gap-1">
          {task.tags.map((g) => <span key={g} className="badge" style={{ background: 'rgba(167,139,250,.18)', color: 'var(--sec)' }}>{g}</span>)}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={clsx('text-xs', overdue ? 'text-red-400' : 'text-mute')}>
            {fmtDate(task.dueDate, locale)}{overdue && ` · ${t('overdue')}`}
          </span>
        )}
      </div>
    </>
  );
}

function BoardCard({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const t = useTranslations();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: task.id });
  return (
    <div ref={setNodeRef} className={clsx('flex gap-2 rounded-xl border border-line bg-elev p-3', isDragging && 'opacity-40')}>
      <button
        ref={setActivatorNodeRef} {...listeners} {...attributes} type="button" aria-label={t('tasks.dragHandle')} title={t('tasks.dragHandle')}
        className="-ml-1 h-6 shrink-0 cursor-grab touch-none rounded text-mute hover:text-fg active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1"><CardBody task={task} /></div>
      <button type="button" onClick={() => onEdit(task)} aria-label={t('common.edit')} className="h-6 shrink-0 rounded text-mute hover:text-fg">
        <Pencil size={14} />
      </button>
    </div>
  );
}

function Column({ status, color, tasks, onEdit }: { status: TaskStatus; color: string; tasks: Task[]; onEdit: (t: Task) => void }) {
  const t = useTranslations('status');
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      ref={setNodeRef} aria-label={t(status)}
      className={clsx('card min-h-48 space-y-2 transition-colors', isOver && 'border-pri')}
      style={isOver ? { background: 'var(--elev)' } : undefined}
    >
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
        {t(status)}
        <span className="ml-auto text-xs font-normal text-mute">{tasks.length}</span>
      </h2>
      {tasks.map((x) => <BoardCard key={x.id} task={x} onEdit={onEdit} />)}
    </section>
  );
}

export function TaskBoard({ tasks, onEdit }: { tasks: Task[]; onEdit: (t: Task) => void }) {
  const { setTaskStatus } = useData();
  const [active, setActive] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const onStart = (e: DragStartEvent) => setActive(tasks.find((x) => x.id === e.active.id) ?? null);
  const onEnd = (e: DragEndEvent) => {
    setActive(null);
    const task = tasks.find((x) => x.id === e.active.id);
    const target = e.over?.id as TaskStatus | undefined;
    if (task && target && target !== task.status) setTaskStatus(task.id, target);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => setActive(null)}>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((c) => (
          <Column key={c.status} status={c.status} color={c.color} tasks={tasks.filter((x) => x.status === c.status)} onEdit={onEdit} />
        ))}
      </div>
      <DragOverlay>
        {active && <div className="rounded-xl border border-pri bg-elev p-3 shadow-2xl"><CardBody task={active} /></div>}
      </DragOverlay>
    </DndContext>
  );
}
