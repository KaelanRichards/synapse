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
import { EditorStats } from '@/components/editor/types';
import { SaveStatus } from '@/components/editor/types';

interface EditorToolbarProps {
  saveStatus: SaveStatus;
  stats: EditorStats;
  isLocalFocusMode: boolean;
  isAmbientSound: boolean;
  isTypewriterMode: boolean;
  autosaveState?: {
    saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
    errorMessage?: string;
    lastSaveTime?: number;
  };
  onToggleFocusMode: () => void;
  onToggleAmbientSound: () => void;
  onToggleTypewriterMode: () => void;
}

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
  autosaveState,
  onToggleFocusMode,
  onToggleAmbientSound,
  onToggleTypewriterMode,
}) => {
  const status = autosaveState?.saveStatus || saveStatus;
  const lastSaved = autosaveState?.lastSaveTime
    ? formatLastSaved(autosaveState.lastSaveTime)
    : '';

  return (
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
        <Badge variant="secondary">{stats.wordCount} words</Badge>
        <Badge variant="secondary">{formatTime(stats.timeSpent)}</Badge>
        <Badge variant="secondary">~{stats.readingTime} min read</Badge>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleFocusMode}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {isLocalFocusMode ? (
            <ArrowsPointingOutIcon className="w-5 h-5" />
          ) : (
            <ArrowsPointingInIcon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onToggleAmbientSound}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {isAmbientSound ? (
            <SpeakerWaveIcon className="w-5 h-5" />
          ) : (
            <SpeakerXMarkIcon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onToggleTypewriterMode}
          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {isTypewriterMode ? (
            <BoltIcon className="w-5 h-5" />
          ) : (
            <BoltSlashIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
