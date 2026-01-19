'use client';

import { NoteBackup } from '@/components/NoteBackup';
import { ArrowLeft, Download, Upload, Shield, Info } from 'lucide-react';
import Link from 'next/link';

export default function BackupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notes
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Backup & Restore</h1>
              <p className="text-muted-foreground">Manage your notes with secure backup and restore options</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">How to Use Backup & Restore</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Notes
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Click "Export All Notes" to download a complete backup</li>
                    <li>Save the backup file to your computer or cloud storage</li>
                    <li>Keep backup files in a safe location for future use</li>
                    <li>Export regularly to keep your backups up to date</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Notes
                  </h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>Click "Import Backup File" to restore notes</li>
                    <li>Select a previously exported backup file</li>
                    <li>All notes from the backup will be added to your existing notes</li>
                    <li>Import works across devices and browsers</li>
                  </ol>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Important:</strong> Notes are automatically saved to your browser's local storage. 
                  Backup files provide additional security and allow you to transfer notes between devices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Component */}
        <NoteBackup />
      </div>
    </div>
  );
}
