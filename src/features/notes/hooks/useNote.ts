import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/features/supabase/lib/supabase';
import { Note, Connection } from '../types/note';

interface NoteWithConnections extends Note {
  connections: Connection[];
}

export function useNote(noteId: string | undefined) {
  const {
    data: note,
    isLoading,
    error,
  } = useQuery<NoteWithConnections>({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId) throw new Error('Note ID is required');

      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (noteError) throw noteError;

      const { data: connections, error: connError } = await supabase
        .from('connections')
        .select('*')
        .eq('note_from', noteId);

      if (connError) throw connError;

      return { ...note, connections: connections || [] };
    },
    enabled: !!noteId,
  });

  return {
    note,
    isLoading,
    error,
  };
}
