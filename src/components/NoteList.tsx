import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, Button, Alert } from '@/components/ui';

type MaturityState = 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
type MaturityFilter = MaturityState | 'ALL';

interface Note {
  id: string;
  title: string;
  maturity_state: MaturityState;
  created_at: string;
  content: string;
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

const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse">
        <div className="h-6 bg-accent-100 rounded-sm w-3/4 mb-2"></div>
        <div className="h-16 bg-accent-50 rounded-sm w-full"></div>
      </div>
    ))}
  </div>
);

export default function NoteList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [selectedMaturity, setSelectedMaturity] =
    useState<MaturityFilter>('ALL');

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
        .order('created_at', { ascending: false });

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

  if (error) {
    return (
      <Alert variant="error">
        <h3 className="font-medium">Error loading notes</h3>
        <p>
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select
          value={selectedMaturity}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelectedMaturity(e.target.value as MaturityFilter)
          }
          className="w-48"
        >
          {MATURITY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </Select>
        <Link href="/notes/new">
          <Button variant="primary">New Note</Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : notes?.length === 0 ? (
        <div className="text-center py-8 text-ink-faint">
          <p>No notes found</p>
          {selectedMaturity !== 'ALL' && (
            <p className="mt-2">
              Try selecting a different maturity state or{' '}
              <button
                onClick={() => setSelectedMaturity('ALL')}
                className="text-primary-600 hover:underline"
              >
                view all notes
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {notes?.map(note => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block p-4 rounded-lg border border-accent-200 hover:border-accent-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-lg">{note.title}</h3>
                <span className="text-sm text-ink-faint">
                  {
                    MATURITY_OPTIONS.find(
                      opt => opt.value === note.maturity_state
                    )?.icon
                  }
                </span>
              </div>
              <p className="text-ink-faint line-clamp-2">{note.content}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
