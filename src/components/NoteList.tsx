import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, Button, Alert } from '@/components/ui';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PostgrestError } from '@supabase/supabase-js';

type MaturityState = 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
type MaturityFilter = MaturityState | 'ALL';
type SortOption = 'recent' | 'title' | 'maturity' | 'manual';

interface Note {
  id: string;
  title: string;
  maturity_state: MaturityState;
  created_at: string;
  content: string;
  is_pinned?: boolean;
  display_order: number;
}

interface MaturityOption {
  value: MaturityFilter;
  label: string;
  icon: string;
  description: string;
}

const MATURITY_OPTIONS: readonly MaturityOption[] = [
  {
    value: 'ALL',
    label: 'All Notes',
    icon: '📚',
    description: 'View your complete collection',
  },
  {
    value: 'SEED',
    label: 'Seeds',
    icon: '🌱',
    description: 'Initial thoughts and ideas',
  },
  {
    value: 'SAPLING',
    label: 'Saplings',
    icon: '🌿',
    description: 'Growing and taking shape',
  },
  {
    value: 'GROWTH',
    label: 'Growth',
    icon: '🌳',
    description: 'Developing connections',
  },
  {
    value: 'MATURE',
    label: 'Mature',
    icon: '📖',
    description: 'Well-developed thoughts',
  },
  {
    value: 'EVOLVING',
    label: 'Evolving',
    icon: '🔄',
    description: 'Continuously updating',
  },
] as const;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'manual', label: 'Manual Order' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'maturity', label: 'By Maturity' },
];

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="h-5 bg-accent-100 rounded-sm w-3/4 mb-1.5"></div>
        <div className="h-12 bg-accent-50 rounded-sm w-full"></div>
      </div>
    ))}
  </div>
);

const NoteItem: React.FC<{
  note: Note;
  isActive?: boolean;
  onTogglePin?: (noteId: string) => void;
  isDragging?: boolean;
}> = ({ note, isActive, onTogglePin, isDragging }) => {
  const truncatedContent =
    note.content.length > 120
      ? note.content.slice(0, 120) + '...'
      : note.content;

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
      <div className="block p-2">
        <div className="flex items-center justify-between">
          <Link
            href={`/notes/${note.id}`}
            className="flex-1 cursor-pointer"
            onClick={e => {
              // Prevent navigation if we're dragging
              if (isDragging) {
                e.preventDefault();
              }
            }}
          >
            <h3 className="font-medium text-sm text-ink-rich dark:text-ink-inverse line-clamp-1">
              {note.title || 'Untitled Note'}
            </h3>
          </Link>
          {onTogglePin && (
            <button
              onClick={e => {
                e.preventDefault();
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
      </div>
    </div>
  );
};

const SortableNote = React.memo(
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
        {...attributes}
        {...listeners}
        className={cn(
          'transition-shadow duration-200',
          isDragging && 'shadow-lg'
        )}
      >
        <NoteItem
          note={note}
          onTogglePin={onTogglePin}
          isDragging={isDragging}
        />
      </div>
    );
  }
);

SortableNote.displayName = 'SortableNote';

export default function NoteList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [selectedMaturity, setSelectedMaturity] =
    useState<MaturityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('manual');
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: 'is_pinned = true OR is_pinned = false', // Only listen for pin changes
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['notes', selectedMaturity],
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, supabase, selectedMaturity]);

  const {
    data: notes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes', selectedMaturity],
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select('*')
        .order('display_order', { ascending: true });

      if (selectedMaturity !== 'ALL') {
        query = query.eq('maturity_state', selectedMaturity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    retry: 2,
  });

  const handleTogglePin = async (noteId: string) => {
    const note = notes?.find(n => n.id === noteId);
    if (!note) return;

    const { error } = await supabase
      .from('notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', noteId);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !notes) return;

    if (active.id !== over.id) {
      const oldIndex = notes.findIndex(note => note.id === active.id);
      const newIndex = notes.findIndex(note => note.id === over.id);

      const newNotes = arrayMove(notes, oldIndex, newIndex);

      // Calculate new display orders with larger gaps
      const updatedNotes = newNotes.map((note, index) => ({
        ...note,
        display_order: (index + 1) * 1000,
      }));

      // Update the cache optimistically
      queryClient.setQueryData(['notes', selectedMaturity], updatedNotes);

      try {
        // Update all notes in a single transaction using individual updates
        const promises = updatedNotes.map(note =>
          supabase
            .from('notes')
            .update({ display_order: note.display_order })
            .eq('id', note.id)
        );

        const results = await Promise.all(promises);
        const errors = results.filter(r => r.error).map(r => r.error);

        if (errors.length > 0) {
          console.error('Some updates failed:', errors);
          // Revert optimistic update on error
          queryClient.setQueryData(['notes', selectedMaturity], notes);
          return;
        }

        // Don't invalidate the query, we've already updated the cache
      } catch (error) {
        console.error('Failed to update note orders:', error);
        // Revert optimistic update on error
        queryClient.setQueryData(['notes', selectedMaturity], notes);
      }
    }
  };

  const filteredNotes = React.useMemo(() => {
    if (!notes) return [];
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'maturity':
        const maturityOrder = [
          'SEED',
          'SAPLING',
          'GROWTH',
          'MATURE',
          'EVOLVING',
        ];
        filtered.sort(
          (a, b) =>
            maturityOrder.indexOf(a.maturity_state) -
            maturityOrder.indexOf(b.maturity_state)
        );
        break;
      case 'manual':
        filtered.sort((a, b) => a.display_order - b.display_order);
        break;
    }

    return filtered;
  }, [notes, searchQuery, sortBy]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <Alert variant="error">Failed to load notes</Alert>;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-200 pl-8 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 hover:bg-accent-50 rounded-md"
        >
          <FunnelIcon className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center space-x-4">
          <Select
            value={selectedMaturity}
            onChange={e =>
              setSelectedMaturity(e.target.value as MaturityFilter)
            }
            className="min-w-[150px]"
          >
            {MATURITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="min-w-[150px]"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredNotes.map(note => note.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <SortableNote
                key={note.id}
                note={note}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
