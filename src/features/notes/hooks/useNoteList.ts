import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/features/supabase/lib/supabase';
import { Note } from '../types/note';

export function useNoteList() {
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return {
    notes,
    isLoading,
    error,
  };
}
