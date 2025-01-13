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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  dragHandleProps?: any;
}> = ({ note, isActive, onTogglePin, isDragging, dragHandleProps }) => {
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
      {...dragHandleProps}
    >
      <Link href={`/notes/${note.id}`} className="block p-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-ink-rich dark:text-ink-inverse line-clamp-1">
            {note.title || 'Untitled Note'}
          </h3>
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
      </Link>
    </div>
  );
};

export default function NoteList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [selectedMaturity, setSelectedMaturity] =
    useState<MaturityFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('manual');
  const [showFilters, setShowFilters] = useState(false);

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
    refetchOnWindowFocus: true,
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !notes) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Update the local state optimistically
    const newNotes = Array.from(notes);
    const [removed] = newNotes.splice(sourceIndex, 1);
    newNotes.splice(destinationIndex, 0, removed);

    // Calculate new display orders
    const updatedNotes = newNotes.map((note, index) => ({
      ...note,
      display_order: index + 1,
    }));

    // Update the cache optimistically
    queryClient.setQueryData(['notes', selectedMaturity], updatedNotes);

    // Update the database
    const updates = updatedNotes.map(note => ({
      id: note.id,
      display_order: note.display_order,
    }));

    for (const update of updates) {
      await supabase
        .from('notes')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }
  };

  const filteredNotes = React.useMemo(() => {
    if (!notes) return { pinnedNotes: [], unpinnedNotes: [] };

    let filtered = notes;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'maturity') {
        const maturityOrder = MATURITY_OPTIONS.map(opt => opt.value);
        return (
          maturityOrder.indexOf(a.maturity_state) -
          maturityOrder.indexOf(b.maturity_state)
        );
      }
      if (sortBy === 'recent') {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      // Default to manual order
      return a.display_order - b.display_order;
    });

    return {
      pinnedNotes: filtered.filter(note => note.is_pinned),
      unpinnedNotes: filtered.filter(note => !note.is_pinned),
    };
  }, [notes, searchQuery, sortBy]);

  if (isLoading) return <LoadingSkeleton />;
  if (error)
    return <Alert variant="error">{(error as PostgrestError).message}</Alert>;

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {filteredNotes.pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-xs font-medium text-gray-500 mb-2">PINNED</h2>
              <Droppable droppableId="pinned">
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-1"
                  >
                    {filteredNotes.pinnedNotes.map((note, index) => (
                      <Draggable
                        key={note.id}
                        draggableId={note.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <NoteItem
                              note={note}
                              onTogglePin={handleTogglePin}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}

          <Droppable droppableId="unpinned">
            {provided => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-1"
              >
                {filteredNotes.unpinnedNotes.map((note, index) => (
                  <Draggable key={note.id} draggableId={note.id} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <NoteItem
                          note={note}
                          onTogglePin={handleTogglePin}
                          isDragging={snapshot.isDragging}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
}
