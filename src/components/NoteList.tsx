'use client';

import { useState } from 'react';
import { Search, Plus, SortAsc, SortDesc, Calendar, Type } from 'lucide-react';
import { useNoteStore, useFilteredNotes } from '@/store';
import { formatDate, truncateText } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';

export function NoteList() {
  const [isCreating, setIsCreating] = useState(false);
  const notes = useFilteredNotes();
  const {
    selectedNoteId,
    searchQuery,
    sortBy,
    sortOrder,
    createNote,
    selectNote,
    setSearchQuery,
    setSortBy,
    setSortOrder,
  } = useNoteStore();

  const handleCreateNote = () => {
    createNote({ title: '', content: '' });
    setIsCreating(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'title':
        return 'Title';
      case 'createdAt':
        return 'Created';
      case 'updatedAt':
      default:
        return 'Modified';
    }
  };

  const cycleSortBy = () => {
    const options: Array<'updatedAt' | 'createdAt' | 'title'> = ['updatedAt', 'createdAt', 'title'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Bijaya Notes</h1>
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-manipulation min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent touch-manipulation min-h-[44px]"
          />
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleSortBy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors touch-manipulation min-h-[44px]"
          >
            {sortBy === 'title' && <Type className="w-4 h-4" />}
            {(sortBy === 'createdAt' || sortBy === 'updatedAt') && <Calendar className="w-4 h-4" />}
            <span>{getSortLabel()}</span>
          </button>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors touch-manipulation min-h-[44px]"
          >
            {getSortIcon()}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first note to get started'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-manipulation min-h-[44px]"
              >
                Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => selectNote(note.id)}
                className={cn(
                  'w-full text-left p-4 hover:bg-muted/50 transition-colors touch-manipulation min-h-[44px]',
                  selectedNoteId === note.id && 'bg-muted border-l-4 border-primary'
                )}
              >
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium text-foreground truncate">
                    {note.title || 'Untitled Note'}
                  </h3>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {truncateText(note.content, 100)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
