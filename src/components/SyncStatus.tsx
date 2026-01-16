'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, LogOut, LogIn } from 'lucide-react';
import { googleDriveSync, type SyncStatus } from '@/lib/googleDriveSync';
import { cn } from '@/lib/utils';
import { useNoteStore } from '@/store';

export function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(googleDriveSync.getStatus());
  const [showMenu, setShowMenu] = useState(false);
  const { notes, syncNotes } = useNoteStore();

  useEffect(() => {
    const unsubscribe = googleDriveSync.onStatusChange(setSyncStatus);
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    await googleDriveSync.signIn();
  };

  const handleSignOut = async () => {
    await googleDriveSync.signOut();
  };

  const handleSync = async () => {
    if (!syncStatus.isSignedIn) return;
    
    // Use the store's sync function which handles merge logic
    await syncNotes();
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Sync status button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors touch-manipulation min-h-[44px]',
          syncStatus.isSignedIn 
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
            : 'bg-muted hover:bg-muted/80'
        )}
      >
        {syncStatus.isSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : syncStatus.isSignedIn ? (
          <Cloud className="w-4 h-4" />
        ) : (
          <CloudOff className="w-4 h-4" />
        )}
        <span className="hidden xs:inline sm:inline">
          {syncStatus.isSignedIn ? 'Synced' : 'Offline'}
        </span>
      </button>

      {/* Sync dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h3 className="font-medium text-foreground mb-3">Google Drive Sync</h3>
              
              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                {syncStatus.isSignedIn ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                )}
                <span className="text-sm text-muted-foreground">
                  {syncStatus.isSignedIn ? 'Connected to Google Drive' : 'Not connected'}
                </span>
              </div>

              {/* Last sync time */}
              <div className="text-sm text-muted-foreground mb-4">
                Last sync: {formatLastSync(syncStatus.lastSync)}
              </div>

              {/* Error message */}
              {syncStatus.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
                  <p className="text-sm text-destructive">{syncStatus.error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {!syncStatus.isSignedIn ? (
                  <button
                    onClick={handleSignIn}
                    disabled={syncStatus.isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in with Google
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSync}
                      disabled={syncStatus.isSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50"
                    >
                      <RefreshCw className={cn('w-4 h-4', syncStatus.isSyncing && 'animate-spin')} />
                      {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      disabled={syncStatus.isSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors touch-manipulation min-h-[44px] disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Your notes are stored in Google Drive under "App Data" and are only accessible by this app.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
