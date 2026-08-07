export type Note = {
  id: string;
  userId: string;
  courseId: string | null;
  title: string;
  content: string | null;
  relevantAt: string | null;
  reminderAt: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateNoteRequest = {
  title: string;
  content?: string | null;
  courseId?: string | null;
  relevantAt?: string | null;
  reminderAt?: string | null;
  isPinned?: boolean;
};
export type UpdateNoteRequest = Partial<CreateNoteRequest>;
export type NoteFilters = { courseId?: string; from?: string; to?: string; pinned?: boolean; search?: string };
export type NoteListResponse = { data: { notes: Note[] } };
export type NoteResponse = { data: { note: Note } };
export type DeleteNoteResponse = { data: { message: string } };
