import { addDays, subDays } from 'date-fns';
import { toISODate } from '@/lib/utils/date';
import type { Snapshot } from './adapter';
import type { Task, TaskPriority, TaskStatus } from '@/types/task';

const PID = 'demo';
const iso = (d: Date) => d.toISOString();

/** Demo content only. Shown with a "demo data" badge until the user edits the project. */
export function createSeed(): Snapshot {
  const now = new Date();
  const task = (
    title: string, status: TaskStatus, priority: TaskPriority,
    dueOffset: number | null, tags: string[], createdDaysAgo: number,
  ): Task => ({
    id: crypto.randomUUID(), projectId: PID, title, description: '', status, priority,
    startDate: '', dueDate: dueOffset === null ? '' : toISODate(addDays(now, dueOffset)), tags,
    createdAt: iso(subDays(now, createdDaysAgo)), updatedAt: iso(subDays(now, Math.max(0, createdDaysAgo - 1))),
    completedAt: status === 'done' ? iso(subDays(now, Math.max(0, createdDaysAgo - 2))) : null,
  });
  const ms = (title: string, off: number, status: 'planned' | 'in_progress' | 'done') => ({
    id: crypto.randomUUID(), projectId: PID, title, description: '', dueDate: toISODate(addDays(now, off)),
    status, createdAt: iso(now), updatedAt: iso(now),
  });
  return {
    projects: [{
      id: PID, ownerId: 'local', name: 'Neemo Project', description: 'Demo project. Edit it on the Project Introduction page.',
      problemStatement: '', purpose: '', mainGoal: '', expectedOutcome: '', scope: '', requirements: '',
      links: '', additionalInformation: '', isDemo: true, createdAt: iso(now), updatedAt: iso(now),
    }],
    tasks: [
      task('Code review of new features', 'done', 'medium', -3, ['code'], 6),
      task('Infrastructure upgrade', 'done', 'high', -5, ['infra'], 7),
      task('Database refactoring', 'in_progress', 'high', 2, ['db'], 4),
      task('Add alerts to track errors', 'in_progress', 'medium', 4, ['platform'], 3),
      task('Install new software versions', 'todo', 'urgent', -1, ['infra'], 5),
      task('Prepare API documentation', 'todo', 'low', 6, ['docs'], 2),
      task('Define sprint tasks', 'done', 'low', null, [], 3),
    ],
    notes: [{
      id: crypto.randomUUID(), projectId: PID, title: 'Welcome', content: 'This is a demo note. Edit or delete it.',
      type: 'note', tags: [], isPinned: true, createdAt: iso(now), updatedAt: iso(now),
    }],
    milestones: [ms('Prototype', -4, 'done'), ms('Beta release', 10, 'in_progress'), ms('Launch', 30, 'planned')],
  };
}
