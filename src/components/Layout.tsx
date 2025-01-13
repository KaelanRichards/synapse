import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import NoteList from '@/components/NoteList';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
      if (window.innerWidth < 640) {
        setIsLeftPanelCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const navigationItems = user
    ? [
        { name: 'Notes', href: '/notes', icon: DocumentTextIcon },
        { name: 'New Note', href: '/notes/new', icon: PlusCircleIcon },
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
      ]
    : [];

  const isActive = (path: string) => router.pathname === path;

  if (!user) {
    return (
      <div className="min-h-screen bg-paper-light dark:bg-paper-dark">
        <nav className="bg-white dark:bg-gray-900 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    Synapse
                  </span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/signin"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link href="/signup">
                  <Button
                    variant="primary"
                    className="text-sm transition-all duration-200 hover:scale-105"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen bg-paper-light dark:bg-paper-dark flex',
        isFocusMode && 'bg-opacity-98'
      )}
    >
      {/* Navigation Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'flex flex-col',
          'w-16',
          'md:relative',
          isFocusMode &&
            'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
        )}
      >
        {/* Navigation Items */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <Link href="/" className="p-2 mb-4">
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              S
            </span>
          </Link>
          {navigationItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-gray-100 dark:bg-gray-800 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-neutral-900 dark:hover:text-white'
                )}
                title={item.name}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>

        {/* Footer Icons */}
        <div className="flex flex-col items-center p-4 space-y-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'text-gray-400 hover:text-neutral-900 dark:hover:text-white',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              isFocusMode && 'text-primary-500 hover:text-primary-600'
            )}
            title={isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isFocusMode ? (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingInIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-gray-400 hover:text-neutral-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            title="Sign out"
          >
            <span className="text-lg">🚪</span>
          </button>
        </div>
      </aside>

      {/* Notes Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-16 z-20 transition-all duration-300 ease-in-out',
          'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800',
          'flex flex-col',
          isLeftPanelCollapsed ? 'w-0' : 'w-64 md:w-72',
          'md:relative md:left-0',
          isFocusMode &&
            'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto',
          !router.pathname.startsWith('/notes') && 'hidden md:flex'
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
            <NoteList />
          </div>
        )}
      </aside>

      {/* Main content area */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out min-h-screen',
          isLeftPanelCollapsed ? 'md:ml-16' : 'md:ml-[352px]',
          isFocusMode && 'md:ml-0'
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300',
            isFocusMode && 'max-w-3xl mx-auto'
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
