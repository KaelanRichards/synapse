import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NoteService } from '../services/noteService';
import { CreateNoteInput, UpdateNoteInput } from '../types/schema';
import { supabase } from '@/features/supabase/lib/supabase';

const noteService = new NoteService(supabase);

export function useNoteMutations() {
  const queryClient = useQueryClient();

  const { mutateAsync: createNote } = useMutation({
    mutationFn: (note: CreateNoteInput) => noteService.createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const { mutateAsync: updateNote } = useMutation({
    mutationFn: (note: UpdateNoteInput) => noteService.updateNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note'] });
    },
  });

  const { mutateAsync: deleteNote } = useMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note'] });
    },
  });

  return {
    createNote,
    updateNote,
    deleteNote,
  };
}
