import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import { DatabaseNote } from '@/types/supabase';
import { useEffect } from 'react';

const fetchNote = async (
  supabase: ReturnType<typeof useSupabase>,
  noteId: string
): Promise<DatabaseNote> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', user.user.id)
    .single();

  if (noteError) throw noteError;
  return note;
};

export const useNote = (noteId: string | undefined) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  // Prefetch related notes
  useEffect(() => {
    if (!noteId) return;

    const prefetchRelatedNotes = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get connections for the current note
      const { data: connections } = await supabase
        .from('connections')
        .select('note_to, note_from')
        .or(`note_from.eq.${noteId},note_to.eq.${noteId}`);

      if (!connections) return;

      // Get unique related note IDs
      const relatedNoteIds = Array.from(
        new Set(connections.flatMap(conn => [conn.note_from, conn.note_to]))
      ).filter(id => id !== noteId);

      // Prefetch each related note
      relatedNoteIds.forEach(id => {
        queryClient.prefetchQuery({
          queryKey: ['note', id],
          queryFn: () => fetchNote(supabase, id),
        });
      });
    };

    prefetchRelatedNotes();
  }, [noteId, queryClient, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    if (!noteId) return;

    const setupSubscription = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      // Subscribe to specific note changes
      return supabase
        .channel(`note-${noteId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notes',
            filter: `id=eq.${noteId} AND user_id=eq.${user.user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['note', noteId] });
          }
        )
        .subscribe();
    };

    let subscription: ReturnType<typeof supabase.channel> | null = null;
    setupSubscription().then(sub => {
      if (sub) subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [noteId, queryClient, supabase]);

  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => fetchNote(supabase, noteId!),
    enabled: !!noteId,
    staleTime: 1000 * 30, // Consider data stale after 30 seconds
    cacheTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
  });
};
