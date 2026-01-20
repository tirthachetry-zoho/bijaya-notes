import { create } from 'zustand';
import { Note, NoteStore, NoteFormData } from '@/types';
import { generateId } from '@/lib/utils';
import { storage } from '@/lib/storage';

export const useNoteStore = create<NoteStore>()(
  (set, get) => ({
    // Initial state - empty initially, will be loaded on client
    notes: [],
    selectedNoteId: null,
    searchQuery: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',

    // Actions
    createNote: (data: NoteFormData) => {
      const newNote: Note = {
        id: generateId(),
        title: data.title || 'Untitled Note',
        content: data.content || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => {
        const updatedNotes = [newNote, ...state.notes];
        storage.saveNotes(updatedNotes);
        return {
          notes: updatedNotes,
          selectedNoteId: newNote.id,
        };
      });
    },

    updateNote: (id: string, data: Partial<NoteFormData>) => {
      set((state) => {
        const updatedNotes = state.notes.map((note) =>
          note.id === id
            ? {
                ...note,
                ...data,
                updatedAt: new Date(),
              }
            : note
        );
        storage.saveNotes(updatedNotes);
        return { notes: updatedNotes };
      });
    },

    deleteNote: (id: string) => {
      set((state) => {
        const updatedNotes = state.notes.filter((note) => note.id !== id);
        storage.saveNotes(updatedNotes);
        return {
          notes: updatedNotes,
          selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
        };
      });
    },

    selectNote: (id: string | null) => {
      set({ selectedNoteId: id });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => {
      set({ sortBy });
    },

    setSortOrder: (order: 'asc' | 'desc') => {
      set({ sortOrder: order });
    },

    // Initialize notes from storage
    initializeNotes: () => {
      if (typeof window !== 'undefined') {
        const notes = storage.loadNotes();
        set({ notes });
      }
    },
  })
);

// Selectors for computed values
export const useFilteredNotes = () => {
  const notes = useNoteStore((state) => state.notes);
  const searchQuery = useNoteStore((state) => state.searchQuery);
  const sortBy = useNoteStore((state) => state.sortBy);
  const sortOrder = useNoteStore((state) => state.sortOrder);

  return notes
    .filter((note) => {
      const query = searchQuery.toLowerCase();
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Ensure dates are Date objects
      const aDate = new Date(a.updatedAt);
      const bDate = new Date(b.updatedAt);
      const aCreatedDate = new Date(a.createdAt);
      const bCreatedDate = new Date(b.createdAt);
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = aCreatedDate.getTime() - bCreatedDate.getTime();
          break;
        case 'updatedAt':
        default:
          comparison = aDate.getTime() - bDate.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
};

export const useSelectedNote = () => {
  const selectedNoteId = useNoteStore((state) => state.selectedNoteId);
  const notes = useNoteStore((state) => state.notes);
  
  return notes.find((note) => note.id === selectedNoteId) || null;
};
