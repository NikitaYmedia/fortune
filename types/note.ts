export type NoteType = 'note' | 'idea';

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
