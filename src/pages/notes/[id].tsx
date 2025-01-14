import React from 'react';
import { useRouter } from 'next/router';
import { useNote } from '@/hooks/useNote';
import { NextPage } from 'next';
import { NoteEditor } from '@/components/editor/NoteEditor';

const NoteDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: note, isLoading, error } = useNote(id as string);

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

  const editorNote = {
    id: note.id,
    content: {
      text: note.content.text || '',
      editorState: note.content.editorState,
    },
    is_pinned: note.is_pinned,
    display_order: note.display_order,
  };

  return <NoteEditor initialNote={editorNote} />;
};

export default NoteDetail;
