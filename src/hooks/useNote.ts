import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Note, Connection } from "@/types/supabase";

interface NoteWithConnections extends Note {
  connections: Connection[];
}

const fetchNoteWithConnections = async (
  supabase: ReturnType<typeof useSupabase>,
  noteId: string
): Promise<NoteWithConnections> => {
  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .single();

  if (noteError) throw noteError;

  const { data: connections, error: connError } = await supabase
    .from("connections")
    .select("*")
    .eq("note_from", noteId);

  if (connError) throw connError;

  return { ...note, connections: connections || [] };
};

export const useNote = (noteId: string | undefined) => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => fetchNoteWithConnections(supabase, noteId!),
    enabled: !!noteId,
  });
};
