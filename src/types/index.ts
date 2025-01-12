export interface Note {
  id: string;
  title: string;
  content: string;
  maturity_state: "SEED" | "SAPLING" | "GROWTH" | "MATURE" | "EVOLVING";
  created_at: string;
  updated_at: string;
  connections?: Connection[];
  history?: VersionHistory[];
}

export interface Connection {
  id: string;
  note_from: string;
  note_to: string;
  connection_type: "related" | "prerequisite" | "refines";
  strength: number;
  bidirectional: boolean;
  context?: string;
  emergent: boolean;
  created_at: string;
}

export interface VersionHistory {
  id: string;
  note_id: string;
  content: string;
  version_number: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login: string;
}
