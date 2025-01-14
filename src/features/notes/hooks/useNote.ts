import { useQuery } from '@tanstack/react-query';
import { NoteService } from '../services/noteService';
import { Note } from '../types/schema';
import { supabase } from '@/features/supabase/lib/supabase';

const noteService = new NoteService(supabase);

export function useNote(noteId: string | undefined) {
  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: () => {
      if (!noteId) throw new Error('Note ID is required');
      return noteService.getNote(noteId);
    },
    enabled: !!noteId,
  });

  return {
    note,
    isLoading,
    error,
  };
}
