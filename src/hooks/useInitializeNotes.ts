import { useEffect } from 'react';
import { useNoteStore } from '@/store';

export const useInitializeNotes = () => {
  const initializeNotes = useNoteStore((state) => state.initializeNotes);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      initializeNotes();
    }
  }, [initializeNotes]);
};
