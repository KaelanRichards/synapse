import React, { useEffect } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Badge, Alert } from '@/components/ui';

interface Connection {
  id: string;
  connection_type: 'related' | 'prerequisite' | 'refines';
  context: string;
  note_from: string;
  note_to: string;
  strength: number;
  bidirectional: boolean;
  emergent: boolean;
  created_at: string;
}

interface ConnectionManagerProps {
  noteId: string;
}

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2].map(i => (
      <div key={i} className="border rounded-lg p-4">
        <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ noteId }) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('connections')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `note_from=eq.${noteId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['connections', noteId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [noteId, queryClient, supabase]);

  const {
    data: connections,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['connections', noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('note_from', noteId);

      if (error) throw error;
      return (data || []) as Connection[];
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  if (error) {
    return (
      <Alert variant="error">
        <h3 className="font-medium">Error loading connections</h3>
        <p>
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred'}
        </p>
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Connections</h3>
      {isLoading ? (
        <div className="mt-4">
          <LoadingSkeleton />
        </div>
      ) : (connections || []).length === 0 ? (
        <p className="text-neutral-500 mt-2">No connections yet</p>
      ) : (
        <div className="space-y-4">
          {(connections || []).map(connection => (
            <Card key={connection.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">
                    {connection.connection_type}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {connection.context}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {connection.bidirectional && (
                    <Badge variant="default">Bidirectional</Badge>
                  )}
                  {connection.emergent && (
                    <Badge variant="secondary">Emergent</Badge>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${(connection.strength / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Strength: {connection.strength}/10
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionManager;
