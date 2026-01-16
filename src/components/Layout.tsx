'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn(
      'h-screen w-full overflow-hidden bg-background text-foreground',
      className
    )}>
      <div className={cn(
        'flex h-full',
        isTablet ? 'flex-row' : 'flex-col'
      )}>
        {children}
      </div>
    </div>
  );
}

interface SidebarProps {
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ children, className, isOpen, onClose }: SidebarProps) {
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isMobile = !isTablet;

  if (isMobile && isOpen !== undefined) {
    return (
      <>
        {/* Backdrop for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile sidebar */}
        <div className={cn(
          'fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cn(
      'flex-shrink-0 bg-background border-r border-border overflow-hidden',
      isTablet ? 'w-80' : 'w-full',
      className
    )}>
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const isTablet = useMediaQuery('(min-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className={cn(
      'flex-1 overflow-hidden bg-background',
      isDesktop && 'max-w-4xl mx-auto border-x border-border',
      className
    )}>
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
