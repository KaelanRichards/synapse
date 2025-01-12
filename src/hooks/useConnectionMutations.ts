import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/contexts/SupabaseContext';
import type { Connection, ConnectionType } from '@/types/supabase';

interface CreateConnectionData {
  note_from: string;
  note_to: string;
  connection_type: ConnectionType;
  strength?: number;
  bidirectional?: boolean;
  context?: string;
  emergent?: boolean;
}

interface UpdateConnectionData {
  id: string;
  connection_type?: ConnectionType;
  strength?: number;
  bidirectional?: boolean;
  context?: string;
  emergent?: boolean;
}

export function useConnectionMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const createConnection = useMutation({
    mutationFn: async (data: CreateConnectionData) => {
      const { data: connection, error } = await supabase
        .from('connections')
        .insert([
          {
            ...data,
            strength: data.strength || 1.0,
            bidirectional: data.bidirectional || false,
            emergent: data.emergent || false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // If bidirectional, create reverse connection
      if (data.bidirectional) {
        const { error: reverseError } = await supabase
          .from('connections')
          .insert([
            {
              note_from: data.note_to,
              note_to: data.note_from,
              connection_type: data.connection_type,
              strength: data.strength || 1.0,
              bidirectional: true,
              context: data.context,
              emergent: data.emergent || false,
            },
          ])
          .select()
          .single();

        if (reverseError) throw reverseError;
      }

      return connection;
    },
    onSuccess: data => {
      // Invalidate affected notes and their connections
      queryClient.invalidateQueries({ queryKey: ['note', data.note_from] });
      queryClient.invalidateQueries({ queryKey: ['note', data.note_to] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const updateConnection = useMutation({
    mutationFn: async ({ id, ...data }: UpdateConnectionData) => {
      const { data: connection, error } = await supabase
        .from('connections')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return connection;
    },
    onSuccess: data => {
      // Invalidate affected notes and their connections
      queryClient.invalidateQueries({ queryKey: ['note', data.note_from] });
      queryClient.invalidateQueries({ queryKey: ['note', data.note_to] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const deleteConnection = useMutation({
    mutationFn: async (id: string) => {
      const { data: connection, error: fetchError } = await supabase
        .from('connections')
        .select()
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: deleteError } = await supabase
        .from('connections')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // If bidirectional, delete reverse connection
      if (connection.bidirectional) {
        const { error: reverseError } = await supabase
          .from('connections')
          .delete()
          .eq('note_from', connection.note_to)
          .eq('note_to', connection.note_from);

        if (reverseError) throw reverseError;
      }

      return connection;
    },
    onSuccess: data => {
      // Invalidate affected notes and their connections
      queryClient.invalidateQueries({ queryKey: ['note', data.note_from] });
      queryClient.invalidateQueries({ queryKey: ['note', data.note_to] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  return {
    createConnection,
    updateConnection,
    deleteConnection,
  };
}
