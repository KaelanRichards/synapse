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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Close mobile menu when screen size changes to desktop
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {user && (
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-white border-r border-gray-200 z-30">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-neutral-900">
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
                      ? 'bg-gray-100 text-neutral-900 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-neutral-900 hover:translate-x-1'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="w-full text-sm hover:bg-gray-100 transition-colors duration-200"
            >
              Sign out
            </Button>
          </div>
        </aside>
      )}

      {/* Mobile header */}
      {user && (
        <header className="md:hidden fixed top-0 inset-x-0 bg-white border-b border-gray-200 z-20">
          <div className="flex items-center justify-between h-16 px-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-neutral-900">
                Synapse
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-neutral-900 hover:bg-gray-50 transition-all duration-200 active:scale-95"
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

          {/* Mobile menu */}
          <div
            className={`absolute top-16 inset-x-0 bg-white border-b border-gray-200 shadow-lg transform transition-all duration-200 ${
              isMobileMenuOpen
                ? 'translate-y-0 opacity-100'
                : '-translate-y-2 opacity-0 pointer-events-none'
            }`}
          >
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
                          ? 'bg-gray-100 text-neutral-900 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-neutral-900'
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
                  className="w-full mt-2 py-3 text-base hover:bg-gray-100 transition-colors duration-200"
                >
                  Sign out
                </Button>
              </div>
            </nav>
          </div>
        </header>
      )}

      {/* Main content */}
      <main
        className={`min-h-screen transition-all duration-200 ${
          user ? 'md:pl-64' : ''
        }`}
      >
        {!user && (
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-neutral-900">
                      Synapse
                    </span>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/signin"
                    className="text-sm text-gray-500 hover:text-neutral-900 transition-colors duration-200"
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
        )}
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
            user ? 'pt-20 md:pt-8 pb-8' : 'py-8'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
