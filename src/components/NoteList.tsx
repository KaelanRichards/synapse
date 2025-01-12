import React from 'react';
import Link from 'next/link';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useQuery } from '@tanstack/react-query';
import { Select, Button, Alert } from '@/components/ui';

type MaturityState = 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';

interface Note {
  id: string;
  title: string;
  maturity_state: MaturityState;
  created_at: string;
  content: string;
}

const MATURITY_OPTIONS = [
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
        .select('id, title, content, maturity_state, created_at')
        .order('updated_at', { ascending: false });

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

  if (error) {
    return (
      <Alert
        variant="error"
        className="max-w-3xl mx-auto mt-8 bg-error-50 text-error-700 border border-error-200 rounded-lg p-4"
      >
        <h3 className="font-medium">Error loading notes</h3>
        <p>
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
      </Alert>
    );
  }

  const getPreviewText = (content: string) => {
    return content.length > 200 ? content.slice(0, 200) + '...' : content;
  };

  return (
    <div className="h-full py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="relative group">
            <Select
              value={filter}
              onChange={e => setFilter(e.target.value as MaturityState | 'ALL')}
              className="
                w-48 bg-transparent border border-accent-200 rounded-lg
                text-accent-700 focus:ring-1 focus:ring-accent-300
                transition-shadow duration-medium
              "
            >
              {MATURITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </Select>
            <div className="absolute left-0 w-64 mt-2 py-2 px-3 bg-white dark:bg-gray-800 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-medium pointer-events-none z-10">
              {MATURITY_OPTIONS.find(opt => opt.value === filter)?.description}
            </div>
          </div>

          <Link href="/notes/new">
            <Button
              variant="primary"
              className="
                bg-accent-600 hover:bg-accent-700 text-white
                px-6 py-2 rounded-lg shadow-sm
                transition-all duration-medium
              "
            >
              New Note
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {(notes || []).map(note => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className={`
                  block p-6 rounded-lg bg-white dark:bg-gray-800
                  border border-accent-100 dark:border-gray-700
                  hover:shadow-lg transition-all duration-medium
                  note-state-${note.maturity_state.toLowerCase()}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-serif text-accent-900 dark:text-accent-100">
                    {note.title}
                  </h3>
                  <span className="text-sm text-accent-500">
                    {
                      MATURITY_OPTIONS.find(
                        opt => opt.value === note.maturity_state
                      )?.icon
                    }
                  </span>
                </div>
                <p className="text-accent-600 dark:text-accent-300 line-clamp-3 font-serif leading-relaxed">
                  {getPreviewText(note.content)}
                </p>
                <div className="mt-3 text-sm text-accent-400 dark:text-accent-500">
                  {new Date(note.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </Link>
            ))}
            {(notes || []).length === 0 && (
              <div className="text-center py-16 text-accent-500 col-span-full">
                <p className="text-xl mb-4">
                  Your library awaits its first note
                </p>
                <p className="text-sm">
                  Begin your journey of connected thoughts
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;
