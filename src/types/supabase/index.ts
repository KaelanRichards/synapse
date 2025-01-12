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
          context?: string;
          emergent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_from: string;
          note_to: string;
          connection_type: "related" | "prerequisite" | "refines";
          strength?: number;
          bidirectional?: boolean;
          context?: string;
          emergent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_from?: string;
          note_to?: string;
          connection_type?: "related" | "prerequisite" | "refines";
          strength?: number;
          bidirectional?: boolean;
          context?: string;
          emergent?: boolean;
          created_at?: string;
        };
      };
      note_versions: {
        Row: {
          id: string;
          note_id: string;
          content: string;
          version_number: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          content: string;
          version_number: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          content?: string;
          version_number?: number;
          created_at?: string;
        };
      };
    };
  };
}
