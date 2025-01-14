import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui';
import {
  SortField,
  SortOrder,
} from '@/features/notes/components/NoteList/types';

interface SortControlsProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function SortControls({
  sortField,
  sortOrder,
  onSort,
}: SortControlsProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={sortField === 'title' ? 'primary' : 'ghost'}
        onClick={() => onSort('title')}
        className="flex items-center gap-1"
      >
        Title
        <ChevronUpDownIcon className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={sortField === 'updated_at' ? 'primary' : 'ghost'}
        onClick={() => onSort('updated_at')}
        className="flex items-center gap-1"
      >
        Last Updated
        <ChevronUpDownIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
