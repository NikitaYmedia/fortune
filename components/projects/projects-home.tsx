'use client';

import { FolderPlus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { Button } from '@/components/ui/button';
import { Empty, PageLoading } from '@/components/ui/empty';
import { Field } from '@/components/ui/field';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Link, useRouter } from '@/i18n/navigation';
import { useData } from '@/lib/data/store';
import { computeStats } from '@/lib/utils/stats';
import { fieldErrors, newProjectSchema } from '@/lib/validations/schemas';
import type { Project } from '@/types/project';

export function ProjectsHome() {
  const t = useTranslations();
  const { projects, allTasks, ready, createProject, deleteProject } = useData();
  const { toast } = useToast();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 font-semibold">
            <img src="/logo.png" alt="" className="h-7 w-7 rounded-lg" />
          {t('app.name')}
        </span>
        <span className="flex-1" />
        <LanguageSwitcher />
        <UserMenu />
      </header>

      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-3xl font-medium">{t('projects.title')}</h1>
        <Button variant="primary" className="ml-auto" onClick={() => setCreating(true)}><FolderPlus size={16} />{t('projects.new')}</Button>
      </div>

      {!ready ? <PageLoading /> : projects.length === 0 ? (
        <Empty>
          <p>{t('projects.empty')}</p>
          <Button variant="primary" className="mt-3" onClick={() => setCreating(true)}>{t('projects.new')}</Button>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const s = computeStats(allTasks.filter((x) => x.projectId === p.id));
            return (
              <article key={p.id} className="card flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <Link href={`/projects/${p.id}`} className="min-w-0 flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yel">
                    <h2 className="truncate text-lg font-medium">{p.name}</h2>
                    <p className="line-clamp-2 min-h-10 text-sm text-mute">{p.description}</p>
                  </Link>
                  <button type="button" onClick={() => setToDelete(p)} aria-label={`${t('common.delete')}: ${p.name}`} className="rounded-lg p-1.5 text-mute hover:bg-elev hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-mute">
                    <span>{t('projects.tasksDone', { done: s.completed, total: s.total })}</span>
                    <span>{s.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.progress}%`, background: 'var(--yel)' }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title={t('projects.new')}>
        <NewProjectForm
          onCancel={() => setCreating(false)}
          onCreate={(v) => { const id = createProject(v); setCreating(false); toast(t('common.created')); router.push(`/projects/${id}`); }}
        />
      </Modal>

      <Modal open={toDelete !== null} onClose={() => setToDelete(null)} title={t('common.delete')}>
        {toDelete && (
          <div className="space-y-4">
            <p className="text-sm">{t('projects.deleteConfirm', { name: toDelete.name })}</p>
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => { deleteProject(toDelete.id); setToDelete(null); toast(t('common.deleted')); }}>{t('common.delete')}</Button>
              <Button onClick={() => setToDelete(null)}>{t('common.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function NewProjectForm({ onCreate, onCancel }: { onCreate: (v: { name: string; description: string }) => void; onCancel: () => void }) {
  const t = useTranslations();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = newProjectSchema.safeParse({ name, description });
    if (!r.success) { setErrors(fieldErrors(r.error)); return; }
    onCreate(r.data);
  }
  const err = (k: string) => (errors[k] ? t(`validation.${errors[k]}`) : undefined);

  return (
    <form onSubmit={submit} noValidate>
      <Field id="np-name" label={t('intro.name')} error={err('name')}>
        <input id="np-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </Field>
      <Field id="np-desc" label={t('intro.description')} error={err('description')}>
        <textarea id="np-desc" className="input min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="mt-5 flex gap-2">
        <Button type="submit" variant="primary">{t('projects.create')}</Button>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
    </form>
  );
}
