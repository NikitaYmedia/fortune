export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** yyyy-MM-dd or '' when not set */
  startDate: string;
  /** yyyy-MM-dd or '' when not set */
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
