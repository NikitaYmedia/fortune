'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { PageLoading } from '@/components/ui/empty';
import { useToast } from '@/components/ui/toast';
import { useData } from '@/lib/data/store';
import { fieldErrors, projectSchema, type ProjectInput } from '@/lib/validations/schemas';

const FIELDS: { key: keyof ProjectInput; label: string; long: boolean }[] = [
  { key: 'name', label: 'name', long: false },
  { key: 'description', label: 'description', long: false },
  { key: 'problemStatement', label: 'problem', long: true },
  { key: 'purpose', label: 'purpose', long: true },
  { key: 'mainGoal', label: 'goal', long: true },
  { key: 'expectedOutcome', label: 'outcome', long: true },
  { key: 'scope', label: 'scope', long: true },
  { key: 'requirements', label: 'requirements', long: true },
  { key: 'links', label: 'links', long: true },
  { key: 'additionalInformation', label: 'additional', long: true },
];

export function IntroView() {
  const t = useTranslations();
  const { project, ready, updateProject } = useData();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  if (!ready) return <PageLoading />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-medium">{t('intro.title')}</h1>
        {!editing && <Button variant="primary" className="ml-auto" onClick={() => setEditing(true)}>{t('common.edit')}</Button>}
      </div>
      <div className="card">
        {editing ? (
          <IntroForm
            initial={project}
            onCancel={() => setEditing(false)}
            onSave={(v) => { updateProject(v); setEditing(false); toast(t('common.saved')); }}
          />
        ) : (
          FIELDS.map((f) => {
            const value = project[f.key];
            return (
              <section key={f.key} className="mb-4 last:mb-0">
                <h2 className="text-sm font-semibold">{t(`intro.${f.label}`)}</h2>
                <p className={`whitespace-pre-wrap break-words text-sm ${value ? '' : 'text-mute'}`}>{value || t('intro.empty')}</p>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function IntroForm({ initial, onSave, onCancel }: { initial: ProjectInput; onSave: (v: ProjectInput) => void; onCancel: () => void }) {
  const t = useTranslations();
  const [v, setV] = useState<ProjectInput>(() => Object.fromEntries(FIELDS.map((f) => [f.key, initial[f.key]])) as ProjectInput);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = projectSchema.safeParse(v);
    if (!r.success) { setErrors(fieldErrors(r.error)); return; }
    onSave(r.data);
  }

  return (
    <form onSubmit={submit} noValidate>
      {FIELDS.map((f) => (
        <Field key={f.key} id={`p-${f.key}`} label={t(`intro.${f.label}`)} error={errors[f.key] ? t(`validation.${errors[f.key]}`) : undefined}>
          {f.long ? (
            <textarea id={`p-${f.key}`} className="input min-h-24" value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          ) : (
            <input id={`p-${f.key}`} className="input" value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          )}
        </Field>
      ))}
      <div className="mt-5 flex gap-2">
        <Button type="submit" variant="primary">{t('common.save')}</Button>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
    </form>
  );
}
