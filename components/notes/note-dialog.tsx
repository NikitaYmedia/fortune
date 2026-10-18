'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useData } from '@/lib/data/store';
import { fieldErrors, noteSchema, parseTags } from '@/lib/validations/schemas';
import type { Note } from '@/types/note';

export interface NoteDialogState { open: boolean; note?: Note | null }

export function NoteDialog({ state, onClose }: { state: NoteDialogState; onClose: () => void }) {
  const t = useTranslations('notes');
  return (
    <Modal open={state.open} onClose={onClose} title={t(state.note ? 'edit' : 'new')}>
      <NoteForm note={state.note ?? null} onClose={onClose} />
    </Modal>
  );
}

function NoteForm({ note, onClose }: { note: Note | null; onClose: () => void }) {
  const t = useTranslations();
  const { saveNote, deleteNote } = useData();
  const { toast } = useToast();
  const [v, setV] = useState({ title: note?.title ?? '', content: note?.content ?? '', type: note?.type ?? 'note', tags: note?.tags.join(', ') ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));
  const err = (k: string) => (errors[k] ? t(`validation.${errors[k]}`) : undefined);

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = noteSchema.safeParse({ ...v, tags: parseTags(v.tags) });
    if (!r.success) { setErrors(fieldErrors(r.error)); return; }
    saveNote(r.data, note?.id);
    toast(t('common.saved'));
    onClose();
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field id="n-title" label={t('common.title')} error={err('title')}>
        <input id="n-title" className="input" value={v.title} onChange={set('title')} autoFocus />
      </Field>
      <Field id="n-content" label={t('notes.content')} error={err('content')}>
        <textarea id="n-content" className="input min-h-32" value={v.content} onChange={set('content')} />
      </Field>
      <Field id="n-type" label={t('notes.type')}>
        <select id="n-type" className="input" value={v.type} onChange={set('type')}>
          <option value="note">{t('notes.note')}</option>
          <option value="idea">{t('notes.idea')}</option>
        </select>
      </Field>
      <Field id="n-tags" label={t('common.tags')} error={err('tags')}>
        <input id="n-tags" className="input" value={v.tags} onChange={set('tags')} />
      </Field>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button type="submit" variant="primary">{t('common.save')}</Button>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        {note && !confirming && <Button variant="danger" className="ml-auto" onClick={() => setConfirming(true)}>{t('common.delete')}</Button>}
      </div>
      {note && confirming && (
        <div role="alertdialog" className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-red-400/40 p-3 text-sm">
          <span className="flex-1">{t('common.confirmDelete')}</span>
          <Button variant="danger" onClick={() => { deleteNote(note.id); toast(t('common.deleted')); onClose(); }}>{t('common.delete')}</Button>
          <Button onClick={() => setConfirming(false)}>{t('common.cancel')}</Button>
        </div>
      )}
    </form>
  );
}
