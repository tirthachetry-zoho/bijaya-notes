import { Note } from '@/types';

const STORAGE_KEY = 'bijaya-notes';

export const storage = {
  // Save all notes to localStorage
  saveNotes: (notes: Note[]): void => {
    try {
      const serializedNotes = JSON.stringify(notes.map(note => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })));
      localStorage.setItem(STORAGE_KEY, serializedNotes);
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  },

  // Load all notes from localStorage
  loadNotes: (): Note[] => {
    try {
      const serializedNotes = localStorage.getItem(STORAGE_KEY);
      if (!serializedNotes) return [];
      
      const notes = JSON.parse(serializedNotes);
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return [];
    }
  },

  // Save app preferences
  savePreferences: (preferences: Record<string, any>): void => {
    try {
      localStorage.setItem('bijaya-notes-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },

  // Load app preferences
  loadPreferences: (): Record<string, any> => {
    try {
      const serialized = localStorage.getItem('bijaya-notes-preferences');
      return serialized ? JSON.parse(serialized) : {};
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {};
    }
  },

  // Clear all data
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('bijaya-notes-preferences');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};
