import { useQuery } from '@tanstack/react-query';
import { NoteService } from '../services/noteService';
import { Note } from '../types/schema';
import { supabase } from '@/features/supabase/lib/supabase';

const noteService = new NoteService(supabase);

export function useNotes() {
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: () => noteService.getNotes(),
  });

  return {
    notes,
    isLoading,
    error,
  };
}
