import { useCallback, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Connection } from "@/types";
import { Database } from "@/types/supabase";

export function useConnections() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  const fetchConnections = useCallback(
    async (noteId?: string) => {
      if (!user) return [];

      try {
        setIsLoading(true);
        setError(null);

        const query = supabase
          .from("connections")
          .select("*")
          .order("created_at", { ascending: false });

        if (noteId) {
          query.or(`note_from.eq.${noteId},note_to.eq.${noteId}`);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((conn) => ({
          ...conn,
          noteFrom: conn.note_from,
          noteTo: conn.note_to,
          connectionType: conn.connection_type,
          createdAt: conn.created_at,
          userId: conn.user_id,
        })) as Connection[];
      } catch (err) {
        setError(err as Error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  const createConnection = useCallback(
    async (
      noteFrom: string,
      noteTo: string,
      connectionType: Connection["connectionType"],
      strength: number = 1,
      bidirectional: boolean = false,
      context?: string
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("connections")
          .insert([
            {
              note_from: noteFrom,
              note_to: noteTo,
              connection_type: connectionType,
              strength,
              bidirectional,
              context,
              emergent: false,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        const connection = {
          ...data,
          noteFrom: data.note_from,
          noteTo: data.note_to,
          connectionType: data.connection_type,
          createdAt: data.created_at,
          userId: data.user_id,
        } as Connection;

        // If bidirectional, create reverse connection
        if (bidirectional) {
          await supabase.from("connections").insert([
            {
              note_from: noteTo,
              note_to: noteFrom,
              connection_type: connectionType,
              strength,
              bidirectional,
              context,
              emergent: false,
              user_id: user.id,
            },
          ]);
        }

        return connection;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  const updateConnection = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Connection, "strength" | "context">>
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("connections")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return {
          ...data,
          noteFrom: data.note_from,
          noteTo: data.note_to,
          connectionType: data.connection_type,
          createdAt: data.created_at,
          userId: data.user_id,
        } as Connection;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  return {
    isLoading,
    error,
    fetchConnections,
    createConnection,
    updateConnection,
  };
}
