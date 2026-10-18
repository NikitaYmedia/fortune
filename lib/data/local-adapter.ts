import type { DataAdapter, Snapshot } from './adapter';
import { createSeed } from './seed';

const KEY = 'neemo.data.v2';
const OLD_KEY = 'neemo.data.v1';

export const localAdapter: DataAdapter = {
  async load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as Snapshot;
      // Migrate the single-project format from the first version.
      const old = window.localStorage.getItem(OLD_KEY);
      if (old) {
        const o = JSON.parse(old) as Omit<Snapshot, 'projects'> & { project: Snapshot['projects'][number] };
        return { projects: [o.project], tasks: o.tasks, notes: o.notes, milestones: o.milestones };
      }
    } catch {
      /* corrupted or blocked storage: fall back to demo data */
    }
    return createSeed();
  },
  async sync(_prev, next) {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  },
};
