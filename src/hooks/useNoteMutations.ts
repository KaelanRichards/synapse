import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import type { Note } from '@/types/supabase';

interface CreateNoteData {
  title: string;
  content: string;
  maturity_state?: Note['maturity_state'];
}

interface UpdateNoteData {
  id: string;
  title?: string;
  content?: string;
  maturity_state?: Note['maturity_state'];
}

export function useNoteMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const createNote = useMutation({
    mutationFn: async (data: CreateNoteData) => {
      const { data: note, error } = await supabase
        .from('notes')
        .insert([
          {
            ...data,
            maturity_state: data.maturity_state || 'SEED',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return note;
    },
    onSuccess: () => {
      // Invalidate notes list queries
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, ...data }: UpdateNoteData) => {
      const { data: note, error } = await supabase
        .from('notes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return note;
    },
    onSuccess: data => {
      // Invalidate specific note and notes list queries
      queryClient.invalidateQueries({ queryKey: ['note', data.id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: id => {
      // Invalidate specific note and notes list queries
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    createNote,
    updateNote,
    deleteNote,
  };
}
