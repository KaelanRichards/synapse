import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import {
  Note,
  Connection,
  NoteVersion,
  PartialNote,
  PartialConnection,
  PartialNoteVersion,
} from "@/lib/utils/case-mapping";
import {
  snakeToCamelNote,
  camelToSnakeNote,
  snakeToCamelConnection,
  camelToSnakeConnection,
  snakeToCamelNoteVersion,
  camelToSnakeNoteVersion,
} from "@/lib/utils/case-mapping";

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
    ...snakeToCamelNote(note),
    connections: connections.map(snakeToCamelConnection),
    history: versions.map(snakeToCamelNoteVersion),
  };
}

export async function createNote(data: {
  title: string;
  content: string;
  maturityState?: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const noteData = camelToSnakeNote({
    title: data.title,
    content: data.content,
    maturityState: data.maturityState ?? "SEED",
    userId: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as PartialNote);

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .insert([noteData])
    .select()
    .single();

  if (noteError) throw noteError;

  const versionData = camelToSnakeNoteVersion({
    noteId: note.id,
    content: data.content,
    versionNumber: 1,
    userId: user.id,
    createdAt: new Date().toISOString(),
  } as PartialNoteVersion);

  const { error: versionError } = await supabase
    .from("note_versions")
    .insert([versionData]);

  if (versionError) throw versionError;

  return note.id;
}

export async function updateNote(
  noteId: string,
  updates: {
    title?: string;
    content?: string;
    maturityState?: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
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

  const noteUpdates = camelToSnakeNote({
    ...updates,
    updatedAt: new Date().toISOString(),
  } as PartialNote);

  const { data: note, error: noteError } = await supabase
    .from("notes")
    .update(noteUpdates)
    .eq("id", noteId)
    .select()
    .single();

  if (noteError) throw noteError;

  if (updates.content) {
    const versionData = camelToSnakeNoteVersion({
      noteId,
      content: updates.content,
      versionNumber: nextVersionNumber,
      createdAt: new Date().toISOString(),
    } as PartialNoteVersion);

    const { error: versionError } = await supabase
      .from("note_versions")
      .insert([versionData]);

    if (versionError) throw versionError;
  }

  return snakeToCamelNote(note);
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const connectionData = camelToSnakeConnection({
    noteFrom,
    noteTo,
    connectionType,
    strength,
    bidirectional,
    context,
    emergent,
    userId: user.id,
    createdAt: new Date().toISOString(),
  } as PartialConnection);

  const { data, error } = await supabase
    .from("connections")
    .insert([connectionData])
    .select();

  if (error) throw error;

  if (bidirectional) {
    const reverseConnectionData = camelToSnakeConnection({
      noteFrom: noteTo,
      noteTo: noteFrom,
      connectionType,
      strength,
      bidirectional,
      context,
      emergent,
      userId: user.id,
      createdAt: new Date().toISOString(),
    } as PartialConnection);

    const { error: reverseError } = await supabase
      .from("connections")
      .insert([reverseConnectionData]);

    if (reverseError) throw reverseError;
  }

  return snakeToCamelConnection(data[0]);
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
  return data.map(snakeToCamelNote);
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
  return data.map(snakeToCamelNote);
}

export async function getNoteVersions(noteId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("note_versions")
    .select("*")
    .eq("note_id", noteId)
    .eq("user_id", user.id)
    .order("version_number", { ascending: false });

  if (error) throw error;
  return data.map(snakeToCamelNoteVersion);
}

export async function createNoteVersion(
  noteId: string,
  content: string,
  versionNumber: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const versionData = camelToSnakeNoteVersion({
    noteId,
    content,
    versionNumber,
    userId: user.id,
    createdAt: new Date().toISOString(),
  } as PartialNoteVersion);

  const { data, error } = await supabase
    .from("note_versions")
    .insert([versionData])
    .select();

  if (error) throw error;
  return snakeToCamelNoteVersion(data[0]);
}

export async function revertToVersion(noteId: string, versionId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: version, error: versionError } = await supabase
    .from("note_versions")
    .select("content, version_number")
    .eq("id", versionId)
    .eq("user_id", user.id)
    .single();

  if (versionError) throw versionError;

  const { data: currentNote, error: noteError } = await supabase
    .from("notes")
    .select("content")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (noteError) throw noteError;

  const newVersionData = camelToSnakeNoteVersion({
    noteId,
    content: currentNote.content,
    versionNumber: version.version_number + 1,
    userId: user.id,
    createdAt: new Date().toISOString(),
  } as PartialNoteVersion);

  const { error: newVersionError } = await supabase
    .from("note_versions")
    .insert([newVersionData]);

  if (newVersionError) throw newVersionError;

  const noteUpdates = camelToSnakeNote({
    content: version.content,
    updatedAt: new Date().toISOString(),
  } as PartialNote);

  const { data: updatedNote, error: updateError } = await supabase
    .from("notes")
    .update(noteUpdates)
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) throw updateError;

  return snakeToCamelNote(updatedNote);
}
