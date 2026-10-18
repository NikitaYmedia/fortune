import { addDays, parseISO, subDays } from 'date-fns';
import type { Task } from '@/types/task';
import { toISODate } from './date';

export function computeStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'done').length;
  // Empty state: 0%, never NaN/Infinity.
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, open: total - completed, progress };
}

export const isOverdue = (t: Task) =>
  t.dueDate !== '' && t.status !== 'done' && t.dueDate < toISODate(new Date());

export const isDueSoon = (t: Task, days = 3) =>
  t.dueDate !== '' && t.status !== 'done' && t.dueDate >= toISODate(new Date()) &&
  t.dueDate <= toISODate(addDays(new Date(), days));

/** Tasks completed per day, derived only from real completedAt timestamps. */
export function completedPerDay(tasks: Task[], days = 7) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const key = toISODate(date);
    const count = tasks.filter((t) => t.completedAt && toISODate(parseISO(t.completedAt)) === key).length;
    return { key, date, count };
  });
}
