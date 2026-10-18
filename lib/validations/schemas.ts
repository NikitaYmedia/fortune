import { z, type ZodError } from 'zod';

const dateStr = z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'required')]);

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, 'required').max(200, 'tooLong'),
    description: z.string().max(5000, 'tooLong'),
    status: z.enum(['todo', 'in_progress', 'done']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    startDate: dateStr,
    dueDate: dateStr,
    tags: z.array(z.string().trim().min(1).max(30)).max(10, 'tooLong'),
  })
  .refine((v) => !v.startDate || !v.dueDate || v.dueDate >= v.startDate, {
    path: ['dueDate'],
    message: 'dateOrder',
  });
export type TaskInput = z.infer<typeof taskSchema>;

export const noteSchema = z.object({
  title: z.string().trim().min(1, 'required').max(200, 'tooLong'),
  content: z.string().max(20000, 'tooLong'),
  type: z.enum(['note', 'idea']),
  tags: z.array(z.string().trim().min(1).max(30)).max(10, 'tooLong'),
});
export type NoteInput = z.infer<typeof noteSchema>;

const long = z.string().max(5000, 'tooLong');
export const projectSchema = z.object({
  name: z.string().trim().min(1, 'required').max(120, 'tooLong'),
  description: z.string().max(500, 'tooLong'),
  problemStatement: long,
  purpose: long,
  mainGoal: long,
  expectedOutcome: long,
  scope: long,
  requirements: long,
  links: long,
  additionalInformation: long,
});
export type ProjectInput = z.infer<typeof projectSchema>;

/** Maps a Zod error to { field: messageKey } for the form. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export const parseTags = (text: string) =>
  text.split(',').map((s) => s.trim()).filter(Boolean);

export const newProjectSchema = projectSchema.pick({ name: true, description: true });
export type NewProjectInput = z.infer<typeof newProjectSchema>;

export const credentialsSchema = z.object({
  email: z.string().trim().email('email'),
  password: z.string().min(6, 'password'),
});
