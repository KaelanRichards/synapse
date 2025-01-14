import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '../types/note';
import { supabase } from '@/features/supabase/lib/supabase';

export function useNoteMutations() {
  const queryClient = useQueryClient();

  const createNote = async (note: Partial<Note>) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...note, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateNote = async ({
    id,
    ...note
  }: Partial<Note> & { id: string }) => {
    const { data, error } = await supabase
      .from('notes')
      .update(note)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  };

  const { mutateAsync: createNoteMutation } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const { mutateAsync: updateNoteMutation } = useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const { mutateAsync: deleteNoteMutation } = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    createNote: createNoteMutation,
    updateNote: updateNoteMutation,
    deleteNote: deleteNoteMutation,
  };
}
