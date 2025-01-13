import React from 'react';
import { cn } from '@/lib/utils';
import { Command } from './types';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

interface ShortcutCategory {
  name: string;
  commands: Command[];
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  if (!isOpen) return null;

  // Group commands by category
  const categories = commands.reduce<ShortcutCategory[]>((acc, command) => {
    if (!command.shortcut) return acc;

    const category = command.category || 'General';
    const existingCategory = acc.find(c => c.name === category);

    if (existingCategory) {
      existingCategory.commands.push(command);
    } else {
      acc.push({ name: category, commands: [command] });
    }

    return acc;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {categories.map(category => (
            <div key={category.name}>
              <h3 className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.commands.map(command => (
                  <div
                    key={command.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <div>
                      <div className="font-medium">{command.name}</div>
                      {command.description && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {command.description}
                        </div>
                      )}
                    </div>
                    <kbd
                      className={cn(
                        'px-2 py-1 text-sm font-mono rounded',
                        'bg-neutral-100 dark:bg-neutral-700',
                        'border border-neutral-200 dark:border-neutral-600',
                        'shadow-sm'
                      )}
                    >
                      {command.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t dark:border-neutral-700 bg-white dark:bg-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Press{' '}
            <kbd className="px-1 py-0.5 text-xs font-mono rounded bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600">
              ?
            </kbd>{' '}
            to toggle this panel
          </p>
        </div>
      </div>
    </div>
  );
};
