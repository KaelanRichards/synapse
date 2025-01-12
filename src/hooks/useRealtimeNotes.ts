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

    // Subscribe to all connection changes
    const connectionsChannel: RealtimeChannel = supabase
      .channel('connections_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        () => {
          // Invalidate both notes and connections queries since they're related
          queryClient.invalidateQueries({ queryKey: ['notes'] });
          queryClient.invalidateQueries({ queryKey: ['connections'] });
        }
      )
      .subscribe();

    return () => {
      notesChannel.unsubscribe();
      connectionsChannel.unsubscribe();
    };
  }, [supabase, queryClient]);
};
