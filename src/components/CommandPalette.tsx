import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/router';
import { useUIStore } from '@/store/uiStore';
import { useNoteList } from '@/hooks/useNoteList';
import { cn } from '@/lib/utils';
import {
  DocumentIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { notes } = useNoteList();
  const { setTheme, setFontFamily, setFontSize } = useUIStore();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      className={cn(
        'fixed inset-0 z-50 overflow-hidden p-6 pt-[20vh]',
        'bg-surface-pure/80 backdrop-blur-sm dark:bg-surface-dark/80'
      )}
    >
      <div className="relative max-w-2xl mx-auto">
        <Command.Input
          placeholder="Type a command or search..."
          className={cn(
            'w-full px-4 py-3 text-base',
            'bg-surface-pure dark:bg-surface-dark',
            'border border-ink-faint/20 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary',
            'placeholder:text-ink-muted dark:placeholder:text-ink-muted/70'
          )}
        />

        <Command.List className="mt-4 rounded-lg border border-ink-faint/20 bg-surface-pure dark:bg-surface-dark overflow-hidden">
          <Command.Group heading="Theme">
            <Command.Item
              onSelect={() => {
                setTheme('light');
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-surface-faint dark:hover:bg-surface-dim/10 cursor-pointer"
            >
              <SunIcon className="w-4 h-4 mr-2 inline-block" />
              Light Theme
            </Command.Item>
            <Command.Item
              onSelect={() => {
                setTheme('dark');
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-surface-faint dark:hover:bg-surface-dim/10 cursor-pointer"
            >
              <MoonIcon className="w-4 h-4 mr-2 inline-block" />
              Dark Theme
            </Command.Item>
            <Command.Item
              onSelect={() => {
                setTheme('system');
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-surface-faint dark:hover:bg-surface-dim/10 cursor-pointer"
            >
              <ComputerDesktopIcon className="w-4 h-4 mr-2 inline-block" />
              System Theme
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Recent Notes">
            {notes?.slice(0, 5).map(note => (
              <Command.Item
                key={note.id}
                onSelect={() => {
                  router.push(`/notes/${note.id}`);
                  setOpen(false);
                }}
                className="px-4 py-2 hover:bg-surface-faint dark:hover:bg-surface-dim/10 cursor-pointer"
              >
                <DocumentIcon className="w-4 h-4 mr-2 inline-block" />
                {note.title || 'Untitled Note'}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Version History">
            <Command.Item
              onSelect={() => {
                // TODO: Implement version history view
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-surface-faint dark:hover:bg-surface-dim/10 cursor-pointer"
            >
              <ClockIcon className="w-4 h-4 mr-2 inline-block" />
              View Version History
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
