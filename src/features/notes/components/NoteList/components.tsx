import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Note } from '../../types/note';
import { cn } from '@/shared/utils/';
import { formatDistanceToNow } from 'date-fns';
import { useNoteMutations } from '../../hooks/useNoteMutations';
import { Button } from '@/shared/components/ui';
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

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

      {/* Action buttons */}
      <div
        className={cn(
          'absolute right-2 top-2 flex items-center gap-1',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isDeleting && 'opacity-100'
        )}
      >
        {isDeleting ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            >
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDeleting(false)}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/notes/${note.id}/edit`)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsDeleting(true)}
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function NoteListSkeleton() {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-4 sm:px-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="mt-2 space-y-2">
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
