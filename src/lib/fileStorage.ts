import { Note } from '@/types';

export interface FileSystemNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderStructure {
  notes: FileSystemNote[];
  metadata: {
    exportedAt: string;
    version: string;
    totalNotes: number;
  };
}

export class FileStorage {
  private static readonly STORAGE_KEY = 'bijaya-notes-backup';
  private static readonly VERSION = '1.0.0';

  // Export all notes to a downloadable folder structure
  static exportNotes(notes: Note[]): void {
    const fileSystemNotes: FileSystemNote[] = notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));

    const folderStructure: FolderStructure = {
      notes: fileSystemNotes,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: this.VERSION,
        totalNotes: notes.length,
      },
    };

    // Create the main JSON file
    const dataStr = JSON.stringify(folderStructure, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `bijaya-notes-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }

  // Import notes from a folder structure file
  static async importNotes(file: File): Promise<{
    notes: FileSystemNote[];
    metadata: FolderStructure['metadata'];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const folderStructure: FolderStructure = JSON.parse(content);
          
          // Validate the structure
          if (!folderStructure.notes || !Array.isArray(folderStructure.notes)) {
            throw new Error('Invalid backup file format: missing notes array');
          }
          
          if (!folderStructure.metadata) {
            throw new Error('Invalid backup file format: missing metadata');
          }
          
          // Validate each note
          const validNotes = folderStructure.notes.filter(note => 
            note.id && note.title && note.content
          );
          
          resolve({
            notes: validNotes,
            metadata: folderStructure.metadata,
          });
        } catch (error) {
          reject(new Error('Failed to parse backup file: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Export individual note as separate file
  static exportSingleNote(note: Note): void {
    const fileSystemNote: FileSystemNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    };

    const dataStr = JSON.stringify(fileSystemNote, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    // Sanitize filename
    const safeTitle = note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const exportFileName = `note-${safeTitle}-${note.id.slice(0, 8)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }

  // Get storage usage information
  static getStorageInfo(): {
    totalNotes: number;
    estimatedSize: string;
    lastBackup?: string;
  } {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return { totalNotes: 0, estimatedSize: '0 KB' };
    }

    try {
      const data = JSON.parse(stored);
      const size = new Blob([stored]).size;
      const sizeKB = (size / 1024).toFixed(2);
      
      return {
        totalNotes: data.notes?.length || 0,
        estimatedSize: `${sizeKB} KB`,
        lastBackup: data.metadata?.exportedAt,
      };
    } catch {
      return { totalNotes: 0, estimatedSize: '0 KB' };
    }
  }
}
