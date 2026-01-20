import { Note } from '@/types';

const STORAGE_KEY = 'bijaya-notes';

export const storage = {
  // Save all notes to localStorage
  saveNotes: (notes: Note[]): void => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const serializedNotes = JSON.stringify(notes.map(note => ({
        ...note,
        createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
        updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt,
      })));
      localStorage.setItem(STORAGE_KEY, serializedNotes);
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  },

  // Load all notes from localStorage
  loadNotes: (): Note[] => {
    if (typeof window === 'undefined') return []; // Skip on server-side
    
    try {
      const serializedNotes = localStorage.getItem(STORAGE_KEY);
      if (!serializedNotes) return [];
      
      const notes = JSON.parse(serializedNotes);
      return notes.map((note: any) => ({
        ...note,
        createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
        updatedAt: note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      return [];
    }
  },

  // Save app preferences
  savePreferences: (preferences: Record<string, any>): void => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      localStorage.setItem('bijaya-notes-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  },

  // Load app preferences
  loadPreferences: (): Record<string, any> => {
    if (typeof window === 'undefined') return {}; // Skip on server-side
    
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
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('bijaya-notes-preferences');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};
