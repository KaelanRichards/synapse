import React from 'react';

export interface SearchReplaceToolbarProps {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  matchCount: number;
  currentMatch: number;
  caseSensitive: boolean;
  useRegex: boolean;
  onClose: () => void;
  onSearchChange: (term: string) => void;
  onReplaceChange: (term: string) => void;
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
    <div className="border-b p-2 bg-white">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="px-2 py-1 border rounded"
          />
          <input
            type="text"
            value={replaceTerm}
            onChange={e => onReplaceChange(e.target.value)}
            placeholder="Replace with..."
            className="px-2 py-1 border rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onFindPrevious}
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            Previous
          </button>
          <button
            onClick={onFindNext}
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            Next
          </button>
          <span className="text-sm text-gray-500">
            {matchCount > 0
              ? `${currentMatch + 1} of ${matchCount}`
              : 'No matches'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onReplace}
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            Replace
          </button>
          <button
            onClick={onReplaceAll}
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            Replace All
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleCaseSensitive}
            className={`px-2 py-1 rounded ${
              caseSensitive ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            Aa
          </button>
          <button
            onClick={onToggleRegex}
            className={`px-2 py-1 rounded ${
              useRegex ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            .*
          </button>
        </div>
        <button
          onClick={onClose}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
};
