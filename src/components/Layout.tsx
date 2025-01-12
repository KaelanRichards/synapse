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
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = user
    ? [
        { name: 'Home', href: '/', icon: HomeIcon },
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
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30">
        <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              Synapse
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          {navigationItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gray-100 dark:bg-gray-800 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-neutral-900 dark:hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <Button
            onClick={() => signOut()}
            variant="ghost"
            className="w-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 inset-x-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              Synapse
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-neutral-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 active:scale-95"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-16 inset-x-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg">
            <nav className="px-2 py-3">
              <div className="space-y-1">
                {navigationItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gray-100 dark:bg-gray-800 text-neutral-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="mr-4 h-6 w-6 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut();
                  }}
                  variant="ghost"
                  className="w-full mt-2 py-3 text-base hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Sign out
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
