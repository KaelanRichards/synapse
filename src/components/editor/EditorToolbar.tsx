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

const getStatusVariant = (
  status: SaveStatus
): 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'saved':
      return 'success';
    case 'saving':
      return 'warning';
    case 'unsaved':
      return 'error';
  }
};

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  saveStatus,
  stats,
  isLocalFocusMode,
  isAmbientSound,
  isTypewriterMode,
  onToggleFocusMode,
  onToggleAmbientSound,
  onToggleTypewriterMode,
}) => {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-white/80 dark:bg-black/80 backdrop-blur">
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusVariant(saveStatus)}>
          {saveStatus === 'saved' && <CheckIcon className="w-4 h-4" />}
          {saveStatus === 'saving' && (
            <CloudArrowUpIcon className="w-4 h-4 animate-spin" />
          )}
          {saveStatus === 'unsaved' && (
            <ExclamationCircleIcon className="w-4 h-4" />
          )}
          {saveStatus}
        </Badge>
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
