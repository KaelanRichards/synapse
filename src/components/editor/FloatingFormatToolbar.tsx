import React from 'react';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
  Link as LinkIcon,
} from 'lucide-react';
import type { Command } from './types';

interface FloatingFormatToolbarProps {
  position: { x: number; y: number };
  commands: Map<string, Command>;
}

export const FloatingFormatToolbar: React.FC<FloatingFormatToolbarProps> = ({
  position,
  commands,
}) => {
  return (
    <div
      className="floating-toolbar absolute z-50 bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-1 flex items-center space-x-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        onClick={() => commands.get('toggle-bold')?.execute()}
      >
        <BoldIcon className="w-4 h-4" />
      </button>
      <button
        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        onClick={() => commands.get('toggle-italic')?.execute()}
      >
        <ItalicIcon className="w-4 h-4" />
      </button>
      <button
        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        onClick={() => commands.get('toggle-code')?.execute()}
      >
        <CodeIcon className="w-4 h-4" />
      </button>
      <button
        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
        onClick={() => commands.get('create-link')?.execute()}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
