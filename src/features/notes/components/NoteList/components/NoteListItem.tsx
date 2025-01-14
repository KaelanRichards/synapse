import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '@/features/notes/types/note';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import { cn } from '@/shared/utils';
import { NoteActions } from './NoteActions';

interface NoteListItemProps {
  note: Note;
}

export function NoteListItem({ note }: NoteListItemProps) {
  const router = useRouter();
  const { deleteNote } = useNoteMutations();
  const [isDeleting, setIsDeleting] = useState(false);
  const isActive = router.query.id === note.id;

  const handleDelete = async () => {
    try {
      await deleteNote(note.id);
      if (isActive) {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div
      className={cn(
        'group relative hover:bg-gray-50 dark:hover:bg-gray-800/50',
        isActive && 'bg-gray-50 dark:bg-gray-800/50'
      )}
    >
      <Link
        href={`/notes/${note.id}`}
        className="block px-4 py-4 sm:px-6"
        onClick={e => {
          if (isDeleting) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <p
            className={cn(
              'truncate text-sm font-medium text-gray-900 dark:text-gray-100',
              !note.title && 'text-gray-500 dark:text-gray-400 italic'
            )}
          >
            {note.title || 'Untitled Note'}
          </p>
          <div className="ml-2 flex shrink-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(note.updated_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {note.content?.text || 'No content'}
          </p>
        </div>
      </Link>

      <NoteActions
        note={note}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        onEdit={() => router.push(`/notes/${note.id}/edit`)}
        onDeleteClick={() => setIsDeleting(!isDeleting)}
      />
    </div>
  );
}
