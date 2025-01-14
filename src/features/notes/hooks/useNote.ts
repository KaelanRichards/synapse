import { useQuery } from '@tanstack/react-query';
import { NoteService } from '../services/noteService';
import { Note } from '../types/schema';
import { supabase } from '@/features/supabase/lib/supabase';
import { noteKeys } from '../constants/queryKeys';

const noteService = new NoteService(supabase);

export function useNote(noteId: string | undefined) {
  const {
    data: note,
    isLoading,
    error,
  } = useQuery<Note>({
    queryKey: noteKeys.detail(noteId ?? ''),
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
