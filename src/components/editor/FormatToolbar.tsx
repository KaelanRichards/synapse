import React from 'react';
import { cn } from '@/lib/utils';
import type { FormatType } from './types';

interface FormatToolbarProps {
  position: { x: number; y: number };
  onFormat: (type: FormatType) => void;
  className?: string;
}

const formatButtons: Array<{
  type: FormatType;
  label: string;
  shortcut?: string;
}> = [
  { type: 'bold', label: 'B', shortcut: '⌘B' },
  { type: 'italic', label: 'I', shortcut: '⌘I' },
  { type: 'heading', label: 'H', shortcut: '⌘H' },
  { type: 'link', label: '🔗', shortcut: '⌘K' },
  { type: 'code', label: '</>', shortcut: '⌘E' },
  { type: 'quote', label: '"', shortcut: '⌘⇧.' },
];

export const FormatToolbar: React.FC<FormatToolbarProps> = ({
  position,
  onFormat,
  className,
}) => {
  return (
    <div
      className={cn(
        'fixed z-20 flex items-center space-x-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-1',
        className
      )}
      style={{
        top: position.y - 40,
        left: position.x - 100,
      }}
    >
      {formatButtons.map(({ type, label, shortcut }) => (
        <button
          key={type}
          onClick={() => onFormat(type)}
          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 relative group"
          title={shortcut}
        >
          <span className="text-sm font-medium">{label}</span>
          {shortcut && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 text-xs bg-neutral-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
