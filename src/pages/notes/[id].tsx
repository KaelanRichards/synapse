import React from 'react';
import { useRouter } from 'next/router';
import NoteEditor from '@/components/NoteEditor';
import { useNote } from '@/hooks/useNote';
import { Alert } from '@/components/ui';

const NotePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: note, isLoading, error } = useNote(id as string);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        className="max-w-3xl mx-auto mt-8 bg-error-50 text-error-700 border border-error-200 rounded-lg p-4"
      >
        <h3 className="font-medium">Error loading note</h3>
        <p>
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
      </Alert>
    );
  }

  if (!note) {
    return (
      <Alert
        variant="error"
        className="max-w-3xl mx-auto mt-8 bg-error-50 text-error-700 border border-error-200 rounded-lg p-4"
      >
        <h3 className="font-medium">Note not found</h3>
        <p>The requested note could not be found.</p>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NoteEditor
        initialNote={{
          id: note.id,
          title: note.title,
          content: note.content,
          maturity_state: note.maturity_state,
        }}
      />
    </div>
  );
};

export default NotePage;
