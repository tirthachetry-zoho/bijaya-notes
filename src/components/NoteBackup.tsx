'use client';

import { useState } from 'react';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { useNoteStore } from '@/store';
import { cn } from '@/lib/utils';

export function NoteBackup() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const { notes, createNote } = useNoteStore();

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `bijaya-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedNotes = JSON.parse(content);
        
        // Validate the imported data
        if (!Array.isArray(importedNotes)) {
          throw new Error('Invalid backup file format');
        }

        // Import notes
        importedNotes.forEach((note: any) => {
          if (note.title && note.content) {
            createNote({
              title: note.title,
              content: note.content,
            });
          }
        });

        setImportStatus('success');
      } catch (error) {
        console.error('Import error:', error);
        setImportStatus('error');
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={exportNotes}
          disabled={notes.length === 0}
          className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors',
            notes.length === 0 
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <Download className="w-4 h-4" />
          Export Notes ({notes.length})
        </button>

        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={importNotes}
            disabled={isImporting}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <button
            disabled={isImporting}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors w-full',
              isImporting 
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importing...' : 'Import Notes'}
          </button>
        </div>
      </div>

      {importStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-800 dark:text-green-200">
            Notes imported successfully!
          </span>
        </div>
      )}

      {importStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-800 dark:text-red-200">
            Failed to import notes. Please check the file format.
          </span>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Export notes as JSON backup file
        </p>
        <p>Import backup files to restore notes on any device</p>
      </div>
    </div>
  );
}
