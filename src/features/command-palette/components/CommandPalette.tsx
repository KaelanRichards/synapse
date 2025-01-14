import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Command } from 'cmdk';
import { useNoteList } from '@/features/notes/hooks/useNoteList';
import { useNoteMutations } from '@/features/notes/hooks/useNoteMutations';
import { cn } from '@/shared/utils/';
import { createEditor } from 'lexical';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { notes } = useNoteList();
  const { createNote } = useNoteMutations();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleCreateNote = async () => {
    try {
      const note = await createNote({
        title: '',
        content: {
          text: '',
          editorState: {
            type: 'lexical',
            content: createEditor().getEditorState().toJSON(),
          },
        },
        is_pinned: false,
      });
      router.push(`/notes/${note.id}/edit`);
      setOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Menu"
      className={cn(
        'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl',
        'rounded-xl border border-gray-200 bg-white shadow-2xl',
        'dark:border-gray-800 dark:bg-gray-900'
      )}
    >
      <Command.Input
        placeholder="Search notes or type a command..."
        className={cn(
          'w-full border-0 border-b border-gray-200 bg-transparent p-4',
          'text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0',
          'dark:border-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500'
        )}
      />

      <Command.List className="max-h-[300px] overflow-y-auto p-2">
        <Command.Empty className="p-2 text-sm text-gray-500 dark:text-gray-400">
          No results found.
        </Command.Empty>

        <Command.Group heading="Actions">
          <Command.Item
            onSelect={handleCreateNote}
            className={cn(
              'flex cursor-pointer items-center rounded-md px-2 py-1.5',
              'text-sm text-gray-900 aria-selected:bg-gray-100',
              'dark:text-gray-100 dark:aria-selected:bg-gray-800'
            )}
          >
            Create new note
          </Command.Item>
        </Command.Group>

        {notes.length > 0 && (
          <Command.Group heading="Notes">
            {notes.map(note => (
              <Command.Item
                key={note.id}
                onSelect={() => {
                  router.push(`/notes/${note.id}`);
                  setOpen(false);
                }}
                className={cn(
                  'flex cursor-pointer items-center rounded-md px-2 py-1.5',
                  'text-sm text-gray-900 aria-selected:bg-gray-100',
                  'dark:text-gray-100 dark:aria-selected:bg-gray-800'
                )}
              >
                {note.title || 'Untitled Note'}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
