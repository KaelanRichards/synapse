import React from 'react';
import { Badge } from '@/components/ui';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CheckIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  BoltIcon,
  BoltSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { EditorStats, FormatType, SaveStatus } from '@/components/editor/types';

interface EditorToolbarProps {
  saveStatus: SaveStatus;
  stats: EditorStats;
  isLocalFocusMode: boolean;
  isAmbientSound: boolean;
  isTypewriterMode: boolean;
  showFormatting?: boolean;
  formatPosition?: { x: number; y: number };
  autosaveState?: {
    saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
    errorMessage?: string;
    lastSaveTime?: number;
  };
  onToggleFocusMode: () => void;
  onToggleAmbientSound: () => void;
  onToggleTypewriterMode: () => void;
  onFormat?: (type: FormatType) => void;
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

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return 'Just started';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
};

const formatLastSaved = (timestamp?: number): string => {
  if (!timestamp) return '';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1m ago';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1h ago';
  return `${hours}h ago`;
};

const getStatusVariant = (
  status: SaveStatus | 'error'
): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'saved':
      return 'success';
    case 'saving':
      return 'warning';
    case 'unsaved':
    case 'error':
      return 'error';
  }
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  saveStatus,
  stats,
  isLocalFocusMode,
  isAmbientSound,
  isTypewriterMode,
  showFormatting,
  formatPosition,
  autosaveState,
  onToggleFocusMode,
  onToggleAmbientSound,
  onToggleTypewriterMode,
  onFormat,
}) => {
  const status = autosaveState?.saveStatus || saveStatus;
  const lastSaved = autosaveState?.lastSaveTime
    ? formatLastSaved(autosaveState.lastSaveTime)
    : '';

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-white/80 dark:bg-black/80 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(status)}>
            {status === 'saved' && <CheckIcon className="w-4 h-4" />}
            {status === 'saving' && (
              <CloudArrowUpIcon className="w-4 h-4 animate-spin" />
            )}
            {(status === 'unsaved' || status === 'error') && (
              <ExclamationCircleIcon className="w-4 h-4" />
            )}
            {status}
            {lastSaved && status === 'saved' && ` • ${lastSaved}`}
          </Badge>
          {autosaveState?.errorMessage && (
            <Badge variant="error" className="animate-pulse">
              {autosaveState.errorMessage}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleFocusMode}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title={isLocalFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isLocalFocusMode ? (
              <ArrowsPointingOutIcon className="w-5 h-5" />
            ) : (
              <ArrowsPointingInIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={onToggleAmbientSound}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title={
              isAmbientSound ? 'Disable Ambient Sound' : 'Enable Ambient Sound'
            }
          >
            {isAmbientSound ? (
              <SpeakerWaveIcon className="w-5 h-5" />
            ) : (
              <SpeakerXMarkIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={onToggleTypewriterMode}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title={
              isTypewriterMode
                ? 'Disable Typewriter Mode'
                : 'Enable Typewriter Mode'
            }
          >
            {isTypewriterMode ? (
              <BoltIcon className="w-5 h-5" />
            ) : (
              <BoltSlashIcon className="w-5 h-5" />
            )}
          </button>

          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

          <div className="flex items-center space-x-4 text-sm text-neutral-500">
            <span title="Time spent writing">
              ⏱ {formatTime(stats.timeSpent)}
            </span>
            <span title="Word count">📝 {stats.wordCount} words</span>
            <span title="Reading time">📚 {stats.readingTime} min read</span>
          </div>
        </div>
      </div>

      {/* Floating Format Toolbar */}
      {showFormatting && formatPosition && onFormat && (
        <div
          className={cn(
            'fixed z-20 flex items-center space-x-1 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-1'
          )}
          style={{
            top: formatPosition.y - 40,
            left: formatPosition.x - 100,
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
      )}
    </>
  );
};
