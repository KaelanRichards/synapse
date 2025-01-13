export interface Note {
  id: string;
  title: string;
  content: string;
  maturity_state: 'SEED' | 'SAPLING' | 'GROWTH' | 'MATURE' | 'EVOLVING';
  created_at: string;
  updated_at: string;
}

export interface NoteVersion {
  id: string;
  note_id: string;
  version_number: number;
  content: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: Note;
        Insert: Partial<Note>;
        Update: Partial<Note>;
      };
      note_versions: {
        Row: NoteVersion;
        Insert: Partial<NoteVersion>;
        Update: Partial<NoteVersion>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
