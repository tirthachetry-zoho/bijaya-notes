'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, ArrowLeft, Save } from 'lucide-react';
import { useNoteStore, useSelectedNote } from '@/store';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDate } from '@/lib/utils';

export function NoteEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const selectedNote = useSelectedNote();
  const { updateNote, deleteNote, createNote, selectNote } = useNoteStore();
  const isMobile = !useMediaQuery('(min-width: 768px)');
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-save effect
  useEffect(() => {
    if (!selectedNote) return;

    const hasChanges = title !== selectedNote.title || content !== selectedNote.content;
    
    if (hasChanges) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 1000); // Save after 1 second of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, selectedNote]);

  // Load note data when selection changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setLastSaved(selectedNote.updatedAt);
      
      // Focus title input for new notes
      if (selectedNote.title === '' && selectedNote.content === '' && titleInputRef.current) {
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
      }
    } else {
      setTitle('');
      setContent('');
      setLastSaved(null);
    }
  }, [selectedNote]);

  const handleSave = async () => {
    if (!selectedNote || !title.trim() && !content.trim()) return;

    setIsSaving(true);
    
    try {
      updateNote(selectedNote.id, {
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(selectedNote.id);
    }
  };

  const handleBack = () => {
    selectNote(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  if (!selectedNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Save className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Select a note</h3>
        <p className="text-sm text-muted-foreground">
          Choose a note from the list to start editing
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {isMobile && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-muted rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note title..."
              className="flex-1 text-lg sm:text-xl font-medium bg-transparent border-none outline-none placeholder-muted-foreground touch-manipulation min-h-[44px] py-2"
            />
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {isSaving && (
              <span className="text-xs text-muted-foreground px-2">Saving...</span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-xs text-muted-foreground hidden sm:inline px-2">
                Saved {formatDate(lastSaved)}
              </span>
            )}
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-muted rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] text-destructive hover:text-destructive/90"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your note..."
          className="w-full h-full bg-transparent border-none outline-none resize-none placeholder-muted-foreground text-base leading-relaxed touch-manipulation"
          style={{
            minHeight: '200px',
            fontSize: '16px', // Prevents zoom on iOS
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.6',
            padding: '8px 0', // Better spacing
          }}
        />
      </div>
    </div>
  );
}
