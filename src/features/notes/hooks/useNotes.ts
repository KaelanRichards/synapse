import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import { NoteService } from '../services/noteService';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useApiMutation } from '@/shared/hooks/useApiMutation';
import type {
  BaseNote,
  NoteWithConnections,
  CreateNoteInput,
  UpdateNoteInput,
} from '../types/schema';

export function useNotes() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const noteService = new NoteService(supabase);

  const {
    data: notes,
    isLoading: isLoadingNotes,
    error: notesError,
  } = useApiQuery(['notes'], {
    queryFn: () => noteService.getNotes(),
  });

  const createNote = useApiMutation({
    mutationFn: (input: CreateNoteInput) => noteService.createNote(input),
    onSuccess: newNote => {
      queryClient.setQueryData(['note', newNote.id], newNote);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNote = useApiMutation({
    mutationFn: (input: UpdateNoteInput) => noteService.updateNote(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNote = useApiMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId),
    onSuccess: (_, noteId) => {
      queryClient.removeQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes,
    isLoadingNotes,
    notesError,
    createNote,
    updateNote,
    deleteNote,
  };
}

export function useNote(noteId: string) {
  const supabase = useSupabase();
  const noteService = new NoteService(supabase);

  const {
    data: note,
    isLoading,
    error,
  } = useApiQuery(['note', noteId], {
    queryFn: () => noteService.getNoteWithConnections(noteId),
    enabled: !!noteId,
  });

  return {
    note,
    isLoading,
    error,
  };
}
