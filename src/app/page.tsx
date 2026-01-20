'use client';

import { useState, useEffect } from 'react';
import { Layout, Sidebar, MainContent } from '@/components/Layout';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { useNoteStore, useSelectedNote } from '@/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInitializeNotes } from '@/hooks/useInitializeNotes';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const selectedNote = useSelectedNote();
  const { selectNote } = useNoteStore();
  const isTablet = useMediaQuery('(min-width: 768px)');
  
  // Initialize notes from localStorage on client side
  useInitializeNotes();

  // Close sidebar on mobile when selecting a note
  useEffect(() => {
    if (!isTablet && selectedNote) {
      setIsSidebarOpen(false);
    }
  }, [selectedNote, isTablet]);

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Layout>
      {/* Mobile sidebar overlay */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      >
        <NoteList />
      </Sidebar>

      {/* Main content area */}
      <MainContent>
        <NoteEditor />
      </MainContent>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Mobile floating action button */}
      {!isTablet && (
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 touch-manipulation flex items-center justify-center"
            aria-label={selectedNote ? "Show notes" : "Create note"}
          >
            {selectedNote ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      )}
    </Layout>
  );
}
