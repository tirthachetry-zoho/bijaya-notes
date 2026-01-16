'use client';

import { useState, useEffect } from 'react';
import { Layout, Sidebar, MainContent } from '@/components/Layout';
import { NoteList } from '@/components/NoteList';
import { NoteEditor } from '@/components/NoteEditor';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { useNoteStore, useSelectedNote } from '@/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const selectedNote = useSelectedNote();
  const { selectNote } = useNoteStore();
  const isTablet = useMediaQuery('(min-width: 768px)');

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

      {/* Mobile menu button - only show when no note is selected */}
      {!isTablet && !selectedNote && (
        <div className="fixed bottom-4 left-4 z-40 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-colors touch-manipulation min-h-[44px]"
          >
            ☰ Notes
          </button>
        </div>
      )}
    </Layout>
  );
}
