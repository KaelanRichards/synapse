import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-neutral-900">
                  Synapse
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/notes"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-900"
                >
                  Notes
                </Link>
                <Link
                  href="/notes/new"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-neutral-900"
                >
                  New Note
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
