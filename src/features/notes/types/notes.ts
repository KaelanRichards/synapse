import type { DatabaseNote, DatabaseConnection } from './supabase';

// Core types
export type NoteMaturityState =
  | 'SEED'
  | 'SAPLING'
  | 'GROWTH'
  | 'MATURE'
  | 'EVOLVING';

export type ConnectionType = 'related' | 'prerequisite' | 'refines';
export type MaturityFilter = NoteMaturityState | 'ALL';
export type SortOption = 'recent' | 'title' | 'maturity' | 'manual';

// Editor-specific types
export interface NoteContent {
  text: string;
  editorState: Record<string, any>;
}

// Note types for different contexts
export type BaseNote = DatabaseNote;
export interface NoteWithConnections extends DatabaseNote {
  connections: DatabaseConnection[];
}

export interface EditorNote {
  id: string;
  content?: NoteContent;
  is_pinned?: boolean;
  display_order?: number;
}

// Mutation types
export interface CreateNoteData {
  title: string;
  content: NoteContent;
  maturity_state?: NoteMaturityState;
  is_pinned?: boolean;
  display_order?: number;
}

export interface UpdateNoteData {
  id: string;
  title?: string;
  content?: NoteContent;
  maturity_state?: NoteMaturityState;
  is_pinned?: boolean;
  display_order?: number;
}

// UI types
export interface MaturityOption {
  value: MaturityFilter;
  label: string;
  icon: string;
  description: string;
}

// Constants
export const MATURITY_OPTIONS: readonly MaturityOption[] = [
  {
    value: 'ALL',
    label: 'All Notes',
    icon: '📚',
    description: 'View your complete collection',
  },
  {
    value: 'SEED',
    label: 'Seeds',
    icon: '🌱',
    description: 'Initial thoughts and ideas',
  },
  {
    value: 'SAPLING',
    label: 'Saplings',
    icon: '🌿',
    description: 'Growing and taking shape',
  },
  {
    value: 'GROWTH',
    label: 'Growth',
    icon: '🌳',
    description: 'Developing connections',
  },
  {
    value: 'MATURE',
    label: 'Mature',
    icon: '📖',
    description: 'Well-developed thoughts',
  },
  {
    value: 'EVOLVING',
    label: 'Evolving',
    icon: '🔄',
    description: 'Continuously updating',
  },
] as const;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'manual', label: 'Manual Order' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'title', label: 'Title A-Z' },
  { value: 'maturity', label: 'By Maturity' },
];
