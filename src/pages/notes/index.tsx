import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import NoteList from '@/components/NoteList';
import { useAuth } from '@/contexts/AuthContext';

const NotesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Notes</h1>
      <NoteList />
    </div>
  );
};

export default NotesPage;
