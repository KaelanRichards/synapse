import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth';
import {
  HomeIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  PowerIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { cn } from '@/shared/utils/';
import { SettingsModal } from '@/features/settings/components/SettingsModal';
import { useNotes } from '@/features/notes/hooks/useNotes';
import { NoteList } from '@/features/notes/components';

interface LayoutProps {
  children: React.ReactNode;
}

const authPages = [
  '/signin',
  '/signup',
  '/reset-password',
  '/reset-password/confirm',
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const { notes, isLoading } = useNotes();
  const isAuthPage = authPages.includes(router.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  // Handle Escape key to exit focus mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFocusMode]);

  if (isAuthPage) {
    return (
      <div className="flex h-screen overflow-hidden bg-surface-pure dark:bg-surface-dark">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-pure dark:bg-surface-dark">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={cn(
          'fixed top-4 right-4 z-50 md:hidden',
          'p-2 rounded-md transition-colors duration-200',
          'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
          'hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Navigation Sidebar */}
      <nav
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-30 w-16 shrink-0',
          'transition-transform duration-300',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'flex flex-col items-center py-4 space-y-4',
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0',
          isFocusMode && 'md:w-0 md:opacity-0 md:pointer-events-none'
        )}
      >
        <Link
          href="/"
          className={cn(
            'p-2 rounded-md transition-colors duration-200',
            'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <HomeIcon className="h-6 w-6" />
        </Link>

        <div className="flex-1" />

        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={cn(
            'p-2 rounded-md transition-colors duration-200',
            'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            isFocusMode && 'text-primary-500 hover:text-primary-600'
          )}
        >
          {isFocusMode ? (
            <ArrowsPointingOutIcon className="h-6 w-6" />
          ) : (
            <ArrowsPointingInIcon className="h-6 w-6" />
          )}
        </button>

        <button
          onClick={signOut}
          className={cn(
            'p-2 rounded-md transition-colors duration-200',
            'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <PowerIcon className="h-6 w-6" />
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className={cn(
            'p-2 rounded-md transition-colors duration-200',
            'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>
      </nav>

      {/* Notes Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 z-20 shrink-0',
          'transition-all duration-300 ease-in-out',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'flex flex-col',
          isLeftPanelCollapsed ? 'w-0' : 'w-72',
          'md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-16' : '-translate-x-full',
          isFocusMode && 'md:w-0 md:opacity-0 md:pointer-events-none'
        )}
      >
        {/* Panel Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Notes
          </span>
          <button
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="p-1 rounded-md text-gray-400 hover:text-neutral-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            {isLeftPanelCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Notes List */}
        {!isLeftPanelCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <NoteList notes={notes} isLoading={isLoading} />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Layout;
