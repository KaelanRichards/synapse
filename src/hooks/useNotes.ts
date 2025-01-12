import { useCallback, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Note } from "@/types";
import { Database } from "@/types/supabase";
import { snakeToCamelNote, camelToSnakeNote } from "@/lib/utils/case-mapping";

export function useNotes() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  const fetchNotes = useCallback(async () => {
    if (!user) return [];

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(snakeToCamelNote);
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  const createNote = useCallback(
    async (
      title: string,
      content: string,
      maturityState: Note["maturityState"] = "SEED"
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("notes")
          .insert([
            camelToSnakeNote({
              title,
              content,
              maturityState,
              userId: user.id,
            } as Note),
          ])
          .select()
          .single();

        if (error) throw error;

        return snakeToCamelNote(data);
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, user]
  );

  const updateNote = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Note, "title" | "content" | "maturityState">>
    ) => {
      if (!user) throw new Error("User not authenticated");

      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("notes")
          .update(
            camelToSnakeNote({
              ...updates,
              updatedAt: new Date().toISOString(),
            } as Note)
          )
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return snakeToCamelNote(data);
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
    fetchNotes,
    createNote,
    updateNote,
  };
}
