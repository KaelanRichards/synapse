import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import type { CreateNoteData, UpdateNoteData, BaseNote } from '@/types/notes';

export function useNoteMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const createNote = useMutation({
    mutationFn: async (data: CreateNoteData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: note, error } = await supabase
        .from('notes')
        .insert([
          {
            user_id: user.user.id,
            title: data.title,
            content: data.content,
            maturity_state: data.maturity_state || 'SEED',
            is_pinned: data.is_pinned || false,
            display_order: data.display_order || Date.now(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return note as BaseNote;
    },
    onSuccess: note => {
      queryClient.setQueryData(['note', note.id], note);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async (data: UpdateNoteData) => {
      const { error } = await supabase
        .from('notes')
        .update({
          title: data.title,
          content: data.content,
          maturity_state: data.maturity_state,
          is_pinned: data.is_pinned,
          display_order: data.display_order,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
    },
    onSuccess: (_, noteId) => {
      queryClient.removeQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return { createNote, updateNote, deleteNote };
}
