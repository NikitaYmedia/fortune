import type { SupabaseClient } from '@supabase/supabase-js';
import type { DataAdapter, Snapshot } from '@/lib/data/adapter';
import type { Milestone, MilestoneStatus } from '@/types/milestone';
import type { Note, NoteType } from '@/types/note';
import type { Project } from '@/types/project';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === 'string' ? v : '');
const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

const projectFrom = (r: Row): Project => ({
  id: s(r.id), ownerId: s(r.owner_id), name: s(r.name), description: s(r.description),
  problemStatement: s(r.problem_statement), purpose: s(r.purpose), mainGoal: s(r.main_goal),
  expectedOutcome: s(r.expected_outcome), scope: s(r.scope), requirements: s(r.requirements),
  links: s(r.links), additionalInformation: s(r.additional_information), isDemo: false,
  createdAt: s(r.created_at), updatedAt: s(r.updated_at),
});
const taskFrom = (r: Row): Task => ({
  id: s(r.id), projectId: s(r.project_id), title: s(r.title), description: s(r.description),
  status: s(r.status) as TaskStatus, priority: s(r.priority) as TaskPriority,
  startDate: s(r.start_date), dueDate: s(r.due_date), tags: arr(r.tags),
  createdAt: s(r.created_at), updatedAt: s(r.updated_at), completedAt: s(r.completed_at) || null,
});
const noteFrom = (r: Row): Note => ({
  id: s(r.id), projectId: s(r.project_id), title: s(r.title), content: s(r.content), type: s(r.type) as NoteType,
  tags: arr(r.tags), isPinned: r.is_pinned === true, createdAt: s(r.created_at), updatedAt: s(r.updated_at),
});
const milestoneFrom = (r: Row): Milestone => ({
  id: s(r.id), projectId: s(r.project_id), title: s(r.title), description: s(r.description),
  dueDate: s(r.due_date), status: s(r.status) as MilestoneStatus, createdAt: s(r.created_at), updatedAt: s(r.updated_at),
});

function diff<T extends { id: string }>(prev: T[], next: T[]) {
  const before = new Map(prev.map((x) => [x.id, x]));
  const after = new Set(next.map((x) => x.id));
  return {
    changed: next.filter((x) => before.get(x.id) !== x),
    removed: prev.filter((x) => !after.has(x.id)).map((x) => x.id),
  };
}

export function createSupabaseAdapter(sb: SupabaseClient, uid: string): DataAdapter {
  const check = (error: { message: string } | null) => { if (error) throw new Error(error.message); };
  const read = async (table: string): Promise<Row[]> => {
    const { data, error } = await sb.from(table).select('*').eq('owner_id', uid).order('created_at');
    check(error);
    return (data ?? []) as Row[];
  };

  return {
    async load(): Promise<Snapshot> {
      const [p, t, n, m] = await Promise.all([read('projects'), read('tasks'), read('notes'), read('milestones')]);
      return { projects: p.map(projectFrom), tasks: t.map(taskFrom), notes: n.map(noteFrom), milestones: m.map(milestoneFrom) };
    },

    async sync(prev, next) {
      const P = diff(prev.projects, next.projects);
      const T = diff(prev.tasks, next.tasks);
      const N = diff(prev.notes, next.notes);
      const M = diff(prev.milestones, next.milestones);

      if (P.changed.length) {
        check((await sb.from('projects').upsert(P.changed.map((p) => ({
          id: p.id, owner_id: uid, name: p.name, description: p.description, problem_statement: p.problemStatement,
          purpose: p.purpose, main_goal: p.mainGoal, expected_outcome: p.expectedOutcome, scope: p.scope,
          requirements: p.requirements, links: p.links, additional_information: p.additionalInformation,
          created_at: p.createdAt, updated_at: p.updatedAt,
        })))).error);
      }
      if (T.changed.length) {
        check((await sb.from('tasks').upsert(T.changed.map((x) => ({
          id: x.id, project_id: x.projectId, owner_id: uid, title: x.title, description: x.description,
          status: x.status, priority: x.priority, start_date: x.startDate || null, due_date: x.dueDate || null,
          tags: x.tags, created_at: x.createdAt, updated_at: x.updatedAt, completed_at: x.completedAt,
        })))).error);
      }
      if (N.changed.length) {
        check((await sb.from('notes').upsert(N.changed.map((x) => ({
          id: x.id, project_id: x.projectId, owner_id: uid, title: x.title, content: x.content, type: x.type,
          tags: x.tags, is_pinned: x.isPinned, created_at: x.createdAt, updated_at: x.updatedAt,
        })))).error);
      }
      if (M.changed.length) {
        check((await sb.from('milestones').upsert(M.changed.map((x) => ({
          id: x.id, project_id: x.projectId, owner_id: uid, title: x.title, description: x.description,
          due_date: x.dueDate || null, status: x.status, created_at: x.createdAt, updated_at: x.updatedAt,
        })))).error);
      }
      if (T.removed.length) check((await sb.from('tasks').delete().in('id', T.removed)).error);
      if (N.removed.length) check((await sb.from('notes').delete().in('id', N.removed)).error);
      if (M.removed.length) check((await sb.from('milestones').delete().in('id', M.removed)).error);
      if (P.removed.length) check((await sb.from('projects').delete().in('id', P.removed)).error);
    },
  };
}
