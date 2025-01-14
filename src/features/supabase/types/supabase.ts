import { NoteContent } from '@/features/notes/types/schema';
import { SerializedEditorState, SerializedLexicalNode } from 'lexical';

// Database-specific types
export interface DatabaseNote {
  id: string;
  user_id: string;
  title: string;
  content: NoteContent;
  is_pinned: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseNoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  content: NoteContent;
  created_at: string;
}

export interface DatabaseTag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface DatabaseNoteTag {
  note_id: string;
  tag_id: string;
  created_at: string;
}

// Supabase schema type
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: DatabaseNote;
        Insert: Omit<DatabaseNote, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseNote, 'id' | 'created_at' | 'updated_at'>>;
      };
      note_versions: {
        Row: DatabaseNoteVersion;
        Insert: Omit<DatabaseNoteVersion, 'id' | 'created_at'>;
        Update: never; // Versions should never be updated
      };
      tags: {
        Row: DatabaseTag;
        Insert: Omit<DatabaseTag, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseTag, 'id' | 'created_at'>>;
      };
      note_tags: {
        Row: DatabaseNoteTag;
        Insert: Omit<DatabaseNoteTag, 'created_at'>;
        Update: never; // Junction table entries should never be updated
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}

export interface Note {
  id: string;
  title: string;
  content: {
    text: string;
    editorState: {
      type: string;
      content: SerializedEditorState<SerializedLexicalNode>;
      selection?: {
        anchor: number;
        focus: number;
        type: string;
      };
    };
  };
  is_pinned: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: string;
  font_size: number;
  line_spacing: number;
  created_at: string;
  updated_at: string;
}
