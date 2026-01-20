export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteFormData {
  title: string;
  content: string;
}

export interface NoteListState {
  notes: Note[];
  selectedNoteId: string | null;
  searchQuery: string;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface NoteActions {
  createNote: (data: NoteFormData) => void;
  updateNote: (id: string, data: Partial<NoteFormData>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  initializeNotes: () => void;
}

export type NoteStore = NoteListState & NoteActions;
