import { useQuery } from '@tanstack/react-query';
import { NoteService } from '../services/noteService';
import { Note } from '../types/schema';
import { supabase } from '@/features/supabase/lib/supabase';
import { noteKeys } from '../constants/queryKeys';

const noteService = new NoteService(supabase);

export function useNotes() {
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery<Note[]>({
    queryKey: noteKeys.lists(),
    queryFn: () => noteService.getNotes(),
  });

  return {
    notes,
    isLoading,
    error,
  };
}
