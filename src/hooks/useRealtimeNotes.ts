import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeNotes = () => {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to all note changes
    const notesChannel: RealtimeChannel = supabase
      .channel('notes_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        () => {
          // Invalidate and refetch notes queries
          queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
      )
      .subscribe();

    return () => {
      notesChannel.unsubscribe();
    };
  }, [supabase, queryClient]);
};
