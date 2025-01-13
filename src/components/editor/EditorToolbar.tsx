import React from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  SunIcon,
  PencilIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  ViewfinderCircleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import type { SaveStatus, EditorStats } from './types';

export interface EditorToolbarProps {
  stats: EditorStats;
  saveStatus: SaveStatus;
  isLocalFocusMode: boolean;
  isParagraphFocus: boolean;
  isAmbientSound: boolean;
  isTypewriterMode: boolean;
  onToggleFocusMode: () => void;
  onToggleParagraphFocus: () => void;
  onToggleAmbientSound: () => void;
  onToggleTypewriterMode: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  stats,
  saveStatus,
  isParagraphFocus,
  isAmbientSound,
  isTypewriterMode,
  onToggleParagraphFocus,
  onToggleAmbientSound,
  onToggleTypewriterMode,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-2">
      {/* Left side - Writing modes */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 border-r border-neutral-200 dark:border-neutral-800 pr-2">
          <Tooltip content="Paragraph Focus (⌘P)">
            <button
              onClick={onToggleParagraphFocus}
              className={`p-1.5 rounded-md transition-colors ${
                isParagraphFocus
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center space-x-1">
          <Tooltip content="Typewriter Mode (⌘T)">
            <button
              onClick={onToggleTypewriterMode}
              className={`p-1.5 rounded-md transition-colors ${
                isTypewriterMode
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Ambient Sound">
            <button
              onClick={onToggleAmbientSound}
              className={`p-1.5 rounded-md transition-colors ${
                isAmbientSound
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <SpeakerWaveIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Right side - Stats */}
      <div className="flex items-center space-x-3 text-sm text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center space-x-1">
          <DocumentTextIcon className="w-4 h-4" />
          <span>{stats.wordCount} words</span>
          <span className="mx-1">·</span>
          <span>{stats.readingTime} min read</span>
        </div>
        <div className="flex items-center space-x-1 text-xs">
          <span
            className={`
            ${saveStatus === 'saved' ? 'text-green-600 dark:text-green-400' : ''}
            ${saveStatus === 'saving' ? 'text-neutral-400' : ''}
            ${saveStatus === 'error' ? 'text-red-600 dark:text-red-400' : ''}
          `}
          >
            {saveStatus === 'saved'
              ? 'Saved'
              : saveStatus === 'saving'
                ? 'Saving...'
                : 'Error saving'}
          </span>
        </div>
      </div>
    </div>
  );
};
