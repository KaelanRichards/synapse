import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Select, Button } from '@/components/ui';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Note, MaturityFilter, SortOption } from '@/types/notes';
import { MATURITY_OPTIONS, SORT_OPTIONS } from '@/types/notes';

export const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="h-5 bg-accent-100 rounded-sm w-3/4 mb-1.5"></div>
        <div className="h-12 bg-accent-50 rounded-sm w-full"></div>
      </div>
    ))}
  </div>
);

export const SearchBar = ({
  value,
  onChange,
  onToggleFilters,
}: {
  value: string;
  onChange: (value: string) => void;
  onToggleFilters: () => void;
}) => (
  <div className="flex items-center space-x-2">
    <div className="relative flex-1">
      <MagnifyingGlassIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search notes..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-200 pl-8 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
    <Button
      onClick={onToggleFilters}
      className="p-2 hover:bg-accent-50 rounded-md"
    >
      <FunnelIcon className="h-4 w-4" />
    </Button>
  </div>
);

export const FilterBar = ({
  maturityValue,
  onMaturityChange,
  sortValue,
  onSortChange,
}: {
  maturityValue: MaturityFilter;
  onMaturityChange: (value: MaturityFilter) => void;
  sortValue: SortOption;
  onSortChange: (value: SortOption) => void;
}) => (
  <div className="flex items-center space-x-4">
    <Select
      value={maturityValue}
      onChange={e => onMaturityChange(e.target.value as MaturityFilter)}
      className="min-w-[150px]"
    >
      {MATURITY_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.icon} {option.label}
        </option>
      ))}
    </Select>
    <Select
      value={sortValue}
      onChange={e => onSortChange(e.target.value as SortOption)}
      className="min-w-[150px]"
    >
      {SORT_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </div>
);

export const NoteItem = React.memo(
  ({
    note,
    isActive,
    onTogglePin,
    isDragging,
  }: {
    note: Note;
    isActive?: boolean;
    onTogglePin?: (noteId: string) => void;
    isDragging?: boolean;
  }) => {
    const router = useRouter();
    const truncatedContent =
      note.content.length > 120
        ? note.content.slice(0, 120) + '...'
        : note.content;

    const handleClick = (e: React.MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        return;
      }
      router.push(`/notes/${note.id}`);
    };

    return (
      <div
        className={cn(
          'group relative rounded-lg transition-all duration-200',
          isActive
            ? 'bg-accent-50 dark:bg-accent-900/20'
            : 'hover:bg-accent-50/50 dark:hover:bg-accent-900/10',
          isDragging && 'shadow-lg'
        )}
      >
        <a onClick={handleClick} className="block p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-sm text-ink-rich dark:text-ink-inverse line-clamp-1">
                {note.title || 'Untitled Note'}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {truncatedContent}
              </p>
            </div>
            {onTogglePin && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onTogglePin(note.id);
                }}
                className={cn(
                  'p-1 rounded-md transition-all duration-200',
                  note.is_pinned
                    ? 'text-amber-500'
                    : 'text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100'
                )}
              >
                {note.is_pinned ? (
                  <StarSolid className="h-3.5 w-3.5" />
                ) : (
                  <StarOutline className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        </a>
      </div>
    );
  }
);

NoteItem.displayName = 'NoteItem';

export const SortableNoteItem = React.memo(
  ({
    note,
    onTogglePin,
  }: {
    note: Note;
    onTogglePin?: (noteId: string) => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: note.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'transition-shadow duration-200 relative',
          isDragging && 'shadow-lg'
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 inset-y-0 w-8 cursor-grab active:cursor-grabbing flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <svg
            className="w-4 h-4 text-gray-400"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M4 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8-11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </div>
        <div className="pl-8">
          <NoteItem
            note={note}
            onTogglePin={onTogglePin}
            isDragging={isDragging}
          />
        </div>
      </div>
    );
  }
);

SortableNoteItem.displayName = 'SortableNoteItem';

export const NoteListContent = React.memo(
  ({
    notes,
    sortBy,
    onTogglePin,
    onUpdateDisplayOrder,
  }: {
    notes: Note[];
    sortBy: SortOption;
    onTogglePin: (noteId: string) => void;
    onUpdateDisplayOrder: (oldIndex: number, newIndex: number) => void;
  }) => {
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = notes.findIndex(note => note.id === active.id);
      const newIndex = notes.findIndex(note => note.id === over.id);

      onUpdateDisplayOrder(oldIndex, newIndex);
    };

    if (sortBy === 'manual') {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={notes.map(note => note.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {notes.map(note => (
                <SortableNoteItem
                  key={note.id}
                  note={note}
                  onTogglePin={onTogglePin}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      );
    }

    return (
      <div className="space-y-2">
        {notes.map(note => (
          <NoteItem key={note.id} note={note} onTogglePin={onTogglePin} />
        ))}
      </div>
    );
  }
);

NoteListContent.displayName = 'NoteListContent';
