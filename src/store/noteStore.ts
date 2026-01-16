import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Note, NoteStore, NoteFormData } from '@/types';
import { generateId } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { googleDriveSync } from '@/lib/googleDriveSync';

// Merge local and remote notes, preferring the most recently updated version
function mergeNotes(localNotes: Note[], remoteNotes: Note[]): Note[] {
  const noteMap = new Map<string, Note>();
  
  // Add all local notes
  localNotes.forEach(note => {
    noteMap.set(note.id, note);
  });
  
  // Merge with remote notes, keeping the most recent version
  remoteNotes.forEach(remoteNote => {
    const localNote = noteMap.get(remoteNote.id);
    if (!localNote || new Date(remoteNote.updatedAt) > new Date(localNote.updatedAt)) {
      noteMap.set(remoteNote.id, remoteNote);
    }
  });
  
  return Array.from(noteMap.values()).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      // Initial state
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
          
          // Auto-sync to Google Drive if signed in
          const syncStatus = googleDriveSync.getStatus();
          if (syncStatus.isSignedIn) {
            googleDriveSync.uploadNotes(updatedNotes).catch(console.error);
          }
          
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
          
          // Auto-sync to Google Drive if signed in
          const syncStatus = googleDriveSync.getStatus();
          if (syncStatus.isSignedIn) {
            googleDriveSync.uploadNotes(updatedNotes).catch(console.error);
          }
          
          return { notes: updatedNotes };
        });
      },

      deleteNote: (id: string) => {
        set((state) => {
          const updatedNotes = state.notes.filter((note) => note.id !== id);
          storage.saveNotes(updatedNotes);
          
          // Auto-sync to Google Drive if signed in
          const syncStatus = googleDriveSync.getStatus();
          if (syncStatus.isSignedIn) {
            googleDriveSync.uploadNotes(updatedNotes).catch(console.error);
          }
          
          return {
            notes: updatedNotes,
            selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
          };
        });
      },

      // Sync actions
      syncNotes: async () => {
        const syncStatus = googleDriveSync.getStatus();
        if (!syncStatus.isSignedIn) return false;
        
        try {
          const remoteNotes = await googleDriveSync.downloadNotes();
          if (remoteNotes) {
            set((state) => {
              const mergedNotes = mergeNotes(state.notes, remoteNotes);
              storage.saveNotes(mergedNotes);
              return { notes: mergedNotes };
            });
          }
          
          // Upload current notes after merge
          const currentState = get();
          return await googleDriveSync.uploadNotes(currentState.notes);
        } catch (error) {
          console.error('Sync failed:', error);
          return false;
        }
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
    }),
    {
      name: 'bijaya-notes-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          storage.saveNotes(state.notes);
        }
      },
    }
  )
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
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
        default:
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
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
