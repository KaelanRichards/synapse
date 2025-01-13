import React from 'react';
import { useRouter } from 'next/router';
import { useNote } from '@/hooks/useNote';
import { useAuth } from '@/contexts/AuthContext';
import { NextPage } from 'next';

const NoteDetail: NextPage = () => {
  const { session } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { data: note, isLoading, error } = useNote(id as string);

  if (!session) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading note...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error:{' '}
        {error instanceof Error
          ? error.message
          : 'An unexpected error occurred'}
      </div>
    );
  }

  if (!note) {
    return <div className="p-4">Note not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{note.title}</h1>
      <div className="prose dark:prose-invert max-w-none">{note.content}</div>
    </div>
  );
};

export default NoteDetail;
