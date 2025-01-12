import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function getNoteWithConnections(noteId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (noteError) throw noteError;

  const { data: connections, error: connError } = await supabase
    .from("connections")
    .select("*")
    .eq("note_from", noteId)
    .eq("user_id", user.id);

  if (connError) throw connError;

  const { data: versions, error: versionsError } = await supabase
    .from("note_versions")
    .select("*")
    .eq("note_id", noteId)
    .eq("user_id", user.id)
    .order("version_number", { ascending: false });

  if (versionsError) throw versionsError;

  return {
    ...note,
    connections,
    history: versions,
  };
}

export async function createNote(title: string, content: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .insert([
      {
        title,
        content,
        maturity_state: "SEED",
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (noteError) throw noteError;

  const { error: versionError } = await supabase.from("note_versions").insert([
    {
      note_id: note.id,
      content,
      version_number: 1,
      user_id: user.id,
    },
  ]);

  if (versionError) throw versionError;

  return note.id;
}

export async function updateNote(
  noteId: string,
  updates: {
    title?: string;
    content?: string;
    maturity_state?: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
  }
) {
  const { data: versions, error: versionsError } = await supabase
    .from("note_versions")
    .select("version_number")
    .eq("note_id", noteId)
    .order("version_number", { ascending: false })
    .limit(1);

  if (versionsError) throw versionsError;

  const nextVersionNumber =
    versions.length > 0 ? versions[0].version_number + 1 : 1;

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single();

  if (noteError) throw noteError;

  if (updates.content) {
    const { error: versionError } = await supabase
      .from("note_versions")
      .insert([
        {
          note_id: noteId,
          content: updates.content,
          version_number: nextVersionNumber,
        },
      ]);

    if (versionError) throw versionError;
  }

  return note;
}

export async function createConnection(
  noteFrom: string,
  noteTo: string,
  connectionType: "related" | "prerequisite" | "refines",
  strength: number = 1.0,
  bidirectional: boolean = false,
  context?: string,
  emergent: boolean = false
) {
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
        emergent,
      },
    ])
    .select();

  if (error) throw error;

  if (bidirectional) {
    const { error: reverseError } = await supabase.from("connections").insert([
      {
        note_from: noteTo,
        note_to: noteFrom,
        connection_type: connectionType,
        strength,
        bidirectional,
        context,
        emergent,
      },
    ]);

    if (reverseError) throw reverseError;
  }

  return data[0];
}

export async function searchNotes(query: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function getRecentNotes(limit: number = 5) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getNoteVersions(noteId: string) {
  const { data, error } = await supabase
    .from("note_versions")
    .select("*")
    .eq("note_id", noteId)
    .order("version_number", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createNoteVersion(
  noteId: string,
  content: string,
  versionNumber: number
) {
  const { data, error } = await supabase
    .from("note_versions")
    .insert([
      {
        note_id: noteId,
        content,
        version_number: versionNumber,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function revertToVersion(noteId: string, versionId: string) {
  const { data: version, error: versionError } = await supabase
    .from("note_versions")
    .select("content, version_number")
    .eq("id", versionId)
    .single();

  if (versionError) throw versionError;

  const { data: currentNote, error: noteError } = await supabase
    .from("notes")
    .select("content")
    .eq("id", noteId)
    .single();

  if (noteError) throw noteError;

  const { error: newVersionError } = await supabase
    .from("note_versions")
    .insert([
      {
        note_id: noteId,
        content: currentNote.content,
        version_number: version.version_number + 1,
      },
    ]);

  if (newVersionError) throw newVersionError;

  const { data: updatedNote, error: updateError } = await supabase
    .from("notes")
    .update({
      content: version.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select()
    .single();

  if (updateError) throw updateError;

  return updatedNote;
}
