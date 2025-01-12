import { useCallback, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Connection } from "@/types";
import { Database } from "@/types/supabase";
import {
  snakeToCamelConnection,
  camelToSnakeConnection,
} from "@/lib/utils/case-mapping";

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

        return data.map(snakeToCamelConnection);
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
            camelToSnakeConnection({
              noteFrom,
              noteTo,
              connectionType,
              strength,
              bidirectional,
              context,
              emergent: false,
              userId: user.id,
            } as Connection),
          ])
          .select()
          .single();

        if (error) throw error;

        const connection = snakeToCamelConnection(data);

        // If bidirectional, create reverse connection
        if (bidirectional) {
          await supabase.from("connections").insert([
            camelToSnakeConnection({
              noteFrom: noteTo,
              noteTo: noteFrom,
              connectionType,
              strength,
              bidirectional,
              context,
              emergent: false,
              userId: user.id,
            } as Connection),
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
          .update(camelToSnakeConnection(updates as Connection))
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return snakeToCamelConnection(data);
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
