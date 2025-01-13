import React from 'react';
import { cn } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface SearchReplaceToolbarProps {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  matchCount: number;
  currentMatch: number;
  caseSensitive: boolean;
  useRegex: boolean;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onToggleCaseSensitive: () => void;
  onToggleRegex: () => void;
}

export const SearchReplaceToolbar: React.FC<SearchReplaceToolbarProps> = ({
  isOpen,
  searchTerm,
  replaceTerm,
  matchCount,
  currentMatch,
  caseSensitive,
  useRegex,
  onClose,
  onSearchChange,
  onReplaceChange,
  onFindNext,
  onFindPrevious,
  onReplace,
  onReplaceAll,
  onToggleCaseSensitive,
  onToggleRegex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-20 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-4">
      <div className="flex flex-col space-y-3">
        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search..."
              className={cn(
                'w-full pl-8 pr-20 py-1.5 rounded border',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                'dark:bg-neutral-700 dark:border-neutral-600'
              )}
            />
            {matchCount > 0 && (
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-neutral-500">
                {currentMatch + 1}/{matchCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Replace Input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={replaceTerm}
            onChange={e => onReplaceChange(e.target.value)}
            placeholder="Replace with..."
            className={cn(
              'flex-1 px-3 py-1.5 rounded border',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'dark:bg-neutral-700 dark:border-neutral-600'
            )}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={onFindPrevious}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
              title="Previous match (⇧⌘G)"
            >
              <ChevronUpIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onFindNext}
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
              title="Next match (⌘G)"
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCaseSensitive}
              className={cn(
                'p-1.5 rounded text-sm font-medium',
                caseSensitive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
              title="Match case"
            >
              Aa
            </button>
            <button
              onClick={onToggleRegex}
              className={cn(
                'p-1.5 rounded text-sm font-mono',
                useRegex
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
              )}
              title="Use regular expression"
            >
              .*
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onReplace}
              disabled={matchCount === 0}
              className={cn(
                'px-2 py-1 rounded text-sm font-medium',
                matchCount > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-700'
              )}
            >
              Replace
            </button>
            <button
              onClick={onReplaceAll}
              disabled={matchCount === 0}
              className={cn(
                'px-2 py-1 rounded text-sm font-medium',
                matchCount > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-700'
              )}
            >
              Replace All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
