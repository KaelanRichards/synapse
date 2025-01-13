import { Note as SupabaseNote } from './supabase';

export type MaturityState =
  | 'SEED'
  | 'SAPLING'
  | 'GROWTH'
  | 'MATURE'
  | 'EVOLVING';
export type MaturityFilter = MaturityState | 'ALL';
export type SortOption = 'recent' | 'title' | 'maturity' | 'manual';

export interface Note extends SupabaseNote {
  is_pinned?: boolean;
  display_order: number;
}

export interface MaturityOption {
  value: MaturityFilter;
  label: string;
  icon: string;
  description: string;
}

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
