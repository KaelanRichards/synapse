export type MaturityState =
  | "SEED"
  | "SAPLING"
  | "GROWTH"
  | "MATURE"
  | "EVOLVING";

export type Note = {
  id: string;
  title: string;
  content: string;
  maturityState: MaturityState;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

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

export interface VersionHistory {
  id: string;
  content: string;
  versionId: string;
  versionNumber: number;
  createdAt: string;
  timestamp: string;
  changes: string;
}

export type ConnectionType = Connection["connectionType"];
