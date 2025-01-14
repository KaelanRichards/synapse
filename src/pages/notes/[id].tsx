import React from 'react';
import { useRouter } from 'next/router';
import { useNote } from '@/features/notes/hooks/useNote';
import { NextPage } from 'next';
import { NoteEditor } from '@/features/editor/components/NoteEditor';

const NoteDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { note, isLoading, error } = useNote(id as string);

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

  return <NoteEditor noteId={note.id} />;
};

export default NoteDetail;
