'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useData } from '@/lib/data/store';
import { fieldErrors, parseTags, taskSchema } from '@/lib/validations/schemas';
import type { Task } from '@/types/task';

export interface TaskDialogState { open: boolean; task?: Task | null; date?: string }

export function TaskDialog({ state, onClose }: { state: TaskDialogState; onClose: () => void }) {
  const t = useTranslations('tasks');
  return (
    <Modal open={state.open} onClose={onClose} title={t(state.task ? 'edit' : 'new')}>
      <TaskForm task={state.task ?? null} defaultDate={state.date ?? ''} onClose={onClose} />
    </Modal>
  );
}

function TaskForm({ task, defaultDate, onClose }: { task: Task | null; defaultDate: string; onClose: () => void }) {
  const t = useTranslations();
  const { saveTask, deleteTask } = useData();
  const { toast } = useToast();
  const [v, setV] = useState({
    title: task?.title ?? '', description: task?.description ?? '', status: task?.status ?? 'todo',
    priority: task?.priority ?? 'medium', startDate: task?.startDate ?? '', dueDate: task?.dueDate ?? defaultDate,
    tags: task?.tags.join(', ') ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = taskSchema.safeParse({ ...v, tags: parseTags(v.tags) });
    if (!r.success) { setErrors(fieldErrors(r.error)); return; }
    saveTask(r.data, task?.id);
    toast(t('common.saved'));
    onClose();
  }
  const err = (k: string) => (errors[k] ? t(`validation.${errors[k]}`) : undefined);

  return (
    <form onSubmit={submit} noValidate>
      <Field id="t-title" label={t('common.title')} error={err('title')}>
        <input id="t-title" className="input" value={v.title} onChange={set('title')} autoFocus />
      </Field>
      <Field id="t-desc" label={t('common.description')} error={err('description')}>
        <textarea id="t-desc" className="input min-h-20" value={v.description} onChange={set('description')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="t-status" label={t('tasks.status')}>
          <select id="t-status" className="input" value={v.status} onChange={set('status')}>
            {['todo', 'in_progress', 'done'].map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select>
        </Field>
        <Field id="t-prio" label={t('tasks.priority')}>
          <select id="t-prio" className="input" value={v.priority} onChange={set('priority')}>
            {['low', 'medium', 'high', 'urgent'].map((s) => <option key={s} value={s}>{t(`priority.${s}`)}</option>)}
          </select>
        </Field>
        <Field id="t-start" label={t('tasks.startDate')}>
          <input id="t-start" type="date" className="input" value={v.startDate} onChange={set('startDate')} />
        </Field>
        <Field id="t-due" label={t('tasks.dueDate')} error={err('dueDate')}>
          <input id="t-due" type="date" className="input" value={v.dueDate} onChange={set('dueDate')} />
        </Field>
      </div>
      <Field id="t-tags" label={t('common.tags')} error={err('tags')}>
        <input id="t-tags" className="input" value={v.tags} onChange={set('tags')} />
      </Field>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary">{t('common.save')}</Button>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        {task && !confirming && <Button variant="danger" className="ml-auto" onClick={() => setConfirming(true)}>{t('common.delete')}</Button>}
      </div>
      {task && confirming && (
        <div role="alertdialog" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-400/40 p-3 text-sm">
          <span className="flex-1">{t('common.confirmDelete')}</span>
          <Button variant="danger" onClick={() => { deleteTask(task.id); toast(t('common.deleted')); onClose(); }}>{t('common.delete')}</Button>
          <Button onClick={() => setConfirming(false)}>{t('common.cancel')}</Button>
        </div>
      )}
    </form>
  );
}
