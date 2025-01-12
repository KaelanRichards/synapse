export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          maturity_state: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          maturity_state?:
            | "SEED"
            | "SAPLING"
            | "GROWTH"
            | "MATURE"
            | "EVOLVING";
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          maturity_state?:
            | "SEED"
            | "SAPLING"
            | "GROWTH"
            | "MATURE"
            | "EVOLVING";
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          note_from: string;
          note_to: string;
          connection_type: "related" | "prerequisite" | "refines";
          strength: number;
          bidirectional: boolean;
          context: string | null;
          emergent: boolean;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          note_from: string;
          note_to: string;
          connection_type: "related" | "prerequisite" | "refines";
          strength?: number;
          bidirectional?: boolean;
          context?: string | null;
          emergent?: boolean;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          note_from?: string;
          note_to?: string;
          connection_type?: "related" | "prerequisite" | "refines";
          strength?: number;
          bidirectional?: boolean;
          context?: string | null;
          emergent?: boolean;
          created_at?: string;
          user_id?: string;
        };
      };
      note_versions: {
        Row: {
          id: string;
          note_id: string;
          version_number: number;
          content: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          version_number: number;
          content: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          version_number?: number;
          content?: string;
          created_at?: string;
          user_id?: string;
        };
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
