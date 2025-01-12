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
          maturityState: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
          createdAt: string;
          updatedAt: string;
          userId: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          maturityState?: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
          createdAt?: string;
          updatedAt?: string;
          userId: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          maturityState?: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
          createdAt?: string;
          updatedAt?: string;
          userId?: string;
        };
      };
      connections: {
        Row: {
          id: string;
          noteFrom: string;
          noteTo: string;
          connectionType: "related" | "prerequisite" | "refines";
          strength: number;
          bidirectional: boolean;
          context: string | null;
          emergent: boolean;
          createdAt: string;
          userId: string;
        };
        Insert: {
          id?: string;
          noteFrom: string;
          noteTo: string;
          connectionType: "related" | "prerequisite" | "refines";
          strength?: number;
          bidirectional?: boolean;
          context?: string | null;
          emergent?: boolean;
          createdAt?: string;
          userId: string;
        };
        Update: {
          id?: string;
          noteFrom?: string;
          noteTo?: string;
          connectionType?: "related" | "prerequisite" | "refines";
          strength?: number;
          bidirectional?: boolean;
          context?: string | null;
          emergent?: boolean;
          createdAt?: string;
          userId?: string;
        };
      };
      noteVersions: {
        Row: {
          id: string;
          noteId: string;
          versionNumber: number;
          content: string;
          createdAt: string;
          userId: string;
        };
        Insert: {
          id?: string;
          noteId: string;
          versionNumber: number;
          content: string;
          createdAt?: string;
          userId: string;
        };
        Update: {
          id?: string;
          noteId?: string;
          versionNumber?: number;
          content?: string;
          createdAt?: string;
          userId?: string;
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
