import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/features/supabase/lib/supabase';
import { Note } from '../types/note';

export function useNote(noteId: string | undefined) {
  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: async () => {
      if (!noteId) throw new Error('Note ID is required');

      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (noteError) throw noteError;

      return note;
    },
    enabled: !!noteId,
  });

  return {
    note,
    isLoading,
    error,
  };
}
