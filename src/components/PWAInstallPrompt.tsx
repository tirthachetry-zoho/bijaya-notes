'use client';

import { Download, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks';

export function PWAInstallPrompt() {
  const { isInstallable, install, dismiss } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await install();
    if (!success) {
      dismiss();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-card-foreground mb-1">
            Install Bijaya Notes
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Install our app for a better experience with offline access and quick launch from your home screen.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors touch-manipulation min-h-[36px]"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md hover:bg-muted/80 transition-colors touch-manipulation min-h-[36px] min-w-[36px]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
