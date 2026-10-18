import type { Milestone } from '@/types/milestone';
import type { Note } from '@/types/note';
import type { Project } from '@/types/project';
import type { Task } from '@/types/task';

export interface Snapshot {
  projects: Project[];
  tasks: Task[];
  notes: Note[];
  milestones: Milestone[];
}

/**
 * Storage contract. `sync` receives the last saved snapshot and the new one;
 * unchanged objects keep the same reference, so adapters can diff cheaply.
 */
export interface DataAdapter {
  load(): Promise<Snapshot>;
  sync(prev: Snapshot, next: Snapshot): Promise<void>;
}
