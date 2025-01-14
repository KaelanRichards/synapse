import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NoteService } from '../services/noteService';
import { CreateNoteInput, UpdateNoteInput, Note } from '../types/schema';
import { supabase } from '@/features/supabase/lib/supabase';
import { noteKeys } from '../constants/queryKeys';

const noteService = new NoteService(supabase);

export function useNoteMutations() {
  const queryClient = useQueryClient();

  const { mutateAsync: createNote } = useMutation({
    mutationFn: (note: CreateNoteInput) => noteService.createNote(note),
    onSuccess: newNote => {
      queryClient.setQueryData<Note[]>(noteKeys.lists(), (old = []) => [
        newNote,
        ...old,
      ]);
    },
  });

  const { mutateAsync: updateNote } = useMutation({
    mutationFn: (note: UpdateNoteInput) => noteService.updateNote(note),
    onMutate: async updatedNote => {
      await queryClient.cancelQueries({
        queryKey: noteKeys.detail(updatedNote.id),
      });
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      const previousNote = queryClient.getQueryData<Note>(
        noteKeys.detail(updatedNote.id)
      );
      const previousNotes = queryClient.getQueryData<Note[]>(noteKeys.lists());

      if (previousNote) {
        queryClient.setQueryData<Note>(noteKeys.detail(updatedNote.id), {
          ...previousNote,
          ...updatedNote,
        });
      }

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          noteKeys.lists(),
          previousNotes.map(note =>
            note.id === updatedNote.id ? { ...note, ...updatedNote } : note
          )
        );
      }

      return { previousNote, previousNotes };
    },
    onError: (err, newNote, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(
          noteKeys.detail(newNote.id),
          context.previousNote
        );
      }
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
    },
    onSettled: data => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: noteKeys.detail(data.id) });
        queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      }
    },
  });

  const { mutateAsync: deleteNote } = useMutation({
    mutationFn: (noteId: string) => noteService.deleteNote(noteId),
    onMutate: async noteId => {
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });
      const previousNotes = queryClient.getQueryData<Note[]>(noteKeys.lists());

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          noteKeys.lists(),
          previousNotes.filter(note => note.id !== noteId)
        );
      }

      return { previousNotes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });

  return {
    createNote,
    updateNote,
    deleteNote,
  };
}
