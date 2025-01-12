import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/EditorContext';
import { useNoteMutations } from '@/hooks/useNoteMutations';

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentNote?: {
    id?: string;
    title: string;
    content: string;
  };
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onOpenChange,
  currentNote,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const { setMode, toggleAutoSave, state } = useEditor();
  const { updateNote } = useNoteMutations();

  useEffect(() => {
    if (isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = async (action: string) => {
    switch (action) {
      case 'new':
        router.push('/notes/new');
        break;
      case 'all':
        router.push('/notes');
        break;
      case 'graph':
        router.push('/graph');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'save':
        if (currentNote?.id) {
          updateNote.mutate({
            id: currentNote.id,
            content: currentNote.content,
          });
        }
        break;
      case 'autosave':
        toggleAutoSave();
        break;
      case 'focus':
        setMode('focus');
        break;
      case 'fullscreen':
        document.documentElement.requestFullscreen();
        break;
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 bg-ink-rich/10 backdrop-blur-sm',
            'transition-opacity duration-normal ease-gentle'
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed inset-x-0 top-[20vh] mx-auto max-w-xl rounded-lg',
            'bg-surface-pure dark:bg-surface-dark',
            'shadow-command border border-ink-faint/10',
            'transition-all duration-normal ease-gentle'
          )}
        >
          <Dialog.Title asChild>
            <VisuallyHidden>Command Menu</VisuallyHidden>
          </Dialog.Title>
          <Dialog.Description asChild>
            <VisuallyHidden>
              Search and execute commands or navigate to different views
            </VisuallyHidden>
          </Dialog.Description>

          <Command>
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className={cn(
                'w-full p-4 text-lg',
                'bg-transparent border-b border-ink-faint/10',
                'focus:outline-none placeholder:text-ink-faint/50'
              )}
            />
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="p-4 text-center text-ink-faint">
                No results found.
              </Command.Empty>

              {/* Quick Actions */}
              <Command.Group heading="Quick Actions">
                <Command.Item
                  onSelect={() => handleSelect('new')}
                  className="p-2 cursor-pointer hover:bg-ink-faint/5"
                >
                  Create New Note
                </Command.Item>
                {currentNote && (
                  <>
                    <Command.Item
                      onSelect={() => handleSelect('save')}
                      className="p-2 cursor-pointer hover:bg-ink-faint/5"
                    >
                      Save Note (⌘S)
                    </Command.Item>
                    <Command.Item
                      onSelect={() => handleSelect('autosave')}
                      className="p-2 cursor-pointer hover:bg-ink-faint/5"
                    >
                      {state.autoSave ? 'Disable' : 'Enable'} Auto-Save
                    </Command.Item>
                  </>
                )}
              </Command.Group>

              {/* Navigation */}
              <Command.Group heading="Navigation">
                <Command.Item
                  onSelect={() => handleSelect('all')}
                  className="p-2 cursor-pointer hover:bg-ink-faint/5"
                >
                  All Notes
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSelect('graph')}
                  className="p-2 cursor-pointer hover:bg-ink-faint/5"
                >
                  Knowledge Graph
                </Command.Item>
              </Command.Group>

              {/* View Options */}
              <Command.Group heading="View">
                <Command.Item
                  onSelect={() => handleSelect('focus')}
                  className="p-2 cursor-pointer hover:bg-ink-faint/5"
                >
                  Toggle Focus Mode
                </Command.Item>
                <Command.Item
                  onSelect={() => handleSelect('fullscreen')}
                  className="p-2 cursor-pointer hover:bg-ink-faint/5"
                >
                  Toggle Fullscreen
                </Command.Item>
              </Command.Group>

              {/* Recent Notes */}
              {recentNotes.length > 0 && (
                <Command.Group heading="Recent Notes">
                  {recentNotes.map(note => (
                    <Command.Item
                      key={note.id}
                      onSelect={() => router.push(`/notes/${note.id}`)}
                      className="p-2 cursor-pointer hover:bg-ink-faint/5"
                    >
                      {note.title || 'Untitled Note'}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>

          <Dialog.Close asChild>
            <button
              className={cn(
                'absolute top-3 right-3 p-2 rounded-lg',
                'text-ink-faint hover:text-ink-rich',
                'transition-colors duration-normal'
              )}
            >
              <VisuallyHidden>Close</VisuallyHidden>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CommandPalette;
