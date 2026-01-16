import { gapi } from 'gapi-script';
import { Note } from '@/types';

declare global {
  interface Window {
    gapi: any;
  }
}

export interface SyncStatus {
  isSignedIn: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
}

export interface SyncConfig {
  clientId: string;
  apiKey: string;
  discoveryDocs: string[];
  scope: string;
}

class GoogleDriveSync {
  private config: SyncConfig;
  private status: SyncStatus = {
    isSignedIn: false,
    isSyncing: false,
    lastSync: null,
    error: null,
  };
  private listeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scope: 'https://www.googleapis.com/auth/drive.file',
    };
  }

  // Initialize Google APIs
  async initialize(): Promise<void> {
    try {
      // Check if credentials are provided
      if (!this.config.clientId || !this.config.apiKey) {
        console.warn('Google Drive credentials not provided. Sync functionality will be disabled.');
        this.status.error = 'Google Drive credentials not configured';
        this.notifyListeners();
        return;
      }

      await this.loadGapi();
      await this.loadGapiAuth();
      await this.initializeGapiClient();
      await this.updateSigninStatus();
    } catch (error) {
      console.error('Failed to initialize Google Drive sync:', error);
      this.status.error = 'Failed to initialize Google Drive sync';
      this.notifyListeners();
    }
  }

  private async loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  private async loadGapiAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', resolve);
    });
  }

  private async initializeGapiClient(): Promise<void> {
    await window.gapi.client.init({
      apiKey: this.config.apiKey,
      clientId: this.config.clientId,
      discoveryDocs: this.config.discoveryDocs,
      scope: this.config.scope,
    });
  }

  private async updateSigninStatus(): Promise<void> {
    try {
      const authInstance = window.gapi?.auth2?.getAuthInstance();
      if (!authInstance) {
        this.status.isSignedIn = false;
        this.notifyListeners();
        return;
      }
      
      const isSignedIn = authInstance.isSignedIn.get();
      this.status.isSignedIn = isSignedIn;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update sign-in status:', error);
      this.status.isSignedIn = false;
      this.status.error = 'Failed to check authentication status';
      this.notifyListeners();
    }
  }

  // Sign in to Google
  async signIn(): Promise<void> {
    try {
      this.status.isSyncing = true;
      this.status.error = null;
      this.notifyListeners();

      const authInstance = window.gapi?.auth2?.getAuthInstance();
      if (!authInstance) {
        throw new Error('Google API not initialized');
      }
      
      await authInstance.signIn();
      await this.updateSigninStatus();
    } catch (error) {
      console.error('Sign in failed:', error);
      this.status.error = 'Failed to sign in to Google';
      this.notifyListeners();
    } finally {
      this.status.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Sign out from Google
  async signOut(): Promise<void> {
    try {
      const authInstance = window.gapi?.auth2?.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
      await this.updateSigninStatus();
      this.status.lastSync = null;
    } catch (error) {
      console.error('Sign out failed:', error);
      this.status.error = 'Failed to sign out';
      this.notifyListeners();
    }
  }

  // Get or create the notes file in Google Drive
  private async getNotesFile(): Promise<string | null> {
    try {
      // Search for existing notes file
      const response = await window.gapi.client.drive.files.list({
        q: "name='bijaya-notes.json' and trashed=false",
        fields: 'files(id, name)',
      });

      if (response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Create new file if not found
      const createResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: 'bijaya-notes.json',
          parents: ['appDataFolder'], // Store in app-specific folder
        },
        fields: 'id',
      });

      return createResponse.result.id;
    } catch (error) {
      console.error('Failed to get/create notes file:', error);
      return null;
    }
  }

  // Upload notes to Google Drive
  async uploadNotes(notes: Note[]): Promise<boolean> {
    if (!this.status.isSignedIn) {
      this.status.error = 'Not signed in to Google';
      this.notifyListeners();
      return false;
    }

    try {
      this.status.isSyncing = true;
      this.status.error = null;
      this.notifyListeners();

      const fileId = await this.getNotesFile();
      if (!fileId) {
        throw new Error('Failed to get notes file');
      }

      const data = JSON.stringify({
        notes,
        lastModified: new Date().toISOString(),
        version: '1.0',
      });

      await window.gapi.client.request({
        path: `/upload/drive/v3/files/${fileId}`,
        method: 'PATCH',
        params: {
          uploadType: 'media',
        },
        body: data,
      });

      this.status.lastSync = new Date();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to upload notes:', error);
      this.status.error = 'Failed to sync to Google Drive';
      this.notifyListeners();
      return false;
    } finally {
      this.status.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Download notes from Google Drive
  async downloadNotes(): Promise<Note[] | null> {
    if (!this.status.isSignedIn) {
      this.status.error = 'Not signed in to Google';
      this.notifyListeners();
      return null;
    }

    try {
      this.status.isSyncing = true;
      this.status.error = null;
      this.notifyListeners();

      const fileId = await this.getNotesFile();
      if (!fileId) {
        return []; // No file exists yet
      }

      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      const data = JSON.parse(response.result);
      this.status.lastSync = new Date();
      this.notifyListeners();
      
      return data.notes || [];
    } catch (error) {
      console.error('Failed to download notes:', error);
      this.status.error = 'Failed to download from Google Drive';
      this.notifyListeners();
      return null;
    } finally {
      this.status.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Get current sync status
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  // Subscribe to status changes
  onStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.status }));
  }
}

export const googleDriveSync = new GoogleDriveSync();
