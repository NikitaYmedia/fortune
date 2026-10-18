'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth/auth-provider';
import { createSupabaseAdapter } from '@/lib/supabase/adapter';
import { getSupabase } from '@/lib/supabase/client';
import type { NewProjectInput, NoteInput, ProjectInput, TaskInput } from '@/lib/validations/schemas';
import type { Milestone } from '@/types/milestone';
import type { Note } from '@/types/note';
import type { Project } from '@/types/project';
import type { Task, TaskStatus } from '@/types/task';
import type { DataAdapter, Snapshot } from './adapter';
import { localAdapter } from './local-adapter';

interface DataCtx {
  ready: boolean;
  /** false when the route points at a project that does not exist */
  projectFound: boolean;
  projects: Project[];
  allTasks: Task[];
  /** current project (from the route) and its data */
  project: Project;
  tasks: Task[];
  notes: Note[];
  milestones: Milestone[];
  createProject: (input: NewProjectInput) => string;
  deleteProject: (id: string) => void;
  updateProject: (input: ProjectInput) => void;
  saveTask: (input: TaskInput, id?: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  saveNote: (input: NoteInput, id?: string) => void;
  togglePin: (id: string) => void;
  deleteNote: (id: string) => void;
}

const Ctx = createContext<DataCtx | null>(null);
const nowISO = () => new Date().toISOString();

const emptyProject: Project = {
  id: '', ownerId: '', name: '', description: '', problemStatement: '', purpose: '', mainGoal: '',
  expectedOutcome: '', scope: '', requirements: '', links: '', additionalInformation: '',
  isDemo: false, createdAt: '', updatedAt: '',
};
const noop = () => {};
const placeholder: DataCtx = {
  ready: false, projectFound: false, projects: [], allTasks: [], project: emptyProject, tasks: [], notes: [], milestones: [],
  createProject: () => '', deleteProject: noop, updateProject: noop, saveTask: noop, setTaskStatus: noop,
  deleteTask: noop, saveNote: noop, togglePin: noop, deleteNote: noop,
};

export function DataProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { toast } = useToast();
  const t = useTranslations('common');
  const params = useParams<{ projectId?: string }>();
  const projectId = typeof params.projectId === 'string' ? params.projectId : undefined;

  const [snap, setSnap] = useState<Snapshot | null>(null);
  const adapter = useRef<DataAdapter>(localAdapter);
  const saved = useRef<Snapshot | null>(null);
  const dirty = useRef(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const uid = auth.user?.id ?? null;

  // (Re)load whenever the signed-in user changes. Each user only ever loads their own rows.
  useEffect(() => {
    if (auth.loading) return;
    dirty.current = false;
    saved.current = null;
    setSnap(null);
    if (auth.configured && !uid) return;
    const sb = getSupabase();
    adapter.current = auth.configured && sb && uid ? createSupabaseAdapter(sb, uid) : localAdapter;
    let alive = true;
    adapter.current.load()
      .then((s) => { if (alive) { saved.current = s; setSnap(s); } })
      .catch(() => toast(t('saveError'), 'error'));
    return () => { alive = false; };
  }, [auth.loading, auth.configured, uid, toast, t]);

  // Persist changes one after another so writes never overlap.
  useEffect(() => {
    if (!snap || !dirty.current) return;
    const next = snap;
    const ad = adapter.current;
    queue.current = queue.current
      .then(async () => {
        const prev = saved.current;
        if (!prev || prev === next) return;
        await ad.sync(prev, next);
        saved.current = next;
      })
      .catch(() => toast(t('saveError'), 'error'));
  }, [snap, toast, t]);

  const commit = useCallback((fn: (s: Snapshot) => Snapshot) => {
    dirty.current = true;
    setSnap((prev) => (prev ? fn(prev) : prev));
  }, []);

  const value = useMemo<DataCtx>(() => {
    if (!snap) return placeholder;
    const project = snap.projects.find((p) => p.id === projectId);
    const pid = project?.id;
    const inProject = <T extends { projectId: string }>(list: T[]) => (pid ? list.filter((x) => x.projectId === pid) : []);

    return {
      ready: true,
      projectFound: Boolean(project),
      projects: snap.projects,
      allTasks: snap.tasks,
      project: project ?? emptyProject,
      tasks: inProject(snap.tasks),
      notes: inProject(snap.notes),
      milestones: inProject(snap.milestones),

      createProject: (input) => {
        const id = crypto.randomUUID();
        const ts = nowISO();
        commit((s) => ({
          ...s,
          projects: [...s.projects, { ...emptyProject, id, ownerId: uid ?? 'local', name: input.name, description: input.description, createdAt: ts, updatedAt: ts }],
        }));
        return id;
      },
      deleteProject: (id) =>
        commit((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((x) => x.projectId !== id),
          notes: s.notes.filter((x) => x.projectId !== id),
          milestones: s.milestones.filter((x) => x.projectId !== id),
        })),
      updateProject: (input) => {
        if (!pid) return;
        commit((s) => ({ ...s, projects: s.projects.map((p) => (p.id === pid ? { ...p, ...input, isDemo: false, updatedAt: nowISO() } : p)) }));
      },
      saveTask: (input, id) => {
        if (!pid) return;
        commit((s) => {
          const ts = nowISO();
          if (id) {
            return {
              ...s,
              tasks: s.tasks.map((x) =>
                x.id !== id ? x : { ...x, ...input, updatedAt: ts, completedAt: input.status === 'done' ? x.completedAt ?? ts : null }),
            };
          }
          const task: Task = { id: crypto.randomUUID(), projectId: pid, ...input, createdAt: ts, updatedAt: ts, completedAt: input.status === 'done' ? ts : null };
          return { ...s, tasks: [...s.tasks, task] };
        });
      },
      setTaskStatus: (id, status) =>
        commit((s) => {
          const ts = nowISO();
          return {
            ...s,
            tasks: s.tasks.map((x) =>
              x.id !== id || x.status === status ? x : { ...x, status, updatedAt: ts, completedAt: status === 'done' ? x.completedAt ?? ts : null }),
          };
        }),
      deleteTask: (id) => commit((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
      saveNote: (input, id) => {
        if (!pid) return;
        commit((s) => {
          const ts = nowISO();
          if (id) return { ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, ...input, updatedAt: ts } : n)) };
          const note: Note = { id: crypto.randomUUID(), projectId: pid, ...input, isPinned: false, createdAt: ts, updatedAt: ts };
          return { ...s, notes: [...s.notes, note] };
        });
      },
      togglePin: (id) =>
        commit((s) => ({ ...s, notes: s.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)) })),
      deleteNote: (id) => commit((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
    };
  }, [snap, projectId, uid, commit]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
}
