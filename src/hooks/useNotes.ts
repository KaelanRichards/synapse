import { useCallback, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Note } from "@/types";
import { Database } from "@/types/supabase";

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

      return data.map((note) => ({
        ...note,
        maturityState: note.maturity_state,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        userId: note.user_id,
      })) as Note[];
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
            {
              title,
              content,
              maturity_state: maturityState,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        return {
          ...data,
          maturityState: data.maturity_state,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          userId: data.user_id,
        } as Note;
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
          .update({
            ...(updates.title && { title: updates.title }),
            ...(updates.content && { content: updates.content }),
            ...(updates.maturityState && {
              maturity_state: updates.maturityState,
            }),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return {
          ...data,
          maturityState: data.maturity_state,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          userId: data.user_id,
        } as Note;
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
