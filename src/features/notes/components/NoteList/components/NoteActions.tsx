import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { Note } from '@/features/notes/types/note';

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={onConfirm}
        className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
      >
        <CheckIcon className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <XMarkIcon className="h-4 w-4" />
      </Button>
    </>
  );
}

interface NoteActionsProps {
  note: Note;
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onDeleteClick: () => void;
}

export function NoteActions({
  note,
  isDeleting,
  onDelete,
  onEdit,
  onDeleteClick,
}: NoteActionsProps) {
  return (
    <div
      className={cn(
        'absolute right-2 top-2 flex items-center gap-1',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        isDeleting && 'opacity-100'
      )}
    >
      {isDeleting ? (
        <DeleteConfirmation onConfirm={onDelete} onCancel={onDeleteClick} />
      ) : (
        <>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDeleteClick}
            className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
