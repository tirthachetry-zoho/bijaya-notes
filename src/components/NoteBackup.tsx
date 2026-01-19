'use client';

import { useState } from 'react';
import { Download, Upload, FileText, AlertCircle, FolderOpen, HardDrive, Info } from 'lucide-react';
import { useNoteStore } from '@/store';
import { cn } from '@/lib/utils';
import { FileStorage } from '@/lib/fileStorage';

export function NoteBackup() {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const [importMessage, setImportMessage] = useState<string>('');
  const { notes, createNote } = useNoteStore();

  const exportAllNotes = () => {
    FileStorage.exportNotes(notes);
  };

  const exportSingleNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      FileStorage.exportSingleNote(note);
    }
  };

  const importNotes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);
    setImportMessage('');

    try {
      const { notes: importedNotes, metadata } = await FileStorage.importNotes(file);
      
      // Import all notes
      importedNotes.forEach((note) => {
        createNote({
          title: note.title,
          content: note.content,
        });
      });

      setImportStatus('success');
      setImportMessage(`Successfully imported ${importedNotes.length} notes from backup created on ${new Date(metadata.exportedAt).toLocaleDateString()}`);
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportMessage((error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const storageInfo = FileStorage.getStorageInfo();

  return (
    <div className="space-y-6">
      {/* Storage Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Storage Information</h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Notes:</span>
            <span className="ml-2 font-medium">{storageInfo.totalNotes}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Estimated Size:</span>
            <span className="ml-2 font-medium">{storageInfo.estimatedSize}</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Options
        </h4>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportAllNotes}
            disabled={notes.length === 0}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors',
              notes.length === 0 
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <FolderOpen className="w-4 h-4" />
            Export All Notes ({notes.length})
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Download all notes as a complete backup file</p>
        </div>
      </div>

      {/* Import Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import Options
        </h4>
        
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
            {isImporting ? 'Importing...' : 'Import Backup File'}
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Import a complete backup file to restore all notes</p>
        </div>
      </div>

      {/* Status Messages */}
      {importStatus === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-800 dark:text-green-200">
            {importMessage}
          </span>
        </div>
      )}

      {importStatus === 'error' && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-800 dark:text-red-200">
            {importMessage}
          </span>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-medium">How Backup Works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Export creates a complete backup file with all notes</li>
              <li>Import restores all notes from a backup file</li>
              <li>Notes are automatically saved to local storage</li>
              <li>Backup files can be shared between devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
