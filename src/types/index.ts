export interface Note {
  id: string;
  title: string;
  content: string;
  maturityState: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Connection {
  id: string;
  noteFrom: string;
  noteTo: string;
  connectionType: "related" | "prerequisite" | "refines";
  strength: number;
  bidirectional: boolean;
  context?: string;
  emergent: boolean;
  createdAt: string;
  userId: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  versionNumber: number;
  content: string;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export type MaturityState = Note["maturityState"];
export type ConnectionType = Connection["connectionType"];
