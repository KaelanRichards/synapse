import React from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useQuery } from '@tanstack/react-query';
import { Select, Button, Card, Badge, Alert } from '@/components/ui';

type MaturityState = 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';

interface Note {
  id: string;
  title: string;
  maturity_state: MaturityState;
  created_at: string;
}

const MATURITY_OPTIONS = [
  { value: 'ALL', label: 'All States' },
  { value: 'SEED', label: 'Seed' },
  { value: 'SAPLING', label: 'Sapling' },
  { value: 'GROWTH', label: 'Growth' },
  { value: 'MATURE', label: 'Mature' },
  { value: 'EVOLVING', label: 'Evolving' },
] as const;

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="border rounded-lg p-4">
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="mt-2 h-3 bg-neutral-100 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

const NoteList: React.FC = () => {
  const supabase = useSupabase();
  const [filter, setFilter] = React.useState<MaturityState | 'ALL'>('ALL');

  const {
    data: notes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notes', filter],
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select('id, title, maturity_state, created_at')
        .order('created_at', { ascending: false });

      if (filter !== 'ALL') {
        query = query.eq('maturity_state', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const getMaturityVariant = (
    state: MaturityState
  ): 'default' | 'secondary' | 'success' | 'warning' | 'error' => {
    const variants = {
      SEED: 'success',
      SAPLING: 'default',
      GROWTH: 'warning',
      MATURE: 'secondary',
      EVOLVING: 'error',
    } as const;
    return variants[state];
  };

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
        <div className="w-48">
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value as MaturityState | 'ALL')}
          >
            {MATURITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Link href="/notes/new">
          <Button variant="primary">New Note</Button>
        </Link>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4">
            <LoadingSkeleton />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {(notes || []).map(note => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block hover:bg-neutral-50 transition-colors"
                >
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {note.title}
                      </p>
                      <Badge variant={getMaturityVariant(note.maturity_state)}>
                        {note.maturity_state}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500">
                        Created {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
            {(notes || []).length === 0 && (
              <li className="px-4 py-8 text-center text-neutral-500">
                No notes found. Create your first note!
              </li>
            )}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default NoteList;
