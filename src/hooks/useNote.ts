import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Note } from '@/types/supabase';
import { useEffect } from 'react';

const fetchNote = async (
  supabase: ReturnType<typeof useSupabase>,
  noteId: string
): Promise<Note> => {
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (noteError) throw noteError;
  return note;
};

export const useNote = (noteId: string | undefined) => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!noteId) return;

    // Subscribe to specific note changes
    const noteChannel = supabase
      .channel(`note-${noteId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `id=eq.${noteId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['note', noteId] });
        }
      )
      .subscribe();

    return () => {
      noteChannel.unsubscribe();
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
